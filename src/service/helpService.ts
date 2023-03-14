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

/**
 * Opens help file according to the global help path.
 * Opens context-sensitive help according to global setting.
 * Behind the scenes, runs `hh.exe` on the `chm` file.
 */
export const openHelp = (): void => {
    const helpPath = Global.getConfig<string>(ConfigKey.helpPath);
    const enableContextSensitiveHelp = Global.getConfig<boolean>(
        ConfigKey.enableContextSensitiveHelp,
    );
    const text = enableContextSensitiveHelp
        ? getSelectedText(vscode.window.activeTextEditor)
        : '';
    const command = getCommand(helpPath, text);
    exec(command);
};
