import * as vscode from 'vscode';

export type FormatOptions = Pick<
    vscode.FormattingOptions,
    'tabSize' | 'insertSpaces'
> & {
    indentCodeAfterSharpDirective: boolean;
    preserveIndent: boolean;
    trimExtraSpaces: boolean;
    allowedNumberOfEmptyLines: number;
};
