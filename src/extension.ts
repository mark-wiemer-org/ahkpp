import * as vscode from 'vscode';
import { FormatProvider } from './providers/formattingProvider';

export function activate(context: vscode.ExtensionContext) {
    const language = { language: 'ahk' };
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            language,
            new FormatProvider(),
        ),
    );
}
