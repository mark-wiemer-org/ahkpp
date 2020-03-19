import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";

export class DefProvider implements vscode.DefinitionProvider {

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

        const { text } = document.lineAt(position.line);
        const word = document.getText(document.getWordRangeAtPosition(position));

        var callReg = new RegExp("\\b" + word + "\\s*\\([\\w\\s,:\"=]*\\)");
        if (callReg.exec(text)) {
            for (const method of Detecter.getMethodList(document)) {
                if (method.name.indexOf(word) != -1)
                    return new vscode.Location(document.uri, new vscode.Position(method.line, document.lineAt(method.line).text.indexOf(word)));
            }
        }

        return null;

    }
}
