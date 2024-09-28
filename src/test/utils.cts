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

/** Whether the output view is visible */
export const isOutputVisible = async (): Promise<boolean> => {
    // todo incremental retry for performance
    await sleep(150); // wait for panel visibility to update

    /* From VS Code API docs:
     * You can access the visible or active output channel as a {@link TextDocument text document} from {@link window.visibleTextEditors visible editors} or {@link window.activeTextEditor active editor}
     * and use the language id to contribute language features like syntax coloring, code lens etc.
     */
    const outputViewVisible = vscode.window.visibleTextEditors.some(
        (editor) => editor.document.uri.scheme === 'output',
    );

    return outputViewVisible;
};

/** Close the panel if it's open. Do nothing if it's not open. */
export const closePanel = async (): Promise<void> => {
    await vscode.commands.executeCommand('workbench.action.closePanel');
};

/** Update the global AHK++ setting */
export const updateConfig = async (section: string, value: unknown) => {
    await vscode.workspace
        .getConfiguration('AHK++')
        .update(section, value, true);
    await sleep(80);
};
