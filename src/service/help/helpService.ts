// openHelp adapted from thqby/vscode-autohotkey2-lsp, used under GNU LGPLv3, licensed here under GNU GPLv3
// https://github.com/thqby/vscode-autohotkey2-lsp/blob/fa0782e8a221e54e5755358eb594ae9cc872ca1a/client/src/extension.ts#L348
import { ConfigKey, Global } from '../../common/global';
import { existsSync } from 'fs';
import * as vscode from 'vscode';
import * as child_process from 'child_process';

/**
 * Returns the text to use as a search.
 * If there is selected text that's not all whitespace, it's trimmed and returned.
 * If the selected text is empty or whitespace, the word at the cursor is returned.
 * If there is no word immediately before or after the cursor, empty string is returned.
 */
const getSearchText = (
    document: vscode.TextDocument,
    selection: vscode.Selection,
): string => {
    const selectedText = document.getText(selection).trim();
    if (selectedText) {
        return selectedText;
    }
    // vscode.Document.getWordRangeAtPosition() returns the whole file if there is no word at the cursor
    const wordAtCursor = document.getText(
        document.getWordRangeAtPosition(selection.active),
    );
    if (!wordAtCursor.includes('\n')) {
        return wordAtCursor;
    }

    return '';
};

export async function openHelp() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const helpPath = Global.getConfig<string>(ConfigKey.helpPath);
    const searchText = getSearchText(editor.document, editor.selection);
    const executePath = Global.getConfig<string>(ConfigKey.executePath);
    if (executePath && existsSync(executePath)) {
        // Using this as its own file is difficult with esbuild
        const buildScript = (searchText: string, helpPath: string) => `
SetWinDelay 10
SetKeyDelay 0
searchText := "${searchText}"
IfWinNotExist, AutoHotkey Help
{
    Run ${helpPath}
    WinWait AutoHotkey Help
}
WinActivate
WinWaitActive
StringReplace, searchText, searchText, #, {#}
Send, !s
Sleep 200
Send {home}
Sleep 10
Send +{end}%searchText%{enter}
return
        `;
        try {
            child_process.execSync(`"${executePath}" /ErrorStdOut *`, {
                input: buildScript(searchText, helpPath),
            });
        } catch {
            // If user selects value starting with `"`, we get here
            child_process.execSync(`"${executePath}" /ErrorStdOut *`, {
                input: buildScript('', helpPath),
            });
        }
    }
}
