import * as vscode from 'vscode';

export class Global {
    public static configPrefix = 'ahk++';
    private static statusBarItem: vscode.StatusBarItem;

    /** Get configuration from VS Code setting. */
    public static getConfig<T>(key: ConfigKey): T | undefined {
        return vscode.workspace.getConfiguration(this.configPrefix).get<T>(key);
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
    compileBaseFile = 'compile.compileBaseFile',
    compileIcon = 'compile.compileIcon',
    useMpress = 'compile.useMpress',
    compilePath = 'file.compilePath',
    enableIntellisense = 'intellisense.enableIntellisense',
    executePath = 'file.executePath',
    helpPath = 'file.helpPath',
    indentCodeAfterIfDirective = 'formatter.indentCodeAfterIfDirective',
    indentCodeAfterLabel = 'formatter.indentCodeAfterLabel',
    maximumParseLength = 'intellisense.maximumParseLength',
    preserveIndent = 'formatter.preserveIndent',
    templateSnippetName = 'file.templateSnippetName',
    trimExtraSpaces = 'formatter.trimExtraSpaces',
}
