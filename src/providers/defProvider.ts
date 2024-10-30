import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { existsSync } from 'fs';
import { join } from 'path';

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

    /**
     * If the position is on an `#Include` line,
     * returns a Location at the beginning of the included file.
     * Otherwise returns undefined.
     * However, it's unclear if this ever worked.
     */
    async tryGetFileLink(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Location> | undefined {
        /** @example /c:/path/to/file.ahk */
        const docPath = document.uri.path;
        const { text } = document.lineAt(position.line);
        const includeMatch = text.match(
            /(?<=#include).+?\.(ahk|ahk1|ah1|ext)\b/i,
        );
        if (!includeMatch) {
            return undefined;
        }
        /** @example c:/path/to */
        const parentGoodPath = docPath.substring(1, docPath.lastIndexOf('/'));
        const expandedPath = includeMatch[0]
            .trim()
            .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parentGoodPath)
            .replace(/(%A_LineFile%)/, docPath);
        /** @example c:/path/to/included.ahk */
        const resolvedPath = join(parentGoodPath, expandedPath);
        return existsSync(resolvedPath)
            ? new vscode.Location(
                  vscode.Uri.file(resolvedPath),
                  new vscode.Position(0, 0),
              )
            : undefined;
    }
}
