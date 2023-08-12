import * as vscode from 'vscode';

export class Global {
    public static configPrefix = 'ahkV1Formatter';

    /** Get configuration from VS Code setting. */
    public static getConfig<T>(key: ConfigKey): T | undefined {
        return vscode.workspace.getConfiguration(this.configPrefix).get<T>(key);
    }
}

export enum ConfigKey {
    allowedNumberOfEmptyLines = 'allowedNumberOfEmptyLines',
    indentCodeAfterIfDirective = 'indentCodeAfterIfDirective',
    indentCodeAfterLabel = 'indentCodeAfterLabel',
    preserveIndent = 'preserveIndent',
    trimExtraSpaces = 'trimExtraSpaces',
}
