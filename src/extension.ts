
import * as vscode from "vscode";
import { SymBolProvider } from "./SymbolProvider";

export function activate(context: vscode.ExtensionContext) {
    
    vscode.languages.registerDocumentSymbolProvider({ language: 'ahk' }, new SymBolProvider())

}