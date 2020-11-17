import * as vscode from "vscode";
import { Parser } from "../parser/parser";

export class RefProvider implements vscode.ReferenceProvider {

    public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {

        const word = document.getText(document.getWordRangeAtPosition(position));

        const vscodeRefs = [];
        const refs = Parser.getAllRefByName(word)
        for (const ref of refs) {
            vscodeRefs.push(
                new vscode.Location(ref.document.uri, new vscode.Position(ref.line, ref.character))
            )
        }
        return vscodeRefs;
    }

}