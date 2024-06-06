import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { Parser } from './parser/parser';
import { RunnerService } from './service/runnerService';
import { DebugSession } from './debugger/debugSession';
import { DefProvider } from './providers/defProvider';
import { createEditorListener } from './service/templateService';
import { FormatProvider } from './providers/formattingProvider';
import { SymbolProvider } from './providers/symbolProvider';
import { FileManager } from './common/fileManager';
import { AhkHoverProvider } from './providers/ahkHoverProvider';
import { RefProvider } from './providers/refProvider';
import { Global, ConfigKey } from './common/global';
import { AhkRenameProvider } from './providers/ahkRenameProvider';
import { SignatureProvider } from './providers/signatureProvider';
import { CompletionProvider } from './providers/completionProvider';
import { openHelp } from './service/helpService';
import { initializeLanguageVersionService } from './service/languageVersionService';

export function activate(context: vscode.ExtensionContext) {
    (async () => {
        Global.updateStatusBarItems('Indexing AutoHotkey Workspace...');
        await Parser.buildByPath(vscode.workspace.rootPath);
        Global.updateStatusBarItems('Index Workspace Success!');
        Global.hide();
    })();

    const languages = [{ language: 'ahk' }, { language: 'ahk2' }];
    FileManager.init(context);
    initializeLanguageVersionService(context);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            languages,
            new AhkHoverProvider(context),
        ),
        vscode.languages.registerDefinitionProvider(
            languages,
            new DefProvider(),
        ),
        vscode.languages.registerRenameProvider(
            languages,
            new AhkRenameProvider(),
        ),
        vscode.languages.registerSignatureHelpProvider(
            languages,
            new SignatureProvider(),
            '(',
            ',',
        ),
        vscode.languages.registerDocumentSymbolProvider(
            languages,
            new SymbolProvider(),
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            languages,
            new FormatProvider(),
        ),
        vscode.languages.registerReferenceProvider(
            languages,
            new RefProvider(),
        ),
        vscode.debug.registerDebugAdapterDescriptorFactory(
            'ahk',
            new InlineDebugAdapterFactory(),
        ),
        createEditorListener(),
        vscode.commands.registerCommand('ahk++.compile', () =>
            RunnerService.compile(false),
        ),
        vscode.commands.registerCommand('ahk++.compilerGui', () =>
            RunnerService.compile(true),
        ),
        vscode.commands.registerCommand('ahk++.debug', () =>
            RunnerService.startDebugger(),
        ),
        vscode.commands.registerCommand('ahk++.openHelp', openHelp),
        vscode.commands.registerCommand('ahk++.run', () => RunnerService.run()),
        vscode.commands.registerCommand('ahk++.runSelection', () =>
            RunnerService.runSelection(),
        ),
    );

    if (Global.getConfig<boolean>(ConfigKey.enableIntellisense)) {
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                languages,
                new CompletionProvider(),
                '.',
            ),
        );
    }
}

class InlineDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    public createDebugAdapterDescriptor(
        _session: vscode.DebugSession,
    ): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }
}
