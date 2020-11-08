import * as vscode from 'vscode';

export class Global {
    public static CONFIG_PREFIX = 'ahk-pp';
    private static statusBarItem: vscode.StatusBarItem;
    /**
     * get configuration from vscode setting.
     * @param key config key
     */
    public static getConfig<T>(key: string): T {
        return vscode.workspace
            .getConfiguration(this.CONFIG_PREFIX)
            .get<T>(key);
    }

    public static updateStatusBarItems(text: string) {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left,
            );
        }
        this.statusBarItem.text = text;
        this.statusBarItem.show();
    }

    public static hide() {
        this.statusBarItem.hide();
    }
}

export enum ConfigKey {
    compilePath = 'compilePath',
    executePath = 'executePath',
    enableIntelliSense = 'enableIntellisense',
}
