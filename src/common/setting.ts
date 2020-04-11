import * as vscode from 'vscode';
import * as fs from 'fs';

export class Setting {
    executePath: string;
    private settingPath: string;
    private interSetting = {};
    constructor(private context: vscode.ExtensionContext) {
        const extPath = this.context.globalStoragePath;
        if (!fs.existsSync(extPath)) {
            fs.mkdirSync(extPath);
        }
        this.settingPath = extPath + '/setting.json';

    }
    public get(key: string): string {
        if (!fs.existsSync(this.settingPath)) { return this.interSetting[key]; }
        try {
            return JSON.parse(fs.readFileSync(this.settingPath, "utf8"))[key];
        } catch (err) {
            return this.interSetting[key];
        }
    }
    public set(key: string, value: string) {
        try {
            fs.writeFileSync(this.settingPath, JSON.stringify({ [key]: value }))
        } catch (err) {
            this.interSetting[key] = value;
        }
    }
}
