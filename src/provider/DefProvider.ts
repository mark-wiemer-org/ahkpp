import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";
import { existsSync } from "fs";
import { worker } from "cluster";

export class DefProvider implements vscode.DefinitionProvider {

    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

        const fileLink = await this.tryGetFileLink(document, position);
        if (fileLink) {
            return fileLink;
        }

        const word = document.getText(document.getWordRangeAtPosition(position));

        // get method
        if (new RegExp("\\b" + word + "\\s*\\(.*?\\)").test(document.lineAt(position.line).text)) {
            const method = await Detecter.getMethodByName(document, word)
            if (method) {
                const methodDoc = method.document;
                return new vscode.Location(methodDoc.uri, new vscode.Position(method.line, methodDoc.lineAt(method.line).text.indexOf(word)));
            }
        }

        // getlabel
        const label = await Detecter.getLabelByName(document, word)
        if (label) {
            const tempDocument = label.document;
            return new vscode.Location(tempDocument.uri, new vscode.Position(label.line, tempDocument.lineAt(label.line).text.indexOf(label.name)));
        }

        return null;

    }

    public async tryGetFileLink(document: vscode.TextDocument, position: vscode.Position) {
        const { text } = document.lineAt(position.line);
        const includeMatch = text.match(/(?<=#include).+?\.(ahk|ext)\b/i);
        if (includeMatch) {
            const parent = document.uri.path.substr(0, document.uri.path.lastIndexOf("/"));
            const targetPath = vscode.Uri.file(
                includeMatch[0].trim()
                    .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parent)
                    .replace(/(%A_LineFile%)/, document.uri.path)
            );
            if (existsSync(targetPath.fsPath)) {
                return new vscode.Location(targetPath, new vscode.Position(0, 0));
            }
            return null;
        }

    }

}
