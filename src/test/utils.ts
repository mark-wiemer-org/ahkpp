import * as vscode from 'vscode';

/**
 * Shortcut for `vscode.workspace.openTextDocument(Uri.file(fileName))`
 * @param fileName A name of a file on disk. This is the full path to the file.
 */
export const getDocument = async (
    fileName: string,
): Promise<vscode.TextDocument> =>
    await vscode.workspace.openTextDocument(fileName);
