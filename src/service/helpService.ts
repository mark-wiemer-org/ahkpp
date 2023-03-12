import { ConfigKey, Global } from '../common/global';
import { Process } from '../common/processWrapper';
import { getSelectedText } from '@/common/codeUtil';
import * as vscode from 'vscode';

export class HelpService {
    public static open(): void {
        const text = getSelectedText(vscode.window.activeTextEditor);
        vscode.window.showInformationMessage(`Selection: "${text}"`);
        const helpPath = Global.getConfig(ConfigKey.helpPath);
        Process.exec(`C:/Windows/hh.exe ${helpPath}::/docs/Tutorial.htm`);
    }
}
