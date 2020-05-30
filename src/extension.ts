import * as vscode from "vscode";
import { ProviderResult } from "vscode";
import { Detecter } from "./core/Detecter";
import { ScriptRunner } from "./core/ScriptRunner";
import { DebugSession } from "./debugger/debugSession";
import { DefProvider } from "./provider/DefProvider";
import { FileProvider } from "./provider/FileProvider";
import { FormatProvider } from "./provider/FormatProvider";
import { SymBolProvider } from "./provider/SymbolProvider";
import { FileManager } from "./common/fileManager";

export function activate(context: vscode.ExtensionContext) {

    Detecter.buildByPath(vscode.workspace.rootPath);
    const language = { language: "ahk" };
    FileManager.init(context)
    const scriptRunner = new ScriptRunner(context);
    context.subscriptions.push(
        // vscode.languages.registerCompletionItemProvider(language, new CompletionProvider(), " ", "."),
        vscode.languages.registerDefinitionProvider(language, new DefProvider()),
        vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider()),
        vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider()),
        FileProvider.createEditorListenr(),
        vscode.debug.registerDebugAdapterDescriptorFactory('ahk', new InlineDebugAdapterFactory()),
        vscode.commands.registerCommand("run.ahk", () => scriptRunner.run()),
        vscode.commands.registerCommand("debug.ahk", () => scriptRunner.startDebugger()),
        vscode.commands.registerCommand("compile.ahk", () => scriptRunner.compile()),
        vscode.commands.registerCommand("run.ahk.config", () => scriptRunner.reqConfigPath()),
    );

}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    public createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }

}
