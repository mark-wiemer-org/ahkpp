import * as vscode from 'vscode';

/**
 * Shortcut for `vscode.workspace.openTextDocument(Uri.file(fileName))`
 * @param path A name of a file on disk. This is the full path to the file.
 */
export const getDocument = async (path: string): Promise<vscode.TextDocument> =>
    await vscode.workspace.openTextDocument(path);

/** Shows the doc and returns the TextEditor for the doc */
export const showDocument = async (
    doc: vscode.TextDocument,
): Promise<vscode.TextEditor> => await vscode.window.showTextDocument(doc);

// Copying to test helpers for easy import
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
