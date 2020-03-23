import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";

export class DefProvider implements vscode.DefinitionProvider {

    async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

        const fileLink = await this.tryGetFileLink(document, position)
        if (fileLink) return fileLink;
        const methodLink = await this.tryGetMethodLink(document, position)
        if (methodLink) return methodLink;

        return null;

    }

    async tryGetFileLink(document: vscode.TextDocument, position: vscode.Position) {
        const { text } = document.lineAt(position.line);
        let includeMatch = text.match(/(?<=#include).+?\.(ahk|ext)\b/i)
        if (includeMatch) {
            let parent = document.uri.path.substr(0, document.uri.path.lastIndexOf("/"))
            return new vscode.Location(vscode.Uri.file(includeMatch[0].trim().replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parent)), new vscode.Position(0, 0))
        }

    }

    async tryGetMethodLink(document: vscode.TextDocument, position: vscode.Position) {

        const { text } = document.lineAt(position.line)
        const word = document.getText(document.getWordRangeAtPosition(position));
        var callReg = new RegExp("\\b" + word + "\\s*\\(.*?\\)");
        if (!callReg.exec(text)) return;
        for (const method of await Detecter.getMethodList(document)) {
            if (method.name.indexOf(word) != -1)
                return new vscode.Location(document.uri, new vscode.Position(method.line, document.lineAt(method.line).text.indexOf(word)));
        }
        for (const filePath of Detecter.getCacheFile()) {
            let tempDocument = await vscode.workspace.openTextDocument(filePath)
            for (const method of await Detecter.getMethodList(tempDocument)) {
                if (method.name.indexOf(word) != -1)
                    return new vscode.Location(tempDocument.uri, new vscode.Position(method.line, tempDocument.lineAt(method.line).text.indexOf(word)));
            }
        }

    }

}
