import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
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

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    /** Special keywords that can trigger one-line commands */
    private static oneCommandList = [
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

    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.TextEdit[] {
        let formattedDocument = '';
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
        let atTopLevel = true;
        /** Save important values to this variables on block comment enter, restore them on exit */
        let blockCommentDepth = 0;
        let blockCommentTagDepth = 0;
        let blockCommentAtTopLevel = true;
        let blockCommentOneCommandCode = false;

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const originalLine = document.lineAt(lineIndex).text;
            const purifiedLine = CodeUtil.purify(originalLine.toLowerCase());
            /** The line comment. Empty string if no line comment exists */
            const comment = /;.+/.exec(originalLine)?.[0] ?? '';
            const formattedLine = originalLine
                .replace(/^\s*/, '')
                .replace(/;.+/, '')
                .replace(/\s{2,}/g, ' ')
                .concat(comment);
            const emptyLine = purifiedLine === '';

            atTopLevel = true;

            const moreCloseParens = hasMoreCloseParens(purifiedLine);
            const moreOpenParens = hasMoreOpenParens(purifiedLine);

            // This line

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
                // save indent values on block comment enter
                blockCommentDepth = depth;
                blockCommentTagDepth = tagDepth;
                blockCommentAtTopLevel = atTopLevel;
                blockCommentOneCommandCode = oneCommandCode;
                // reset indent values to default values with added current 'depth' indent
                oneCommandCode = false;
            }
            if (blockComment && originalLine.match(/^\s*\*\//)) {
                // found end '*/' pattern
                // restore indent values on block comment exit
                depth = blockCommentDepth;
                tagDepth = blockCommentTagDepth;
                atTopLevel = blockCommentAtTopLevel;
                oneCommandCode = blockCommentOneCommandCode;
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
            if (
                purifiedLine.match(/\b(return|ExitApp)\b/i) &&
                tagDepth === depth
            ) {
                tagDepth === 0;
                depth--;
                atTopLevel = false;
            }

            // switch-case, hotkeys
            if (purifiedLine.match(/^\s*case.+?:\s*$/)) {
                // case
                tagDepth--;
                depth--;
                atTopLevel = false;
            } else if (purifiedLine.match(/:\s*$/)) {
                // default or hotkey
                if (tagDepth > 0 && tagDepth === depth) {
                    depth--;
                    atTopLevel = false;
                }
            }

            // Check close braces
            if (!!purifiedLine.match(/}/)) {
                let temp = purifiedLine.match(/}/).length;
                const t2 = purifiedLine.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                depth -= temp;
                if (temp > 0) {
                    atTopLevel = false;
                }
            }

            if (moreCloseParens) {
                depth--;
            }

            // One command code and open braces
            if (!!oneCommandCode && !!purifiedLine.match(/{/)) {
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
            if (blockCommentDepth < 0) {
                blockCommentDepth = 0;
            }

            // Save indented line
            formattedDocument += FormatProvider.buildIndentedLine(
                lineIndex,
                document.lineCount,
                formattedLine,
                depth,
                options,
            );

            // Next line

            // One command code
            // Don't change indentation on empty lines (single line comments are equal to empty line) or block comment after one command code
            if (oneCommandCode && !emptyLine && !blockComment) {
                oneCommandCode = false;
                depth--;
            }

            // Block comments (must be after 'One command code' check!)
            if (blockComment && originalLine.match(/^\s*\*\//)) {
                // found end '*/' pattern
                blockComment = false;
            }

            // #IfWinActive, #IfWinNotActive
            if (
                purifiedLine.match(/#ifwinactive.*?\s/) ||
                purifiedLine.match(/#ifwinnotactive.*?\s/)
            ) {
                depth++;
                atTopLevel = false;
            }

            // Check open braces
            if (!!purifiedLine.match(/{/)) {
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

            // default or hotkey
            if (!moreOpenParens && purifiedLine.match(/:\s*$/)) {
                depth++;
                tagDepth = depth;
                atTopLevel = false;
            }

            if (atTopLevel) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray;
                    if (
                        !!(temp = new RegExp(
                            '\\b' + oneCommand + '\\b(.*)',
                        ).exec(purifiedLine)) &&
                        !temp[1].includes('/')
                    ) {
                        oneCommandCode = true;
                        depth++;
                        break;
                    }
                }
            }
        }

        return [
            new vscode.TextEdit(
                fullDocumentRange(document),
                formattedDocument.replace(/\n{2,}/g, '\n\n'),
            ),
        ];
    }

    /**
     * Build indentation chars
     * @param depth Depth of indent
     * @param options VS Code formatting options
     */
    static buildIndentationChars(
        depth: number,
        options: vscode.FormattingOptions,
    ): string {
        return options.insertSpaces
            ? ' '.repeat(depth * options.tabSize)
            : '\t'.repeat(depth);
    }

    /**
     * Build indented line of code (not ready for saving)
     * @param indentationChars Indentation chars
     * @param formattedLine Formatted line of code
     */
    static buildIndentedString(
        indentationChars: string,
        formattedLine: string,
    ): string {
        return !formattedLine?.trim()
            ? formattedLine
            : indentationChars + formattedLine;
    }

    /**
     * Build indented line of code (ready for saving)
     * @param lineIndex Line index of passed formattedLine
     * @param lastLineIndex Index of last line of document
     * @param formattedLine Formatted line of code
     * @param depth Depth of indent
     * @param options VS Code formatting options
     */
    static buildIndentedLine(
        lineIndex: number,
        lastLineIndex: number,
        formattedLine: string,
        depth: number,
        options: vscode.FormattingOptions,
    ) {
        const indentationChars = FormatProvider.buildIndentationChars(
            depth,
            options,
        );
        let indentedLine = FormatProvider.buildIndentedString(
            indentationChars,
            formattedLine,
        );
        // If not last line, add newline
        if (lineIndex !== lastLineIndex - 1) {
            indentedLine += '\n';
        }
        return indentedLine;
    }
}
