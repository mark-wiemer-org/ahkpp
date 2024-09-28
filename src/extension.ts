import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { Parser } from './parser/parser.js';
import { RunnerService } from './service/runnerService.js';
import { DebugSession } from './debugger/debugSession.js';
import { DefProvider } from './providers/defProvider.js';
import { createEditorListener } from './service/templateService.js';
import { FormatProvider } from './providers/formattingProvider.js';
import { SymbolProvider } from './providers/symbolProvider.js';
import { FileManager } from './common/fileManager.js';
import { AhkHoverProvider } from './providers/ahkHoverProvider.js';
import { RefProvider } from './providers/refProvider.js';
import { Global } from './common/global.js';
import { AhkRenameProvider } from './providers/ahkRenameProvider.js';
import { SignatureProvider } from './providers/signatureProvider.js';
import { CompletionProvider } from './providers/completionProvider.js';
import { openHelp } from './service/helpService.js';
import { initializeLanguageVersionService } from './service/languageVersionService.js';
import { activate as activateV2 } from '../ahk2/client/src/extension.js';

export function activate(context: vscode.ExtensionContext) {
    // when debugging, this goes into the Debug Console (Ctrl + Shift + Y)
    // for server logs, see Extension Development Host > Output > AHK++
    console.log('Activating AHK++');
    (async () => {
        Global.updateStatusBarItems('Indexing AutoHotkey workspace...');
        await Parser.buildByPath(vscode.workspace.rootPath);
        Global.updateStatusBarItems('Indexed AutoHotkey workspace :)');
        Global.hide();
    })();

    const language = { language: 'ahk' };
    FileManager.init(context);
    initializeLanguageVersionService(context);
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
            new SymbolProvider(),
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
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            language,
            new CompletionProvider(),
            '.',
        ),
    );

    activateV2(context);
}

class InlineDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    public createDebugAdapterDescriptor(): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }
}
