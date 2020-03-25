import * as child_process from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';

class Setting {
    executePath: string;
}

export class ScriptRunner {
    private defaultPath = "\"C:\\Program Files\\Autohotkey\\AutoHotkeyU64.exe\"";
    private settingPath: string;

    constructor(private context: vscode.ExtensionContext) {
        let extPath = this.context['globalStoragePath'];
        this.settingPath = extPath + '/setting.json'
        if (!fs.existsSync(extPath)) {
            fs.mkdirSync(extPath)
        }
    }

    async run() {

        if (fs.existsSync(this.settingPath)) {
            try {
                let setting = JSON.parse(fs.readFileSync(this.settingPath, "utf8")) as Setting
                if (!fs.existsSync(setting.executePath)) {
                    vscode.window.showErrorMessage("Cannot find Autohotkey, run script fail!")
                    fs.unlinkSync(this.settingPath)
                    return;
                }
                vscode.window.activeTextEditor.document.save().then(() => {
                    child_process.exec(`${setting.executePath} ${vscode.window.activeTextEditor.document.fileName}`)
                })
            } catch (err) {
                vscode.window.showErrorMessage(err)
                fs.unlinkSync(this.settingPath)
            }
            return;
        }


        if (fs.existsSync(this.defaultPath)) {
            fs.writeFileSync(this.settingPath, JSON.stringify({ executePath: this.defaultPath }))
            this.run()
        } else {
            if (await this.reqConfigPath()) this.run()
        }

    }


    async reqConfigPath() {
        return await vscode.window.showInputBox({ placeHolder: this.defaultPath, prompt: `you need config the autohotkey bin path.` }).then(value => {
            if (!value) return false;
            fs.writeFileSync(this.settingPath, JSON.stringify({ executePath: value }))
            vscode.window.showInformationMessage("Change Autohotkey Execute Path success!")
            return true;
        })
    }

}
