import * as vscode from 'vscode';

/**
 * Shortcut for `vscode.workspace.openTextDocument(Uri.file(fileName))`
 * @param path A name of a file on disk. This is the full path to the file.
 */
export const getDocument = async (path: string): Promise<vscode.TextDocument> =>
    await vscode.workspace.openTextDocument(path);
