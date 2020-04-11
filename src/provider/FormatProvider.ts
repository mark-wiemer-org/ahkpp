import * as vscode from "vscode";

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

function trimContent(text: string) {

    const comment = text.indexOf(";");
    const msgbox = text.indexOf("msgbox");
    const gui = text.match(/gui[\s|,]/);
    if (comment !== -1) {
        text = text.substring(0, comment);
    }
    if (msgbox !== -1) {
        text = text.substring(0, msgbox) + "mb";
    }
    if (gui != null) {
        text = text.substring(0, text.indexOf("gui"));
    }

    return text;
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {

    private static oneCommandList = ["ifnotexist", "ifexist", "ifwinactive", "ifwinnotactive",
        "ifwinexist", "ifwinnotexist", "ifinstring", "ifnotinstring", "if", "else", "loop", "for", "while", "catch"];

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

        let formatDocument = "";
        let deep = 0;
        let tagDeep = 0;
        let oneCommandCode = false;

        for (let line = 0; line < document.lineCount; line++) {

            let notDeep = true;
            let { text } = document.lineAt(line);
            text = text.toLowerCase();
            text = trimContent(text);

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
            formatDocument += (" ".repeat(deep * 4) + document.lineAt(line).text.replace(/ {2,}/g, " ").replace(/^\s*/, ""));
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
