import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { existsSync } from 'fs';

export class DefProvider implements vscode.DefinitionProvider {
    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const fileLink = await this.tryGetFileLink(document, position);
        if (fileLink) {
            return fileLink;
        }

        const word = document.getText(
            document.getWordRangeAtPosition(position),
        );

        // get method
        if (
            new RegExp(word + '\\s*\\(.*?\\)').test(
                document.lineAt(position.line).text,
            )
        ) {
            const method = await Parser.getMethodByName(document, word);
            if (method) {
                return new vscode.Location(
                    vscode.Uri.parse(method.uriString),
                    new vscode.Position(method.line, method.character),
                );
            }
        }

        // getlabel
        const label = await Parser.getLabelByName(document, word);
        if (label) {
            const tempDocument = label.document;
            return new vscode.Location(
                tempDocument.uri,
                new vscode.Position(label.line, label.character),
            );
        }

        const script = await Parser.buildScript(document, { usingCache: true });

        for (const method of script.methods) {
            if (
                position.line >= method.line &&
                position.line <= method.endLine
            ) {
                for (const variable of method.variables) {
                    if (variable.name === word) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Position(
                                variable.line,
                                variable.character,
                            ),
                        );
                    }
                }
                for (const param of method.params) {
                    if (param === word) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Position(
                                method.line,
                                method.character + method.origin.indexOf(param),
                            ),
                        );
                    }
                }
            }
        }

        for (const variable of script.variables) {
            if (variable.name === word) {
                return new vscode.Location(
                    document.uri,
                    new vscode.Position(variable.line, variable.character),
                );
            }
        }

        return null;
    }

    public async tryGetFileLink(
        document: vscode.TextDocument,
        position: vscode.Position,
        workFolder?: string,
    ): Promise<vscode.Location> | undefined {
        const { text } = document.lineAt(position.line);
        const includeMatch = text.match(/(?<=#include).+?\.(ahk|ext)\b/i);
        if (!includeMatch) {
            return undefined;
        }
        const parent = workFolder
            ? workFolder
            : document.uri.path.substr(0, document.uri.path.lastIndexOf('/'));
        const targetPath = vscode.Uri.file(
            includeMatch[0]
                .trim()
                .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parent)
                .replace(/(%A_LineFile%)/, document.uri.path),
        );
        if (existsSync(targetPath.fsPath)) {
            return new vscode.Location(targetPath, new vscode.Position(0, 0));
        } else if (workFolder) {
            return this.tryGetFileLink(
                document,
                position,
                vscode.workspace.workspaceFolders?.[0].uri.fsPath,
            );
        } else {
            return undefined;
        }
    }
}
