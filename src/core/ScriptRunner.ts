import * as child_process from 'child_process';
import * as vscode from 'vscode'
import * as fs from 'fs'

class Setting {
    executePath: string;
}

export class ScriptRunner {
    private static defaultPath = "\"C:\\Program Files\\Autohotkey\\AutoHotkeyU64.exe\"";
    static async run(context: vscode.ExtensionContext) {

        let extPath = context['globalStoragePath'];
        var settingPath = extPath + '/setting.json'
        if (fs.existsSync(settingPath)) {
            var openPath = vscode.Uri.file(settingPath);
            try {
                let settingString = (await vscode.workspace.openTextDocument(openPath)).getText()
                let setting = JSON.parse(settingString) as Setting
                if (!fs.existsSync(setting.executePath)) {
                    vscode.window.showErrorMessage("Cannot find autohotkey, run script fail!")
                    fs.unlinkSync(settingPath)
                    return;
                }
                vscode.window.activeTextEditor.document.save().then(() => {
                    child_process.exec(`${setting.executePath} ${vscode.window.activeTextEditor.document.fileName}`)
                })
            } catch (err) {
                vscode.window.showErrorMessage(err)
                fs.unlinkSync(settingPath)
            }
            return;
        }

        if (!fs.existsSync(extPath)) {
            fs.mkdirSync(extPath)
        }

        if (fs.existsSync(this.defaultPath)) {
            fs.writeFileSync(settingPath, JSON.stringify({ executePath: this.defaultPath }))
            this.run(context)
        } else {
            vscode.window.showInputBox({ placeHolder: this.defaultPath, prompt: `you need config the autohotkey bin path.` }).then(value => {
                if (!value) return;
                fs.writeFileSync(settingPath, JSON.stringify({ executePath: value }))
                this.run(context)
            })
        }

    }

}