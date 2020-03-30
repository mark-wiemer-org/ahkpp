import * as fs from 'fs';
import * as vscode from 'vscode';
import { Process } from '../common/processWrapper';
import { Setting } from '../common/setting';

export class ScriptRunner {

    private defaultPath = `C:\\Program Files\\Autohotkey\\AutoHotkeyU64.exe`;
    private KEY = 'executePath';
    private setting: Setting;
    public static instance: ScriptRunner;

    constructor(context: vscode.ExtensionContext) {
        this.setting = new Setting(context)
        ScriptRunner.instance = this
    }

    /**
     * start debuggin session
     */
    startDebugger() {
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri), {
            type: "ahk",
            request: "launch",
            name: "Autohotkey Debugger"
        })
    }

    /**
     * run/debug script
     * @param path execute script path
     * @param debug enable debug model?
     * @param debugPort debug proxy port
     */
    async run(path: string = null, debug: boolean = false, debugPort = 9000) {
        let executePath = await this.buildExecutePath()
        if (executePath) {
            Process.exec(`\"${executePath}\"${debug ? ' /debug=localhost:' + debugPort : ''} \"${path ? path : vscode.window.activeTextEditor.document.fileName}\"`)
            return true;
        } else {
            return false;
        }
    }

    /**
     * compile current script
     */
    async compile() {
        let currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (!currentPath) return;
        var pos = currentPath.lastIndexOf(".");
        let compilePath = currentPath.substr(0, pos < 0 ? currentPath.length : pos) + ".exe"
        if (await Process.exec(`"C:/Program Files/autoHotkey/Compiler/Ahk2Exe.exe" /in "${currentPath}" /out "${compilePath}"`)) {
            vscode.window.showInformationMessage("compile success!")
        }
    }

    private async buildExecutePath(): Promise<string> {
        let executePath = this.setting.get(this.KEY)
        if (executePath) {
            if (fs.existsSync(executePath)) {
                return executePath;
            }
            vscode.window.showErrorMessage("Valid Autohotkey Path, run script fail!")
            this.setting.set(this.KEY, null);
            return this.buildExecutePath();
        }

        if (fs.existsSync(this.defaultPath)) {
            // setting look like not sync
            // this.setting.set(this.KEY, this.defaultPath)
            return this.defaultPath;
        } else {
            if (await this.reqConfigPath()) return this.buildExecutePath()
        }
        return null;
    }

    async reqConfigPath(): Promise<boolean> {
        return await vscode.window.showInputBox({ placeHolder: this.defaultPath, prompt: `you need config the autohotkey bin path.` }).then(value => {
            if (!value) return false;
            this.setting.set(this.KEY, value)
            vscode.window.showInformationMessage("Change Autohotkey Execute Path success!")
            return true;
        })
    }

}
