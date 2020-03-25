import * as vscode from "vscode";
import { ProviderResult } from "vscode";
import { Detecter } from "./core/Detecter";
import { ScriptRunner } from "./core/ScriptRunner";
import { AhkDebugSession } from "./debugger/AhkDebug";
import { DefProvider } from "./provider/DefProvider";
import { FileProvider } from "./provider/FileProvider";
import { FormatProvider } from "./provider/FormatProvider";
import { SymBolProvider } from "./provider/SymbolProvider";

export function activate(context: vscode.ExtensionContext) {

    const language = { language: "ahk" };
    Detecter.buildByPath(vscode.workspace.rootPath);
    let scriptRunner = new ScriptRunner(context);
    context.subscriptions.push(
        // vscode.languages.registerCompletionItemProvider(language, new CompletionProvider(), " ", "."),
        vscode.languages.registerDefinitionProvider(language, new DefProvider()),
        vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider()),
        vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider()),
        FileProvider.createEditorListenr(),
        vscode.debug.registerDebugAdapterDescriptorFactory('ahk', new InlineDebugAdapterFactory()),
        vscode.commands.registerCommand("run.ahk", () => {
            scriptRunner.run();
        }),
        vscode.commands.registerCommand("run.ahk.config", () => {
            scriptRunner.reqConfigPath();
        })
    )

}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new AhkDebugSession());
    }

}
