import * as vscode from "vscode";
import { Detecter } from "../core/detect/detecter";

export class AhkRenameProvider implements vscode.RenameProvider {

    async provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): Promise<vscode.WorkspaceEdit> {
        const word = document.getText(document.getWordRangeAtPosition(position));
        const refs = Detecter.getAllRefByName(word)
        const workEdit = new vscode.WorkspaceEdit();
        for (const ref of refs) {
            let uriEdits = workEdit.get(ref.document.uri) || []
            uriEdits.push(new vscode.TextEdit(
                new vscode.Range(
                    new vscode.Position(ref.line, ref.character),
                    new vscode.Position(ref.line, ref.character + word.length)
                ), newName
            ))
            workEdit.set(ref.document.uri, uriEdits)
        }
        return workEdit;
    }
    
    async prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        Promise<vscode.Range> {
        const word = document.getText(document.getWordRangeAtPosition(position));

        const method = await Detecter.getMethodByName(document, word)
        if (method != null) {
            return new vscode.Range(
                new vscode.Position(method.line, method.character),
                new vscode.Position(method.line, method.character + word.length)
            )
        }
        throw new Error("You cannot rename this element.")
    }

}