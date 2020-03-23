import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";

export class DefProvider implements vscode.DefinitionProvider {

    async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

        const { text } = document.lineAt(position.line);
        const word = document.getText(document.getWordRangeAtPosition(position));

        var callReg = new RegExp("\\b" + word + "\\s*\\(.*?\\)");
        if (callReg.exec(text)) {
            for (const method of await Detecter.getMethodList(document)) {
                if (method.name.indexOf(word) != -1)
                    return new vscode.Location(document.uri, new vscode.Position(method.line, document.lineAt(method.line).text.indexOf(word)));
            }
            for(const filePath of Detecter.getCacheFile()){
                let tempDocument=await vscode.workspace.openTextDocument(filePath)
                for (const method of await Detecter.getMethodList(tempDocument)) {
                    if (method.name.indexOf(word) != -1)
                        return new vscode.Location(tempDocument.uri, new vscode.Position(method.line, tempDocument.lineAt(method.line).text.indexOf(word)));
                }
            }
        }

        return null;

    }
}
