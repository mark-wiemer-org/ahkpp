import * as vscode from "vscode";
import { ProviderResult } from "vscode";
import { Detecter } from "./core/detect/detecter";
import { ScriptRunner } from "./core/ScriptRunner";
import { DebugSession } from "./debugger/debugSession";
import { DefProvider } from "./provider/DefProvider";
import { TemplateProvider } from "./provider/templateProvider";
import { FormatProvider } from "./provider/formattingProvider";
import { SymBolProvider } from "./provider/SymbolProvider";
import { FileManager } from "./common/fileManager";
import { AhkHoverProvider } from "./provider/ahkHoverProvider";
import { RefProvider } from "./provider/RefProvider";
import { Global } from "./common/global";

export function activate(context: vscode.ExtensionContext) {

    (async () => {
        Global.updateStatusBarItems("Indexing Autohotkey Workspace...")
        await Detecter.buildByPath(vscode.workspace.rootPath);
        Global.updateStatusBarItems("Index Workspace Success!")
    })();

    const language = { language: "ahk" };
    FileManager.init(context)
    context.subscriptions.push(
        // vscode.languages.registerCompletionItemProvider(language, new CompletionProvider(), " ", "."),
        vscode.languages.registerHoverProvider(language, new AhkHoverProvider(context)),
        vscode.languages.registerDefinitionProvider(language, new DefProvider()),
        vscode.languages.registerDocumentSymbolProvider(language, new SymBolProvider()),
        vscode.languages.registerDocumentFormattingEditProvider(language, new FormatProvider()),
        vscode.languages.registerReferenceProvider(language, new RefProvider()),
        TemplateProvider.createEditorListenr(),
        vscode.debug.registerDebugAdapterDescriptorFactory('ahk', new InlineDebugAdapterFactory()),
        vscode.commands.registerCommand("run.ahk", () => ScriptRunner.run()),
        vscode.commands.registerCommand("debug.ahk", () => ScriptRunner.startDebugger()),
        vscode.commands.registerCommand("compile.ahk", () => ScriptRunner.compile())
    );

}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    public createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }

}
