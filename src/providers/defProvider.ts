import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { resolveIncludedPath } from './defProvider.utils';
import { Out } from 'src/common/out';
import { stat } from 'fs/promises';

export class DefProvider implements vscode.DefinitionProvider {
    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const fileLink = await tryGetFileLink(document, position);
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
}

//* Utilities requiring the vscode API

/**
 * If the position is on an `#Include` line
 * and the included path is an existing file,
 * returns a Location at the beginning of the included file.
 *
 * Otherwise returns undefined.
 *
 ** Currently assumes the working directory is the script path and
 * does not respect previous `#include dir` directives
 */
async function tryGetFileLink(
    document: vscode.TextDocument,
    position: vscode.Position,
): Promise<vscode.Location> | undefined {
    /** @example '/c:/path/to/file.ahk' */
    const docPath = document.uri.path;
    const { text } = document.lineAt(position.line);
    /** @example 'c:/path/to/included.ahk' */
    const resolvedPath = resolveIncludedPath(docPath, text);
    Out.debug(`resolvedPath: ${resolvedPath}`);
    const fsStat = await stat(resolvedPath);
    return fsStat.isFile()
        ? new vscode.Location(
              vscode.Uri.file(resolvedPath),
              new vscode.Position(0, 0),
          )
        : undefined;
}
