import { resolve as res } from "path";
import * as vscode from 'vscode';
import { FileManager, FileModel } from '../common/fileManager';
import { ConfigKey, Global } from '../common/global';
import { Process } from '../common/processWrapper';

export class ScriptRunner {

    /**
     * start debuggin session
     */
    public static startDebugger() {
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri), {
            type: "ahk",
            request: "launch",
            name: "Autohotkey Debugger",
        });
    }

    /**
     * run/debug script
     * @param executePath runtime path
     * @param path execute script path
     * @param debug enable debug model?
     * @param debugPort debug proxy port
     */
    public static async run(executePath = null, path: string = null, debug: boolean = false, debugPort = 9000): Promise<boolean> {
        executePath = Global.getConfig(ConfigKey.executePath)

        if (executePath) {
            if (!path) {
                path = await this.getPathByActive();
            }
            try {
                await Process.exec(`\"${executePath}\"${debug ? ' /debug=localhost:' + debugPort : ''} \"${path}\"`, { cwd: `${res(path, '..')}` });
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * compile current script
     */
    public static async compile() {
        const currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (!currentPath) { return; }
        const pos = currentPath.lastIndexOf(".");
        const compilePath = currentPath.substr(0, pos < 0 ? currentPath.length : pos) + ".exe";
        if (await Process.exec(`"${Global.getConfig(ConfigKey.compilePath)}" /in "${currentPath}" /out "${compilePath}"`, { cwd: `${res(currentPath, '..')}` })) {
            vscode.window.showInformationMessage("compile success!");
        }
    }


    private static async getPathByActive(): Promise<string> {
        const document = vscode.window.activeTextEditor.document
        if (document.isUntitled) {
            const path = `temp-${this.getNowDate()}.ahk`;
            const fullPath = await FileManager.record(path, document.getText(), FileModel.WRITE)
            return fullPath;
        }
        return document.fileName;
    }


    private static getNowDate(): string {
        const date = new Date();
        let month: string | number = date.getMonth() + 1;
        let strDate: string | number = date.getDate();

        if (month <= 9) {
            month = "0" + month;
        }

        if (strDate <= 9) {
            strDate = "0" + strDate;
        }

        return date.getFullYear() + "-" + month + "-" + strDate + "-" + this.pad(date.getHours(), 2) + "-" + this.pad(date.getMinutes(), 2) + "-" + this.pad(date.getSeconds(), 2);
    }


    public static pad(n: any, width: number, z?: any): number {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }


}
