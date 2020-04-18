import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";

export class DefProvider implements vscode.DefinitionProvider {

    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

        const fileLink = await this.tryGetFileLink(document, position);
        if (fileLink) {
            return fileLink;
        }
        const methodLink = await this.tryGetMethodLink(document, position);
        if (methodLink) {
            return methodLink;
        }

        return null;

    }

    public async tryGetFileLink(document: vscode.TextDocument, position: vscode.Position) {
        const { text } = document.lineAt(position.line);
        const includeMatch = text.match(/(?<=#include).+?\.(ahk|ext)\b/i);
        if (includeMatch) {
            const parent = document.uri.path.substr(0, document.uri.path.lastIndexOf("/"));
            const derefedPath = vscode.Uri.file(
                includeMatch[0].trim()
                    .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parent)
                    .replace(/(%A_LineFile%)/, document.uri.path)
            );
            return new vscode.Location(derefedPath, new vscode.Position(0, 0));
        }

    }

    public async tryGetMethodLink(document: vscode.TextDocument, position: vscode.Position) {

        const { text } = document.lineAt(position.line);
        const word = document.getText(document.getWordRangeAtPosition(position));
        const callReg = new RegExp("\\b" + word + "\\s*\\(.*?\\)");
        if (!callReg.exec(text)) {
            return;
        }
        for (const method of await Detecter.getMethodList(document)) {
            if (new RegExp("\\b" + method.name + "\\b").exec(word)) {
                return new vscode.Location(document.uri, new vscode.Position(method.line, document.lineAt(method.line).text.indexOf(word)));
            }
        }
        for (const filePath of Detecter.getCacheFile()) {
            const tempDocument = await vscode.workspace.openTextDocument(filePath);
            for (const method of await Detecter.getMethodList(tempDocument)) {
                if (new RegExp("\\b" + method.name + "\\b").exec(word)) {
                    return new vscode.Location(tempDocument.uri, new vscode.Position(method.line, tempDocument.lineAt(method.line).text.indexOf(word)));
                }
            }
        }

    }

}
