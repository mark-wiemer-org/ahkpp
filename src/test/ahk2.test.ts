import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import {
    closePanel,
    getDocument,
    isOutputVisible,
    showDocument,
    updateConfig,
} from './utils';

// Currently in `out` folder, need to get back to main `src` folder
const filesParentPath = path.join(
    __dirname, // ./out/src/test
    '..', // ./out/src
    '..', // ./out
    '..', // .
    'src', // ./src
    'test', // ./src/test
    'samples', // ./src/test/samples
);

suite('ahk2', () => {
    // CI does not have AHK installed
    suite('general.showOutput @ignoreCI', () => {
        const before = async (show: 'always' | 'never') => {
            await updateConfig('general', { showOutput: show });
            const filePath = path.join(filesParentPath, 'ahk2.ahk2');
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
});
