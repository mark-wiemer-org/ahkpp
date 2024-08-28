import { resolve as res } from 'path';
import * as vscode from 'vscode';
import { FileManager, FileModel } from '../common/fileManager';
import { ConfigKey, Global } from '../common/global';
import { exec } from '../common/processWrapper';
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import { isV1 } from '../common/codeUtil';

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
    /** Start debug session */
    public static async startDebugger(script?: string) {
        const cwd = script
            ? vscode.Uri.file(script)
            : vscode.window.activeTextEditor.document.uri;
        script = script ? script : await this.getPathByActive();
        const debugPlusExists = !!vscode.extensions.getExtension(
            'zero-plusplus.vscode-autohotkey-debug',
        );
        const interpreterPathKey = isV1()
            ? ConfigKey.interpreterPathV1
            : ConfigKey.interpreterPathV2;
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cwd), {
            type: debugPlusExists ? 'autohotkey' : 'ahk',
            request: 'launch',
            name: 'AutoHotkey Debugger',
            runtime: Global.getConfig<string>(interpreterPathKey),
            program: script,
        });
    }

    /**
     * Compiles current script
     */
    public static async compile(showGui: boolean) {
        const currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (!fs.existsSync(currentPath)) {
            vscode.window.showErrorMessage('Cannot compile new files.');
            return;
        }
        this.checkAndSaveActive();

        const compilerPath = Global.getConfig<string>(ConfigKey.compilerPath);
        const compileIcon = Global.getConfig<string>(ConfigKey.compileIcon);
        const compileBaseFile = Global.getConfig<string>(
            isV1() ? ConfigKey.compileBaseFileV1 : ConfigKey.compileBaseFileV2,
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

    private static pad(n: number, width: number): number | string {
        const nString = n + '';
        return nString.length >= width
            ? n
            : new Array(width - nString.length + 1).join('0') + n;
    }
}
