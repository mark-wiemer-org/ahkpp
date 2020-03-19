
import * as vscode from "vscode";
import { SymBolProvider } from "./provider/SymbolProvider";
import { FormatProvider } from "./provider/FormatProvider";
import { CompletionProvider } from "./provider/CompletionProvider";
import { DefProvider } from "./provider/DefProvider";

export function activate(context: vscode.ExtensionContext) {

    const language = { language: 'ahk' }
    const complectionProvider = vscode.languages.registerCompletionItemProvider(language, new CompletionProvider(), " ", ".")
    const definitionProvider = vscode.languages.registerDefinitionProvider(language, new DefProvider())
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider())
    const formatProvider = vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider())
    vscode.workspace.registerFileSystemProvider

    // context.subscriptions.push(complectionProvider, definitionProvider, symbolProvider, formatProvider)

}