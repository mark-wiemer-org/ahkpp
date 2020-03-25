import * as vscode from "vscode";

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

function includeRegexAfterStr(text: string, searchStr: string, regex = /\S/): boolean {
    searchStr = searchStr.toLowerCase();
    const searchStrLen = searchStr.length;
    return text.toLowerCase().includes(searchStr) && text.substring(text.toLowerCase().indexOf(searchStr) + searchStrLen, text.length).match(regex) == null;
}

function excludeRegexAfterStr(text: string, searchStr: string, regex = /\S/): boolean {
    searchStr = searchStr.toLowerCase();
    const searchStrLen = searchStr.length;
    return text.toLowerCase().includes(searchStr) && text.substring(text.toLowerCase().indexOf(searchStr) + searchStrLen, text.length).match(regex) != null;
}
function trimContent(text: string) {

    const comment = text.indexOf(";");
    const equ = text.indexOf(":=");
    const msgbox = text.toLowerCase().indexOf("msgbox");
    const gui = text.toLowerCase().match(/gui[\s|,]/);
    if (comment !== -1) {
        text = text.substring(0, comment);
    }
    if (equ !== -1) {
        text = text.substring(0, equ);
    }
    if (msgbox !== -1) {
        text = text.substring(0, msgbox);
    }
    if (gui != null) {
        text = text.substring(0, text.toLowerCase().indexOf("gui"));
    }

    return text;
}

export class FormatProvider implements vscode.DocumentRangeFormattingEditProvider, vscode.DocumentFormattingEditProvider {

    public provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        throw new Error("Method not implemented.");
    }

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

        let formatDocument = "";
        let deep = 0;
        let tagDeep = 0;
        let oneCommandCode = false;
        const oneCommandList = ["IfNotExist", "IfExist", "IfWinActive", "IfWinNotActive", "IfWinExist", "IfWinNotExist", "IfInString", "IfNotInString", "if", "Else", "Loop", "For", "While"];

        for (let line = 0; line < document.lineCount; line++) {

            let simpleCode = true;
            let { text } = document.lineAt(line);
            text = trimContent(text);

            if (includeRegexAfterStr(text, "#ifwinactive") || includeRegexAfterStr(text, "#ifwinnotactive") || (text.toLowerCase().includes("return") && tagDeep === deep)) {
                deep--; simpleCode = false;
            }

            if (text.match(/}/) != null) {
                let temp = text.match(/}/).length;
                const t2 = text.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                deep -= temp;
                if (temp > 0) {
                    simpleCode = false;
                }
            }

            if ((includeRegexAfterStr(text, ":") || includeRegexAfterStr(text, "::")) && !text.includes(":=") ) {
                if (tagDeep > 0 && tagDeep === deep) {
                    deep--; simpleCode = false;
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
            formatDocument += (" ".repeat(deep * 4) + document.lineAt(line).text.replace(/^\s*/, ""));
            if (line !== document.lineCount - 1) {
                formatDocument += "\n";
            }

            if (oneCommandCode) {
                oneCommandCode = false;
                deep--;
            }

            if (excludeRegexAfterStr(text, "#ifwinactive") || excludeRegexAfterStr(text, "#ifwinnotactive")) {
                deep++; simpleCode = false;
            }

            if (text.match(/{/) != null) {
                let temp = text.match(/{/).length;
                const t2 = text.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                deep += temp;
                if (temp > 0) {
                    simpleCode = false;
                }
            }

            if ((includeRegexAfterStr(text, ":") || includeRegexAfterStr(text, "::")) && !text.includes(":=")) {
                deep++;
                tagDeep = deep;
                simpleCode = false;
            }

            if (simpleCode) {
                for (const oneCommand of oneCommandList) {
                    if (includeRegexAfterStr(text, oneCommand, /{/)) {
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
