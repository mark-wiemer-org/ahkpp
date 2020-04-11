import * as fs from 'fs';
import * as vscode from 'vscode';
import { Process } from '../common/processWrapper';
import { Setting } from '../common/setting';
import { resolve as res } from "path";

export class ScriptRunner {

    private defaultPath = `C:\\Program Files\\Autohotkey\\AutoHotkeyU64.exe`;
    private KEY = 'executePath';
    private setting: Setting;
    public static instance: ScriptRunner;

    constructor(context: vscode.ExtensionContext) {
        this.setting = new Setting(context);
        ScriptRunner.instance = this;
    }

    /**
     * start debuggin session
     */
    public startDebugger() {
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri), {
            type: "ahk",
            request: "launch",
            name: "Autohotkey Debugger",
        });
    }

    /**
     * run/debug script
     * @param path execute script path
     * @param debug enable debug model?
     * @param debugPort debug proxy port
     */
    public async run(path: string = null, debug: boolean = false, debugPort = 9000) {
        const executePath = await this.buildExecutePath();
        if (executePath) {
            path = path ? path : vscode.window.activeTextEditor.document.fileName;
            await Process.exec(`\"${executePath}\"${debug ? ' /debug=localhost:' + debugPort : ''} \"${path}\"`, {cwd: `${res(path, '..')}`});
            return true;
        } else {
            return false;
        }
    }

    /**
     * compile current script
     */
    public async compile() {
        const currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (!currentPath) { return; }
        const pos = currentPath.lastIndexOf(".");
        const compilePath = currentPath.substr(0, pos < 0 ? currentPath.length : pos) + ".exe";
        if (await Process.exec(`"C:/Program Files/autoHotkey/Compiler/Ahk2Exe.exe" /in "${currentPath}" /out "${compilePath}"`, { cwd: `${res(currentPath, '..')}` })) {
            vscode.window.showInformationMessage("compile success!");
        }
    }

    private async buildExecutePath(): Promise<string> {
        const executePath = this.setting.get(this.KEY);
        if (executePath) {
            if (fs.existsSync(executePath)) {
                return executePath;
            }
            vscode.window.showErrorMessage("Valid Autohotkey Path, run script fail!");
            this.setting.set(this.KEY, null);
            return this.buildExecutePath();
        }

        if (fs.existsSync(this.defaultPath)) {
            // setting look like not sync
            // this.setting.set(this.KEY, this.defaultPath)
            return this.defaultPath;
        } else {
            if (await this.reqConfigPath()) { return this.buildExecutePath(); }
        }
        return null;
    }

    public async reqConfigPath(): Promise<boolean> {
        return vscode.window.showInputBox({ placeHolder: this.defaultPath, prompt: `you need config the autohotkey bin path.` }).then((value) => {
            if (!value) { return false; }
            this.setting.set(this.KEY, value);
            vscode.window.showInformationMessage("Change Autohotkey Execute Path success!");
            return true;
        });
    }

}
