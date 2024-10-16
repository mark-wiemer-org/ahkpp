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
import { ConfigKey, ShowOutput } from '../common/global';

const rootPath = path.join(__dirname, '..', '..', '..');

// Currently in `out` folder, need to get back to main `src` folder
const samplesParentPath = path.join(rootPath, 'src/test/samples');

// CI does not have AHK installed
suite('general.showOutput @ignoreCI', () => {
    const before = async (show: ShowOutput) => {
        await updateConfig<ShowOutput>(ConfigKey.showOutput, show);
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

suite.only('exclude', () => {
    const tests: [
        name: string,
        version: 1 | 2,
        exclude: string[],
        expected: boolean,
    ][] = [
        ['no exclusions', 1, [], true],
        ['no exclusions', 2, [], true],
        ['exclusions', 1, ['excluded.ahk'], false],
        // ['exclusions', 2, ['excluded.ahk'], false], // todo support v2 without reloading
    ];

    tests.forEach(([name, version, exclude, expected]) => {
        test(name, async () => {
            const snippetText = 'MyExclu';
            const funcName = 'MyExcludedFunc';
            await updateConfig<string[]>(ConfigKey.exclude, exclude);
            const filePath = resolve(rootPath, `./e2e/main.ahk${version}`);
            const doc = await getDocument(filePath);
            const editor = await showDocument(doc);
            editor.insertSnippet(
                new vscode.SnippetString(snippetText)
                    .appendTabstop(0)
                    .appendText('\n'),
            );
            await sleep(100);
            editor.selection = new vscode.Selection(
                0,
                0,
                0,
                snippetText.length,
            );
            await sleep(100);

            // Get completion items
            const completionItems =
                await vscode.commands.executeCommand<vscode.CompletionList>(
                    'vscode.executeCompletionItemProvider',
                    doc.uri,
                    editor.selection.active,
                );
            const labels = completionItems?.items.map((i) => i.label);
            assert.strictEqual(labels.includes(funcName), expected);
        });
    });
});
