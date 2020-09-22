import * as vscode from "vscode";
import { Detecter } from "../core/detect/detecter";

export class AhkRenameProvider implements vscode.RenameProvider {

    async provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): Promise<vscode.WorkspaceEdit> {

        for (const doc of vscode.workspace.textDocuments) {
            Detecter.buildScript(doc)
        }

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
        const wordRange = document.getWordRangeAtPosition(position)
        const word = document.getText(wordRange);

        const method = await Detecter.getMethodByName(document, word)
        if (method != null) {
            return wordRange
        }
        throw new Error("You cannot rename this element.")
    }

}