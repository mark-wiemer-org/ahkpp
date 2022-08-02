import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import { ConfigKey, Global } from '../common/global';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
    removeEmptyLines,
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

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const originalLine = document.lineAt(lineIndex).text;
            const purifiedLine = CodeUtil.purify(originalLine.toLowerCase());
            /** The line comment. Empty string if no line comment exists */
            const comment = /;.+/.exec(originalLine)?.[0] ?? '';
            const formattedLine = originalLine
                .replace(/;.+/, '')
                .replace(/ {2,}/g, ' ')
                .trim()
                .concat(' ' + comment)
                .trim();

            atTopLevel = true;

            const moreCloseParens = hasMoreCloseParens(purifiedLine);
            const moreOpenParens = hasMoreOpenParens(purifiedLine);

            // This line

            // Block comments
            if (originalLine.match(/ *\/\*/)) {
                blockComment = true;
            }
            if (originalLine.match(/ *\*\//)) {
                blockComment = false;
            }
            if (blockComment) {
                formattedDocument += originalLine;
                if (lineIndex !== document.lineCount - 1) {
                    formattedDocument += '\n';
                }
                continue;
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
            if (purifiedLine.includes('}')) {
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

            // Add the indented line to the file
            const indentationChars = options.insertSpaces
                ? ' '.repeat(depth * options.tabSize)
                : '\t'.repeat(depth);
            formattedDocument += !formattedLine?.trim()
                ? formattedLine
                : indentationChars + formattedLine;

            // If not last line, add newline
            if (lineIndex !== document.lineCount - 1) {
                formattedDocument += '\n';
            }

            // Next line

            // One command code
            if (oneCommandCode) {
                oneCommandCode = false;
                depth--;
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
                        // if the regex matches the purified line
                        (temp = new RegExp('\\b' + oneCommand + '\\b(.*)').exec(
                            purifiedLine,
                        )) &&
                        // and the captured group includes a slash
                        !temp[1].includes('/')
                    ) {
                        oneCommandCode = true;
                        depth++;
                        break;
                    }
                }
            }
        }

        formattedDocument = removeEmptyLines(
            formattedDocument,
            Global.getConfig<number>(ConfigKey.allowedNumberOfEmptyLines),
        );

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedDocument),
        ];
    }
}
