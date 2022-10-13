import * as vscode from 'vscode';

export type FormatOptions = Pick<
    vscode.FormattingOptions,
    'tabSize' | 'insertSpaces'
> & {
    indentCodeAfterLabel: boolean;
    indentCodeAfterSharpDirective: boolean;
    preserveIndent: boolean;
    trimExtraSpaces: boolean;
    allowedNumberOfEmptyLines: number;
};
