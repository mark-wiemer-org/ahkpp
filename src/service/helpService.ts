import { ConfigKey, Global } from '../common/global';
import { exec } from '../common/processWrapper';
import { getSelectedText } from '../common/codeUtil';
import * as vscode from 'vscode';

/** @example `getHelpUrl('tutorial') === '/docs/Tutorial.htm'` */
export const getHelpUrl = (text: string): string | undefined => {
    if (text === 'tutorial') {
        return '/docs/Tutorial.htm';
    }
    return undefined;
};

export const getCommand = (
    helpPath: string | undefined,
    text: string | undefined,
): string | undefined => {
    if (!helpPath) {
        return undefined;
    }
    const helpUrl = getHelpUrl(text);
    return `C:/Windows/hh.exe ${helpPath}${helpUrl ? `::${helpUrl}` : ''}`;
};

export const openHelp = (): void => {
    const helpPath = Global.getConfig<string>(ConfigKey.helpPath);
    const text = getSelectedText(vscode.window.activeTextEditor);
    const command = getCommand(helpPath, text);
    exec(command);
};
