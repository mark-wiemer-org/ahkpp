import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import {
    closePanel,
    getDocument,
    isOutputVisible,
    showDocument,
    sleep,
    updateConfig,
} from './utils';
import { resolve } from 'path';

const rootPath = path.join(__dirname, '..', '..', '..');

// Currently in `out` folder, need to get back to main `src` folder
const samplesParentPath = path.join(rootPath, 'src/test/samples');

// CI does not have AHK installed
suite('general.showOutput @ignoreCI', () => {
    const before = async (show: 'always' | 'never') => {
        await updateConfig('general', { showOutput: show });
        const filePath = path.join(samplesParentPath, 'ahk2.ahk2');
        const doc = await getDocument(filePath);
        await showDocument(doc);
    };

    const runTests: [name: string, show: 'always' | 'never'][] = [
        ['always + run', 'always'],
        ['never + run', 'never'],
    ];

    runTests.forEach(([name, show]) => {
        test(name, async () => {
            await before(show);

            // run cmd opens panel when `showOutput` is 'always'
            await closePanel();

            await vscode.commands.executeCommand(`ahk++.run`);

            assert.equal(await isOutputVisible(), show === 'always');
        });
    });
});

suite.only('exclude', () => {
    // todo can only run one test at a time as changes take effect after restart
    test.skip('no exclusions', async () => {
        await vscode.workspace
            .getConfiguration('AHK++')
            .update('exclude', [], vscode.ConfigurationTarget.Workspace);
        const filePath = resolve(rootPath, './e2e/main.ahk');
        const doc = await getDocument(filePath);
        const editor = await showDocument(doc);
        editor.insertSnippet(
            new vscode.SnippetString('MyExclu')
                .appendTabstop(0)
                .appendText('\n'),
        );
        await sleep(100);
        editor.selection = new vscode.Selection(0, 0, 0, 'MyExclu'.length);
        await sleep(100);

        // Get completion items
        const completionItems =
            await vscode.commands.executeCommand<vscode.CompletionList>(
                'vscode.executeCompletionItemProvider',
                doc.uri,
                editor.selection.active,
            );
        const labels = completionItems?.items.map((i) => i.label);
        assert.strictEqual(labels.includes('MyExcludedFunc'), true);
    });

    test('exclusions', async () => {
        await vscode.workspace
            .getConfiguration('AHK++')
            .update(
                'exclude',
                ['excluded.ahk'],
                vscode.ConfigurationTarget.Workspace,
            );
        const filePath = resolve(rootPath, './e2e/main.ahk');
        const doc = await getDocument(filePath);
        const editor = await showDocument(doc);
        editor.insertSnippet(
            new vscode.SnippetString('MyExclu')
                .appendTabstop(0)
                .appendText('\n'),
        );
        await sleep(100);
        editor.selection = new vscode.Selection(0, 0, 0, 'MyExclu'.length);
        await sleep(2_000);

        // Get completion items
        const completionItems =
            await vscode.commands.executeCommand<vscode.CompletionList>(
                'vscode.executeCompletionItemProvider',
                doc.uri,
                editor.selection.active,
            );
        const labels = completionItems?.items.map((i) => i.label);
        assert.strictEqual(labels.includes('MyExcludedFunc'), false);
    });
});
