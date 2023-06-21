import * as vscode from 'vscode';

export const getDocument = async (path: string): Promise<vscode.TextDocument> =>
    await vscode.workspace.openTextDocument(path);
