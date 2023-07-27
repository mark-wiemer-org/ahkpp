import { ConfigKey, Global } from '../common/global';
import * as vscode from 'vscode';

/** Adds template whenever empty AHK files are opened */
export const createEditorListener = (): vscode.Disposable =>
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (
            e &&
            e.document.languageId === 'ahk' &&
            e.document.getText() === ''
        ) {
            // Call getConfig within if -- for performance
            const templateSnippetName = Global.getConfig<string>(
                ConfigKey.templateSnippetName,
            );
            if (templateSnippetName === '') {
                return;
            }
            vscode.commands.executeCommand('editor.action.insertSnippet', {
                name: templateSnippetName,
            });
        }
    });
