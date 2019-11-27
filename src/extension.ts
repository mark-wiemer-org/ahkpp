
import * as vscode from "vscode";
import { SymBolProvider } from "./SymbolProvider";
import { FormatProvider } from "./FormatProvider";

export function activate(context: vscode.ExtensionContext) {
    
    const symbolProvider=vscode.languages.registerDocumentSymbolProvider({ language: 'ahk' }, new SymBolProvider())
    const formatProvider=vscode.languages.registerDocumentFormattingEditProvider({ language: 'ahk' },new FormatProvider())

    context.subscriptions.push(symbolProvider,formatProvider)

}