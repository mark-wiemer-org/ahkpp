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
    allowedNumberOfEmptyLines = 'v1.formatter.allowedNumberOfEmptyLines',
    compileBaseFileV1 = 'v1.file.compileBaseFile',
    compileBaseFileV2 = 'v2.file.compileBaseFile',
    compileIcon = 'compiler.compileIcon',
    compilerPath = 'file.compilerPath',
    interpreterPathV1 = 'v1.file.interpreterPath',
    interpreterPathV2 = 'v2.file.interpreterPath',
    helpPathV1 = 'v1.file.helpPath',
    helpPathV2 = 'v2.file.helpPath',
    indentCodeAfterIfDirective = 'v1.formatter.indentCodeAfterIfDirective',
    indentCodeAfterLabel = 'v1.formatter.indentCodeAfterLabel',
    maximumParseLength = 'intellisense.maximumParseLength',
    preserveIndent = 'v1.formatter.preserveIndent',
    templateSnippetNameV1 = 'v1.file.templateSnippetName',
    templateSnippetNameV2 = 'v2.file.templateSnippetName',
    trimExtraSpaces = 'v1.formatter.trimExtraSpaces',
    useMpress = 'compiler.useMpress',
}

export enum LanguageId {
    ahk1 = 'ahk',
    ahk2 = 'ahk2',
}
