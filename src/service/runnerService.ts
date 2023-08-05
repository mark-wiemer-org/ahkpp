import { resolve as res } from 'path';
import * as vscode from 'vscode';
import { FileManager, FileModel } from '../common/fileManager';
import { ConfigKey, Global, LanguageId } from '../common/global';
import { exec } from '../common/processWrapper';
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import { getSelectedText } from '../common/codeUtil';

export const makeCompileCommand = (
    compilerPath: string,
    scriptPath: string,
    showGui: boolean,
    compileIcon: string,
    compileBaseFile: string,
    useMpress: boolean,
): string => {
    if (!compilerPath || !scriptPath) {
        return '';
    }
    const pos = scriptPath.lastIndexOf('.');
    const exePath =
        scriptPath.substring(0, pos < 0 ? scriptPath.length : pos) + '.exe';
    const guiCommand = showGui ? '/gui' : '';
    const compileIconCommand = compileIcon ? `/icon "${compileIcon}"` : '';
    const compileBaseFileCommand = compileBaseFile
        ? `/bin "${compileBaseFile}"`
        : '';
    const compileMpressCommand = useMpress ? '/mpress 1' : '';
    return `"${compilerPath}" ${guiCommand} /in "${scriptPath}" /out "${exePath}" ${compileIconCommand} ${compileBaseFileCommand} ${compileMpressCommand}`;
};

export class RunnerService {
    /** Runs the editor selection as a standalone script. */
    public static async runSelection(): Promise<void> {
        const text = getSelectedText(vscode.window.activeTextEditor);
        if (text === undefined) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        this.run(await this.createTemplate(text));
    }

    /** Start debug session */
    public static async startDebugger(script?: string) {
        const cwd = script
            ? vscode.Uri.file(script)
            : vscode.window.activeTextEditor.document.uri;
        script = script ? script : await this.getPathByActive();
        const debugPlusExists = !!vscode.extensions.getExtension(
            'zero-plusplus.vscode-autohotkey-debug',
        );
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cwd), {
            type: debugPlusExists ? 'autohotkey' : 'ahk',
            request: 'launch',
            name: 'AutoHotkey Debugger',
            runtime: Global.getConfig<string>(ConfigKey.interpreterPath),
            program: script,
        });
    }

    /** Runs the script at the specified path */
    public static async run(path?: string): Promise<void> {
        const interpreterPath = Global.getConfig(ConfigKey.interpreterPath);
        this.checkAndSaveActive();
        if (!path) {
            path = await this.getPathByActive();
        }
        exec(`\"${interpreterPath}\" \"${path}\"`, {
            cwd: `${res(path, '..')}`,
        });
    }

    /**
     * Compiles current script
     */
    public static async compile(showGui: boolean) {
        const currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        const languageId = vscode.window.activeTextEditor.document.languageId;
        if (!fs.existsSync(currentPath)) {
            vscode.window.showErrorMessage('Cannot compile new files.');
            return;
        }
        this.checkAndSaveActive();

        const compilerPath = Global.getConfig<string>(ConfigKey.compilerPath);
        const compileIcon = Global.getConfig<string>(ConfigKey.compileIcon);
        const compileBaseFile = Global.getConfig<string>(
            languageId === LanguageId.ahk1
                ? ConfigKey.compileBaseFile
                : ConfigKey.compileBaseFileV2,
        );
        const useMpress = Global.getConfig<boolean>(ConfigKey.useMpress);

        const compileCommand = makeCompileCommand(
            compilerPath,
            currentPath,
            showGui,
            compileIcon,
            compileBaseFile,
            useMpress,
        );

        if (!compileCommand) {
            vscode.window.showErrorMessage('Cannot build compile command.');
            return;
        }

        if (
            (await exec(compileCommand, {
                cwd: `${res(currentPath, '..')}`,
            })) &&
            !showGui
        ) {
            vscode.window.showInformationMessage('Compile success!');
        }
    }

    public static async getPathByActive(): Promise<string> {
        const document = vscode.window.activeTextEditor.document;
        if (document.isUntitled) {
            return await this.createTemplate(document.getText());
        }
        return document.fileName;
    }

    public static async createTemplate(content: string) {
        const path = `temp-${this.getNowDate()}.ahk`;
        return await FileManager.record(path, content, FileModel.write);
    }

    private static checkAndSaveActive(): void {
        if (!vscode.window.activeTextEditor.document.isUntitled) {
            vscode.commands.executeCommand('workbench.action.files.save');
        }
    }

    private static getNowDate(): string {
        const date = new Date();
        let month: string | number = date.getMonth() + 1;
        let strDate: string | number = date.getDate();

        if (month <= 9) {
            month = '0' + month;
        }

        if (strDate <= 9) {
            strDate = '0' + strDate;
        }

        return (
            date.getFullYear() +
            '-' +
            month +
            '-' +
            strDate +
            '-' +
            this.pad(date.getHours(), 2) +
            '-' +
            this.pad(date.getMinutes(), 2) +
            '-' +
            this.pad(date.getSeconds(), 2)
        );
    }

    private static pad(n: any, width: number, z?: any): number {
        z = z || '0';
        n = n + '';
        return n.length >= width
            ? n
            : new Array(width - n.length + 1).join(z) + n;
    }
}
