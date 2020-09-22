import * as vscode from "vscode";
import { Detecter } from "../core/detect/detecter";

export class SignatureProvider implements vscode.SignatureHelpProvider {

    public async provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): Promise<vscode.SignatureHelp> {

        let methodPosition: vscode.Position;
        const lineText = document.lineAt(position.line).text
        let splitCount = 0;
        for (let index = position.character - 1; index > 0; index--) {
            const char = lineText.charAt(index);
            if (char == "(") {
                methodPosition = new vscode.Position(position.line, index)
                break;
            }
            if (char == ",") {
                splitCount++;
            }
        }
        const word = document.getText(document.getWordRangeAtPosition(methodPosition));

        const method = await Detecter.getMethodByName(document, word)
        if (method) {
            return {
                activeSignature: 0,
                signatures: [{
                    label: method.full,
                    parameters: method.params.map(param => { return { label: param } })
                }],
                activeParameter: splitCount,
            }
        }

        return null;
    }

}