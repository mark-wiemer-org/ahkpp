import * as vscode from 'vscode';

export type FormatOptions = Pick<
    vscode.FormattingOptions,
    'tabSize' | 'insertSpaces'
> & {
    preserveIndent: boolean;
    trimExtraSpaces: boolean;
    allowedNumberOfEmptyLines: number;
};
