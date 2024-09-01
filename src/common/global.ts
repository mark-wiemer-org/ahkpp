import * as vscode from 'vscode';

export class Global {
    private static statusBarItem: vscode.StatusBarItem;

    /** Gets config value from VS Code */
    public static getConfig<T>(key: ConfigKey): T | undefined {
        return (
            vscode.workspace.getConfiguration('ahk++').get<T>(key) ??
            vscode.workspace.getConfiguration('AHK++').get<T>(key)
        );
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

/** Defined in package.json */
// PascalCase formats value shown to user properly
// Ref https://github.com/microsoft/vscode/issues/70589
export enum ConfigKey {
    allowedNumberOfEmptyLines = 'v1.formatter.allowedNumberOfEmptyLines',
    compileBaseFileV1 = 'v1.file.compileBaseFile',
    compileBaseFileV2 = 'v2.file.compileBaseFile',
    compileIcon = 'compiler.compileIcon',
    compilerPath = 'compiler.compilerPath',
    interpreterPathV1 = 'v1.file.interpreterPath',
    interpreterPathV2 = 'v2.file.interpreterPath',
    helpPathV1 = 'v1.file.helpPath',
    helpPathV2 = 'v2.file.helpPath',
    indentCodeAfterIfDirective = 'v1.formatter.indentCodeAfterIfDirective',
    indentCodeAfterLabel = 'v1.formatter.indentCodeAfterLabel',
    maximumParseLength = 'v1.intellisense.maximumParseLength',
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
