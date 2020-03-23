
import * as vscode from "vscode";
import { ScriptRunner } from "./core/ScriptRunner";
import { CompletionProvider } from "./provider/CompletionProvider";
import { DefProvider } from "./provider/DefProvider";
import { FormatProvider } from "./provider/FormatProvider";
import { SymBolProvider } from "./provider/SymbolProvider";
import { FileProvider } from "./provider/FileProvider";
import { Detecter } from "./core/Detecter";

export function activate(context: vscode.ExtensionContext) {

    const language = { language: 'ahk' }
    Detecter.buildByPath(vscode.workspace.rootPath)
    context.subscriptions.push(
        // vscode.languages.registerCompletionItemProvider(language, new CompletionProvider(), " ", "."),
        vscode.languages.registerDefinitionProvider(language, new DefProvider()),
        vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider()),
        vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider()),
        FileProvider.createEditorListenr(),
        vscode.commands.registerCommand("run.ahk", () => {
            ScriptRunner.run()
        })
    )

}