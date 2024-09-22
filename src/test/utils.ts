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

/** Whether the output view is visible with AHK++ output */
/* From VS Code API docs:
 * You can access the visible or active output channel as a {@link TextDocument text document} from {@link window.visibleTextEditors visible editors} or {@link window.activeTextEditor active editor}
 * and use the language id to contribute language features like syntax coloring, code lens etc.
 */
export const isOutputVisible = async (): Promise<boolean> => {
    await sleep(100); // wait for output to show
    return vscode.window.visibleTextEditors.some((editor) =>
        editor.document.uri
            .toString()
            .startsWith(
                'output:extension-output-mark-wiemer.vscode-autohotkey-plus-plus',
            ),
    );
};
