import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';

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
        let depth = 0;
        let tagDepth = 0;
        let oneCommandCode = false;
        let blockComment = false;
        let atTopLevel = true;

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const originalLine = document.lineAt(lineIndex).text;
            const purifiedLine = CodeUtil.purify(originalLine.toLowerCase());
            /** The line comment. Empty string if no line comment exists */
            const comment = /;.+/.exec(originalLine)?.[0] ?? '';
            const formattedLine = originalLine
                .replace(/^\s*/, '')
                .replace(/;.+/, '')
                .replace(/ {2,}/g, ' ')
                .concat(comment);

            atTopLevel = true;

            // Match block comments
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

            if (
                purifiedLine.match(/\b(return|ExitApp)\b/i) &&
                tagDepth === depth
            ) {
                tagDepth == 0;
                depth--;
                atTopLevel = false;
            }

            if (purifiedLine.match(/^\s*case.+?:\s*$/)) {
                tagDepth--;
                depth--;
                atTopLevel = false;
            } else if (purifiedLine.match(/:\s*$/)) {
                if (tagDepth > 0 && tagDepth === depth) {
                    depth--;
                    atTopLevel = false;
                }
            }

            // Check open and close braces
            if (purifiedLine.match(/}/) != null) {
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
            if (oneCommandCode && purifiedLine.match(/{/) != null) {
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

            const indentationChars = options.insertSpaces
                ? ' '.repeat(depth * options.tabSize)
                : '\t'.repeat(depth);

            formattedDocument +=
                !formattedLine || formattedLine.trim() == ''
                    ? formattedLine
                    : indentationChars + formattedLine;

            // If not last line, add newline
            if (lineIndex !== document.lineCount - 1) {
                formattedDocument += '\n';
            }

            if (oneCommandCode) {
                oneCommandCode = false;
                depth--;
            }

            if (
                purifiedLine.match(/#ifwinactive.*?\s/) ||
                purifiedLine.match(/#ifwinnotactive.*?\s/)
            ) {
                depth++;
                atTopLevel = false;
            }

            if (purifiedLine.match(/{/) != null) {
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

            if (purifiedLine.match(/:\s*$/)) {
                depth++;
                tagDepth = depth;
                atTopLevel = false;
            }

            if (atTopLevel) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray;
                    if (
                        (temp = new RegExp('\\b' + oneCommand + '\\b(.*)').exec(
                            purifiedLine,
                        )) != null &&
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
}
