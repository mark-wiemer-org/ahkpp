
import * as vscode from "vscode";
import { SymBolProvider } from "./provider/SymbolProvider";
import { FormatProvider } from "./provider/FormatProvider";
import { CompletionProvider } from "./provider/CompletionProvider";

export function activate(context: vscode.ExtensionContext) {

    const language = { language: 'ahk' }
    const complectionProvider = vscode.languages.registerCompletionItemProvider(language, new CompletionProvider()," ",".")
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider())
    const formatProvider = vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider())

    context.subscriptions.push(complectionProvider, symbolProvider, formatProvider)

}