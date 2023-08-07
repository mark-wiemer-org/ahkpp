import { isV1 } from '../common/codeUtil';
import { ConfigKey, Global, LanguageId } from '../common/global';
import * as vscode from 'vscode';

/** Adds template whenever empty AHK files (v1 or v2) are opened */
export const createEditorListener = (): vscode.Disposable =>
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (
            e &&
            (e.document.languageId === LanguageId.ahk1 ||
                e.document.languageId === LanguageId.ahk2) &&
            e.document.getText() === ''
        ) {
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
