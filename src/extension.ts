import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { Parser } from './parser/parser';
import { RunnerService } from './service/runnerService';
import { DebugSession } from './debugger/debugSession';
import { DefProvider } from './providers/defProvider';
import { TemplateService } from './service/templateService';
import { FormatProvider } from './providers/formattingProvider';
import { SymBolProvider } from './providers/SymbolProvider';
import { FileManager } from './common/fileManager';
import { AhkHoverProvider } from './providers/ahkHoverProvider';
import { RefProvider } from './providers/refProvider';
import { Global, ConfigKey } from './common/global';
import { AhkRenameProvider } from './providers/ahkRenameProvider';
import { SignatureProvider } from './providers/signatureProvider';
import { CompletionProvider } from './providers/completionProvider';
import { DocumentService } from './service/documentService';

export function activate(context: vscode.ExtensionContext) {
    (async () => {
        Global.updateStatusBarItems('Indexing AutoHotkey Workspace...');
        await Parser.buildByPath(vscode.workspace.rootPath);
        Global.updateStatusBarItems('Index Workspace Success!');
        Global.hide();
    })();

    const language = { language: 'ahk' };
    FileManager.init(context);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            language,
            new AhkHoverProvider(context),
        ),
        vscode.languages.registerDefinitionProvider(
            language,
            new DefProvider(),
        ),
        vscode.languages.registerRenameProvider(
            language,
            new AhkRenameProvider(),
        ),
        vscode.languages.registerSignatureHelpProvider(
            language,
            new SignatureProvider(),
            '(',
            ',',
        ),
        vscode.languages.registerDocumentSymbolProvider(
            language,
            new SymBolProvider(),
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            language,
            new FormatProvider(),
        ),
        vscode.languages.registerReferenceProvider(language, new RefProvider()),
        vscode.debug.registerDebugAdapterDescriptorFactory(
            'ahk',
            new InlineDebugAdapterFactory(),
        ),
        TemplateService.createEditorListener(),
        vscode.commands.registerCommand('run.ahk', () => RunnerService.run()),
        vscode.commands.registerCommand('document.open', () =>
            DocumentService.open(),
        ),
        vscode.commands.registerCommand('debug.ahk', () =>
            RunnerService.startDebugger(),
        ),
        vscode.commands.registerCommand('compile.ahk', () =>
            RunnerService.compile(),
        ),
    );

    if (Global.getConfig<boolean>(ConfigKey.enableIntelliSense)) {
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                language,
                new CompletionProvider(),
                ' ',
                '.',
            ),
        );
    }
}

class InlineDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory {
    public createDebugAdapterDescriptor(
        _session: vscode.DebugSession,
    ): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }
}
