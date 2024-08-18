// Adapted from https://github.com/Lexikos/vscode-auto-select/blob/main/src/extension.ts
// Used under The Unlicense (public domain): https://github.com/Lexikos/vscode-auto-select/blob/main/UNLICENSE

import * as vscode from 'vscode';
import { LanguageId } from '../common/global';
import { isAHK, isV1 } from '../common/codeUtil';

/**
 * Return the major version number (1 or 2) associated with
 * the first `#Requires` directive found.
 * Includes directives in block comments or continuation sections.
 */
const tryGetRequiresVersion = (doc: vscode.TextDocument): 1 | 2 | undefined => {
    const linesToScan = 50;
    const text = doc.getText(new vscode.Range(0, 0, linesToScan, 0));
    /** Newline, whitespace, #Requires, whitespace, AHK, whitespace, v1 or v2 */
    const requiresRegex = /^[ \t]*#Requires[ \t]+AutoHotkey[ \t]v?(1|2)\b/im;
    const matchArray = text.match(requiresRegex);
    return matchArray ? (Number.parseInt(matchArray[1]) as 1 | 2) : undefined;
};

/**
 * Makes a function that switches to the correct version of AHK.
 */
const makeOnSwitchFile =
    (seen: Set<vscode.Uri>) => (doc: vscode.TextDocument | undefined) => {
        // If not an AHK file, or already seen, do nothing.
        if (!doc || !isAHK(doc.languageId) || seen.has(doc.uri)) {
            return;
        }
        seen.add(doc.uri);
        const versionNumber = tryGetRequiresVersion(doc);
        const newLang = [LanguageId.ahk1, LanguageId.ahk2][versionNumber - 1];
        const currentLang = doc.languageId;
        if (newLang && newLang !== currentLang) {
            switchLang(doc, newLang);
        }
    };

/** Switch the language of a document. */
const switchLang = (doc: vscode.TextDocument, languageId: string) => {
    vscode.languages.setTextDocumentLanguage(doc, languageId).then(
        () => {
            const versionName = isV1() ? 'v1' : 'v2';
            vscode.window.showInformationMessage(
                `Found '#Requires ${versionName}'. Switched to AutoHotkey ${versionName}.`,
            );
        },
        (reason) => {
            vscode.window.showErrorMessage(
                `Failed to switch to ${languageId}:\n${reason.message}`,
            );
        },
    );
};

/**
 * Switch files to the correct version of AHK, if necessary.
 * Switch when file is first opened.
 * Switch each file at most once for safety.
 */
export const initializeLanguageVersionService = (
    context: vscode.ExtensionContext,
) => {
    const onSwitchFile = makeOnSwitchFile(new Set<vscode.Uri>());
    vscode.window.onDidChangeActiveTextEditor(
        (newActiveEditor) => onSwitchFile(newActiveEditor?.document),
        null,
        context.subscriptions,
    );
    // Update language version of all open text editors
    vscode.window.tabGroups.all.forEach((tabGroup) =>
        tabGroup.tabs
            .filter((t) => t.input instanceof vscode.TabInputText)
            .forEach(async (t) => {
                const doc = await vscode.workspace.openTextDocument(
                    (t.input as vscode.TabInputText).uri,
                );
                onSwitchFile(doc);
            }),
    );
};
