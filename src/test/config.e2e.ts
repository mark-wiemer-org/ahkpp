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
import { ConfigKey, LibIncludeType, ShowOutput } from '../common/global';
import { suite, before, test } from 'mocha';

const rootPath = path.join(__dirname, '..', '..', '..');

// Currently in `out` folder, need to get back to main `src` folder
const samplesParentPath = path.join(rootPath, 'src/test/samples');

// CI does not have AHK installed
suite('general.showOutput @ignoreCI', () => {
    const before = async (show: ShowOutput) => {
        await updateConfig<{ showOutput: ShowOutput }>(ConfigKey.general, {
            showOutput: show,
        });
        const filePath = path.join(samplesParentPath, 'ahk2.ahk2');
        const doc = await getDocument(filePath);
        await showDocument(doc);
    };

    const runTests: [name: string, show: ShowOutput][] = [
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

suite('exclude', () => {
    /**
     * These tests run in a specific order to update the config correctly
     * Config does not update on v2 for speed
     */
    const tests: [
        name: string,
        version: 1 | 2,
        exclude: string[],
        expected: boolean,
    ][] = [
        ['v1 no exclusions', 1, [], true],
        ['v2 no exclusions', 2, [], true],
        ['v1 exclusions', 1, ['excluded.ahk'], false],
        ['v2 exclusions', 2, ['excluded.ahk'], false],
        ['back to v1 no exclusions', 1, [], true],
        ['back to v2 no exclusions', 2, [], true],
    ];

    before(async () => {
        await updateConfig<{ librarySuggestions: LibIncludeType }>(
            ConfigKey.general,
            { librarySuggestions: LibIncludeType.All },
        );
    });

    tests.forEach(([name, version, exclude, expected]) => {
        test(name, async () => {
            const snippetText = 'MyExclu';
            const funcName = 'MyExcludedFunc';
            if (version === 1)
                await updateConfig<string[]>(ConfigKey.exclude, exclude);
            const filePath = resolve(rootPath, `./e2e/main.ahk${version}`);
            const doc = await getDocument(filePath);
            const editor = await showDocument(doc);
            editor.insertSnippet(
                new vscode.SnippetString(snippetText)
                    .appendTabstop(0)
                    .appendText('\n'),
            );
            await sleep(1_000);
            editor.selection = new vscode.Selection(
                0,
                0,
                0,
                snippetText.length,
            );
            await sleep(1_000);

            // Get completion items
            const completionItems =
                await vscode.commands.executeCommand<vscode.CompletionList>(
                    'vscode.executeCompletionItemProvider',
                    doc.uri,
                    editor.selection.active,
                );
            await sleep(1_000);
            const labels = completionItems?.items.map((i) => i.label);
            assert.strictEqual(labels.includes(funcName), expected);
        });
    });
});
