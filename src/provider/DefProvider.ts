import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";
import { existsSync } from "fs";

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

        const labelLink = await this.tryGetLabelLink(document, position);
        if (labelLink) {
            return labelLink;
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

    public async tryGetMethodLink(document: vscode.TextDocument, position: vscode.Position) {

        const { text } = document.lineAt(position.line);
        const word = document.getText(document.getWordRangeAtPosition(position));
        const callReg = new RegExp("\\b" + word + "\\s*\\(.*?\\)");
        if (!callReg.exec(text)) {
            return;
        }
        for (const method of (await Detecter.buildScript(document)).methods) {
            if (new RegExp("\\b" + method.name + "\\b").exec(word)) {
                return new vscode.Location(document.uri, new vscode.Position(method.line, document.lineAt(method.line).text.indexOf(word)));
            }
        }
        for (const filePath of Detecter.getCacheFile()) {
            const tempDocument = await vscode.workspace.openTextDocument(filePath);
            for (const method of (await Detecter.buildScript(tempDocument)).methods) {
                if (new RegExp("\\b" + method.name + "\\b").exec(word)) {
                    return new vscode.Location(tempDocument.uri, new vscode.Position(method.line, tempDocument.lineAt(method.line).text.indexOf(word)));
                }
            }
        }

    }

    public async tryGetLabelLink(document: vscode.TextDocument, position: vscode.Position) {

        const word = document.getText(document.getWordRangeAtPosition(position));

        for (const label of (await Detecter.buildScript(document)).labels) {
            if(new RegExp("\\b\\w?" + label.name + "\\b","i").test(word)){
                return new vscode.Location(document.uri, new vscode.Position(label.line, document.lineAt(label.line).text.indexOf(label.name)));
            }
        }
        for (const filePath of Detecter.getCacheFile()) {
            const tempDocument = await vscode.workspace.openTextDocument(filePath);
            for (const label of (await Detecter.buildScript(tempDocument)).labels) {
                if(new RegExp("\\b\\w?" + label.name + "\\b","i").test(word)){
                    return new vscode.Location(tempDocument.uri, new vscode.Position(label.line, tempDocument.lineAt(label.line).text.indexOf(label.name)));
                }
            }
        }

    }

}
