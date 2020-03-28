import * as vscode from 'vscode';
import * as fs from 'fs';

export class Setting {
    executePath: string;
    private settingPath: string;
    constructor(private context: vscode.ExtensionContext) {
        let extPath = this.context['globalStoragePath'];
        if (!fs.existsSync(extPath)) {
            fs.mkdirSync(extPath)
        }
        this.settingPath = extPath + '/setting.json'

    }
    public get(key: string): string {
        if (!fs.existsSync(this.settingPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(this.settingPath, "utf8"))[key];
        } catch (err) {
            return null;
        }
    }
    public set(key: string, value: string) {
        fs.writeFileSync(this.settingPath, JSON.stringify({ [key]: value }))
    }
}
