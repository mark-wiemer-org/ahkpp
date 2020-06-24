import * as vscode from "vscode";
import { CodeUtil } from "../common/codeUtil";

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {

    private static oneCommandList = ["ifnotexist", "ifexist", "ifwinactive", "ifwinnotactive",
        "ifwinexist", "ifwinnotexist", "ifinstring", "ifnotinstring", "if", "else", "loop", "for", "while", "catch"];

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

        let formatDocument = "";
        let deep = 0;
        let tagDeep = 0;
        let oneCommandCode = false;
        let blockComment = false;

        for (let line = 0; line < document.lineCount; line++) {

            let { text } = document.lineAt(line);
            if (text.match(/ *\*\//)) {
                blockComment = false;
            }
            if (text.match(/ *\/\*/)) {
                blockComment = true;
            }
            if (blockComment) {
                formatDocument += text;
                if (line !== document.lineCount - 1) {
                    formatDocument += "\n";
                }
                continue;
            };
            text = text.toLowerCase();
            text = CodeUtil.purity(text);
            let notDeep = true;

            if (text.match(/#ifwinactive$/) || text.match(/#ifwinnotactive$/) || (text.match(/\breturn\b/) && tagDeep === deep)) {
                deep--; notDeep = false;
            }

            if (text.match(/}/) != null) {
                let temp = text.match(/}/).length;
                const t2 = text.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                deep -= temp;
                if (temp > 0) {
                    notDeep = false;
                }
            }

            if (text.match(/:$/)) {
                if (tagDeep > 0 && tagDeep === deep) {
                    deep--; notDeep = false;
                }
            }

            if (oneCommandCode && text.match(/{/) != null) {
                let temp = text.match(/{/).length;
                const t2 = text.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                if (temp > 0) {
                    oneCommandCode = false;
                    deep--;
                }
            }

            if (deep < 0) {
                deep = 0;
            }
            formatDocument += (" ".repeat(deep * options.tabSize) + document.lineAt(line).text.replace(/ {2,}/g, " ").replace(/^\s*/, ""));
            if (line !== document.lineCount - 1) {
                formatDocument += "\n";
            }

            if (oneCommandCode) {
                oneCommandCode = false;
                deep--;
            }

            if (text.match(/#ifwinactive.*?\s/) || text.match(/#ifwinnotactive.*?\s/)) {
                deep++; notDeep = false;
            }

            if (text.match(/{/) != null) {
                let temp = text.match(/{/).length;
                const t2 = text.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                deep += temp;
                if (temp > 0) {
                    notDeep = false;
                }
            }

            if (text.match(/:$/)) {
                deep++;
                tagDeep = deep;
                notDeep = false;
            }

            if (notDeep) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray;
                    if (
                        (temp = new RegExp("\\b" + oneCommand + "\\b(.*)").exec(text)) != null
                        && !temp[1].includes("/")) {
                        oneCommandCode = true;
                        deep++;
                        break;
                    }
                }
            }

        }
        const result = [];
        result.push(new vscode.TextEdit(fullDocumentRange(document), formatDocument.replace(/\n{2,}/g, "\n\n")));
        return result;
    }

}
