import * as vscode from 'vscode';

export class Global {
    public static configPrefix = 'ahk++';
    private static statusBarItem: vscode.StatusBarItem;
    /**
     * Get a value from the configuration (VSCode setting).
     * @param key Configuration name
     */
    public static getConfig<T>(key: string): T {
        return vscode.workspace.getConfiguration(this.configPrefix).get<T>(key);
    }
    /**
     * Set a value in the global configuration (VSCode setting).
     * @param key Configuration name
     * @param value New value
     * @return Promise (to use with 'await' in test suits)
     */
    public static setConfig(key: string, value: any): Thenable<void> {
        return vscode.workspace
            .getConfiguration(this.configPrefix)
            .update(key, value, true);
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
    allowedNumberOfEmptyLines = 'formatter.allowedNumberOfEmptyLines',
    compilePath = 'file.compilePath',
    enableIntellisense = 'language.enableIntellisense',
    executePath = 'file.executePath',
    helpPath = 'file.helpPath',
    indentCodeAfterSharpDirective = 'formatter.indentCodeAfterSharpDirective',
    trimExtraSpaces = 'formatter.trimExtraSpaces',
}
