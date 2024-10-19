import * as vscode from 'vscode';
import { configPrefix } from '../common/global';

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
export const updateConfig = async <T>(
    section: string,
    value: T,
): Promise<void> => {
    await vscode.workspace
        .getConfiguration(configPrefix)
        .update(section, value, false);
    await sleep(1_500); // todo tests are flaky even at 1_000ms
};

/**
 * Adds the provided snippetText at the current selection of the editor
 * and adds a newline to minimize syntax errors.
 * Waits after selecting so callers don't have to.
 */
export const addAndSelectSnippet = async (
    editor: vscode.TextEditor,
    snippetText: string,
): Promise<void> => {
    editor.insertSnippet(
        new vscode.SnippetString(snippetText).appendTabstop(0).appendText('\n'),
    );
    await sleep(100);
    editor.selection = new vscode.Selection(0, 0, 0, snippetText.length);
    await sleep(100);
};

/** Returns the labels of the completion suggestions for the current editor at its current position */
export const getCompletionSuggestionLabels = async (
    editor: vscode.TextEditor,
): Promise<(string | vscode.CompletionItemLabel)[]> => {
    const completionItems =
        await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            editor.document.uri,
            editor.selection.active,
        );
    const labels = completionItems?.items.map((i) => i.label);
    return labels;
};
