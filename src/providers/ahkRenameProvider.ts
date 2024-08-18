import * as vscode from 'vscode';
import { Parser } from '../parser/parser';

export class AhkRenameProvider implements vscode.RenameProvider {
    async provideRenameEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        newName: string,
    ): Promise<vscode.WorkspaceEdit> {
        for (const doc of vscode.workspace.textDocuments) {
            Parser.buildScript(doc);
        }

        const word = document.getText(
            document.getWordRangeAtPosition(position),
        );
        const refs = Parser.getAllRefByName(word);
        const workEdit = new vscode.WorkspaceEdit();
        for (const ref of refs) {
            if (ref.document.uri.scheme !== 'file') {
                continue;
            }
            const uriEdits = [];
            uriEdits.push(
                new vscode.TextEdit(
                    new vscode.Range(
                        new vscode.Position(ref.line, ref.character),
                        new vscode.Position(
                            ref.line,
                            ref.character + word.length,
                        ),
                    ),
                    newName,
                ),
            );
            console.debug(
                `url:${ref.document.uri},line:${ref.line},character:${ref.character}`,
            );
            workEdit.set(ref.document.uri, uriEdits);
        }
        return workEdit;
    }

    async prepareRename?(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Range> {
        const wordRange = document.getWordRangeAtPosition(position);
        const word = document.getText(wordRange);

        const method = await Parser.getMethodByName(document, word);
        if (method) {
            return wordRange;
        }
        throw new Error('You cannot rename this element.');
    }
}
