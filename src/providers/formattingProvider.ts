import * as vscode from 'vscode';
import { ConfigKey, Global } from '../common/global';
import { FormatOptions } from './formattingProvider.types';
import {
    buildIndentedLine,
    documentToString,
    hasMoreCloseParens,
    hasMoreOpenParens,
    purify,
    removeEmptyLines,
    trimExtraSpaces,
} from './formattingProvider.utils';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    );
}

export const internalFormat = (
    stringToFormat: string,
    options: FormatOptions,
): string => {
    /** Special keywords that can trigger one-line commands */
    const oneCommandList = [
        'ifnotexist',
        'ifexist',
        'ifwinactive',
        'ifwinnotactive',
        'ifwinexist',
        'ifwinnotexist',
        'ifinstring',
        'ifnotinstring',
        'if',
        'else',
        'loop',
        'for',
        'while',
        'catch',
    ];

    let formattedString = '';
    /** Current level of indentation. 0 = top-level, no indentation */
    let depth = 0;
    /** ??? */
    let tagDepth = 0;
    /**
     * True iff this line MAY be a one-statement block
     * e.g.
     * ```ahk
     * ; <start script>
     * for n, param in A_Args ; false
     * { ; true
     *    fileExist:=fileExist(param) ; false
     *  ```
     */
    let oneCommandCode = false;
    let blockComment = false;
    /** Base indent, that block comment had in original code */
    let blockCommentIndent = '';
    let atTopLevel = true;
    /** Formatter's directive:
     * ```ahk
     * ;@AHK++FormatBlockCommentOn
     * ;@AHK++FormatBlockCommentOff
     * ```
     * Format text inside block comment like regular code */
    let formatBlockComment = false;
    // Save important values to this variables on block comment enter, restore them on exit
    let preBlockCommentDepth = 0;
    let preBlockCommentTagDepth = 0;
    let preBlockCommentAtTopLevel = true;
    let preBlockCommentOneCommandCode = false;

    const preserveIndentOnEmptyString = options.preserveIndent;
    const trimSpaces = options.trimExtraSpaces;

    /** Label name may consist of any characters other than `space`,
     * `tab`, `comma` and the escape character (`).
     * Generally, aside from whitespace and comments,
     * no other code can be written on the same line as a label.
     */
    const label = /^\s*[^\s\t,`]+:\s*$/;

    const lines = stringToFormat.split('\n');

    lines.forEach((originalLine, lineIndex) => {
        const purifiedLine = purify(originalLine).toLowerCase();
        /** The line comment. Empty string if no line comment exists */
        const comment = /;.+/.exec(originalLine)?.[0] ?? '';
        let formattedLine = originalLine.replace(/;.+/, ''); // Remove single line comment
        formattedLine = trimExtraSpaces(formattedLine, trimSpaces) // Remove extra spaces between words
            .concat(comment) // Add removed single line comment back
            .trim();
        /** Line is empty or this is single comment line */
        const emptyLine = purifiedLine === '';

        atTopLevel = true;

        const moreCloseParens = hasMoreCloseParens(purifiedLine);
        const moreOpenParens = hasMoreOpenParens(purifiedLine);

        // This line

        // Stop directives for formatter
        if (emptyLine) {
            if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOff/i)) {
                formatBlockComment = false;
            }
        }

        // Block comments
        // The /* and */ symbols can be used to comment out an entire section,
        // but only if the symbols appear at the beginning of a line (excluding whitespace),
        // as in this example:
        // /*
        // MsgBox, This line is commented out (disabled).
        // MsgBox, Common mistake: */ this does not end the comment.
        // MsgBox, This line is commented out.
        // */
        if (!blockComment && originalLine.match(/^\s*\/\*/)) {
            // found start '/*' pattern
            blockComment = true;
            // Save first capture group (original indent)
            blockCommentIndent = originalLine.match(/(^\s*)\/\*/)?.[1];
            if (formatBlockComment) {
                // save indent values on block comment enter
                preBlockCommentDepth = depth;
                preBlockCommentTagDepth = tagDepth;
                preBlockCommentAtTopLevel = atTopLevel;
                preBlockCommentOneCommandCode = oneCommandCode;
                // reset indent values to default values with added current 'depth' indent
                oneCommandCode = false;
            }
        }

        if (blockComment) {
            // Save block comment line only if user don't want format it content
            if (!formatBlockComment) {
                let blockCommentLine = '';
                if (originalLine.startsWith(blockCommentIndent)) {
                    blockCommentLine = originalLine.substring(
                        blockCommentIndent.length,
                    );
                } else {
                    blockCommentLine = originalLine;
                }
                formattedString += buildIndentedLine(
                    lineIndex,
                    lines.length,
                    blockCommentLine,
                    depth,
                    options,
                    preserveIndentOnEmptyString,
                );
            }
            if (originalLine.match(/^\s*\*\//)) {
                // found end '*/' pattern
                blockComment = false;
                if (formatBlockComment) {
                    // restore indent values on block comment exit
                    depth = preBlockCommentDepth;
                    tagDepth = preBlockCommentTagDepth;
                    atTopLevel = preBlockCommentAtTopLevel;
                    oneCommandCode = preBlockCommentOneCommandCode;
                }
            }
            if (!formatBlockComment) {
                return;
            }
        }

        // #IfWinActive, #IfWinNotActive
        if (
            purifiedLine.match(/#ifwinactive$/) ||
            purifiedLine.match(/#ifwinnotactive$/)
        ) {
            if (tagDepth > 0) {
                depth -= tagDepth;
            } else {
                depth--;
            }
            atTopLevel = false;
        }

        // return or ExitApp
        if (purifiedLine.match(/\b(return|exitapp)\b/) && tagDepth === depth) {
            tagDepth = 0;
            depth--;
            atTopLevel = false;
        }

        // switch-case, label
        if (purifiedLine.match(/^\s*case.+?:\s*$/)) {
            // case
            tagDepth--;
            depth--;
            atTopLevel = false;
        } else if (purifiedLine.match(label)) {
            // default or hotkey
            if (tagDepth > 0 && tagDepth === depth) {
                depth--;
                atTopLevel = false;
            }
        }

        // Check close braces
        if (purifiedLine.includes('}')) {
            let temp = purifiedLine.match(/}/).length;
            const t2 = purifiedLine.match(/{[^{}]*}/);
            if (t2) {
                temp = temp - t2.length;
            }
            depth -= temp;
        }

        if (moreCloseParens) {
            depth--;
        }

        // One command code and open braces
        if (oneCommandCode && purifiedLine.includes('{')) {
            let temp = purifiedLine.match(/{/).length;
            const t2 = purifiedLine.match(/{[^{}]*}/);
            if (t2) {
                temp = temp - t2.length;
            }
            if (temp > 0) {
                oneCommandCode = false;
                depth--;
            }
        }

        if (depth < 0) {
            depth = 0;
        }
        if (preBlockCommentDepth < 0) {
            preBlockCommentDepth = 0;
        }

        // Save indented line
        formattedString += buildIndentedLine(
            lineIndex,
            lines.length,
            formattedLine,
            depth,
            options,
            preserveIndentOnEmptyString,
        );

        // Next line

        // Start directives for formatter
        if (emptyLine) {
            if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOn/i)) {
                formatBlockComment = true;
            }
        }

        // One command code
        if (
            oneCommandCode &&
            // Don't change indentation on empty lines (single line comment is equal to empty line) after one command code.
            !emptyLine &&
            // Don't change indentation on block comment after one command code.
            // Change indentation inside block comment, if user wants to format block comment.
            (!blockComment || formatBlockComment)
        ) {
            oneCommandCode = false;
            depth--;
        }

        // Block comments
        // Must be after 'One command code' check, because it reset flag 'blockComment' that tests there!
        // if (blockComment && originalLine.match(/^\s*\*\//)) {
        //     // found end '*/' pattern
        //     blockComment = false;
        // }

        // #IfWinActive, #IfWinNotActive
        if (
            purifiedLine.match(/#ifwinactive.*?\s/) ||
            purifiedLine.match(/#ifwinnotactive.*?\s/)
        ) {
            depth++;
            atTopLevel = false;
        }

        // Check open braces
        if (purifiedLine.includes('{')) {
            let temp = purifiedLine.match(/{/).length;
            const t2 = purifiedLine.match(/{[^{}]*}/);
            if (t2) {
                temp = temp - t2.length;
            }
            depth += temp;
            if (temp > 0) {
                atTopLevel = false;
            }
        }

        if (moreOpenParens) {
            depth++;
        }

        // default or label
        if (!moreOpenParens && purifiedLine.match(label)) {
            depth++;
            tagDepth = depth;
            atTopLevel = false;
        }

        if (atTopLevel) {
            for (const oneCommand of oneCommandList) {
                let temp: RegExpExecArray;
                if (
                    // if the regex matches the purified line
                    (temp = new RegExp(
                        // before 'one command code' allowed only optional close brace
                        // example: '} else' or '} if'
                        '^}?\\s*' + oneCommand + '\\b(.*)',
                    ).exec(purifiedLine)) &&
                    // and the captured group not includes a slash
                    !temp[1].includes('/')
                ) {
                    oneCommandCode = true;
                    depth++;
                    break;
                }
            }
        }
    });

    formattedString = removeEmptyLines(
        formattedString,
        options.allowedNumberOfEmptyLines,
    );

    return formattedString;
};

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.TextEdit[] {
        const stringToFormat = documentToString(document);

        const allowedNumberOfEmptyLines = Global.getConfig<number>(
            ConfigKey.allowedNumberOfEmptyLines,
        );

        const preserveIndent = Global.getConfig<boolean>(
            ConfigKey.preserveIndent,
        );

        const trimExtraSpaces = Global.getConfig<boolean>(
            ConfigKey.trimExtraSpaces,
        );

        const formattedString = internalFormat(stringToFormat, {
            ...options,
            allowedNumberOfEmptyLines,
            preserveIndent,
            trimExtraSpaces,
        });

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedString),
        ];
    }
}
