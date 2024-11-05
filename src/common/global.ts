import * as vscode from 'vscode';

export const configPrefix = 'AHK++';

export class Global {
    private static statusBarItem: vscode.StatusBarItem;

    /** Gets config value from VS Code */
    // todo move out of class
    public static getConfig<T>(key: ConfigKey): T | undefined {
        return (
            // older versions of AHK++ used `ahk++` lowercase
            // todo add deprecation warning for lowercase config vars
            vscode.workspace.getConfiguration('ahk++').get<T>(key) ??
            vscode.workspace.getConfiguration(configPrefix).get<T>(key)
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
// Ref "Settings UI is overwhelming for extensions with lots of settings"
// https://github.com/microsoft/vscode/issues/70589
export enum ConfigKey {
    allowedNumberOfEmptyLines = 'v1.formatter.allowedNumberOfEmptyLines',
    compileBaseFileV1 = 'v1.file.compileBaseFile',
    compileBaseFileV2 = 'v2.file.compileBaseFile',
    compileIcon = 'compiler.compileIcon',
    compilerPath = 'compiler.compilerPath',
    enableV2LanguageServer = 'general.enableV2LanguageServer',
    exclude = 'exclude',
    general = 'general',
    generalV2 = 'v2.general',
    helpPathV1 = 'v1.file.helpPath',
    helpPathV2 = 'v2.file.helpPath',
    indentCodeAfterIfDirective = 'v1.formatter.indentCodeAfterIfDirective',
    indentCodeAfterLabel = 'v1.formatter.indentCodeAfterLabel',
    interpreterPathV1 = 'v1.file.interpreterPath',
    interpreterPathV2 = 'v2.file.interpreterPath',
    maximumParseLength = 'v1.intellisense.maximumParseLength',
    preserveIndent = 'v1.formatter.preserveIndent',
    showOutput = 'general.showOutput',
    templateSnippetNameV1 = 'v1.file.templateSnippetName',
    templateSnippetNameV2 = 'v2.file.templateSnippetName',
    trimExtraSpaces = 'v1.formatter.trimExtraSpaces',
    useMpress = 'compiler.useMpress',
}

/** Also in submodule */
export enum LanguageId {
    ahk1 = 'ahk',
    ahk2 = 'ahk2',
}

/** Defined in package.json */
export type ShowOutput = 'always' | 'never';

export enum LibIncludeType {
    Disabled = 'Disabled',
    Local = 'Local',
    UserAndStandard = 'User and Standard',
    All = 'All',
}
