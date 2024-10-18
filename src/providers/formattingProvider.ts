import * as vscode from 'vscode';
import { ConfigKey, Global } from '../common/global';
import { documentToString, internalFormat } from './formattingProvider.utils';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    );
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
    ): vscode.TextEdit[] {
        const stringToFormat = documentToString(document);

        const allowedNumberOfEmptyLines = Global.getConfig<number>(
            ConfigKey.allowedNumberOfEmptyLines,
        );

        const indentCodeAfterLabel = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterLabel,
        );

        const indentCodeAfterIfDirective = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterIfDirective,
        );

        const preserveIndent = Global.getConfig<boolean>(
            ConfigKey.preserveIndent,
        );

        const trimExtraSpaces = Global.getConfig<boolean>(
            ConfigKey.trimExtraSpaces,
        );

        const formattedString = internalFormat(stringToFormat, {
            ...options,
            allowedNumberOfEmptyLines,
            indentCodeAfterLabel,
            indentCodeAfterIfDirective,
            preserveIndent,
            trimExtraSpaces,
        });

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedString),
        ];
    }
}
