
import * as vscode from "vscode";
import { SymBolProvider } from "./SymbolProvider";
import { FormatProvider } from "./FormatProvider";

export function activate(context: vscode.ExtensionContext) {
    
    vscode.languages.registerDocumentSymbolProvider({ language: 'ahk' }, new SymBolProvider())
    vscode.languages.registerDocumentFormattingEditProvider({ language: 'ahk' },new FormatProvider())

}