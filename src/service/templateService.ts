import { isAHK, isV1 } from '../common/codeUtil';
import { ConfigKey, Global } from '../common/global';
import * as vscode from 'vscode';

/** Adds template whenever empty AHK files (v1 or v2) are opened */
export const createEditorListener = (): vscode.Disposable =>
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e && isAHK(e.document.languageId) && e.document.getText() === '') {
            const templateSnippetNameKey = isV1()
                ? ConfigKey.templateSnippetNameV1
                : ConfigKey.templateSnippetNameV2;
            const templateSnippetName = Global.getConfig<string>(
                templateSnippetNameKey,
            );
            if (templateSnippetName === '') {
                return;
            }
            vscode.commands.executeCommand('editor.action.insertSnippet', {
                name: templateSnippetName,
            });
        }
    });
