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

suite.only('ahk2', () => {
    suite('general.showOutputView', () => {
        const before = async (show: 'always' | 'never') => {
            await updateConfig('general', { showOutputView: show });
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

                // run cmd opens panel when `showOutputView` is 'always'
                await closePanel();

                await vscode.commands.executeCommand(`ahk++.run`);

                assert.equal(await isOutputVisible(), show === 'always');
            });
        });

        const debugTests: [name: string, show: 'always' | 'never'][] = [
            ['always + debug', 'always'],
            ['never + debug', 'never'],
        ];

        debugTests.forEach(([name, show]) => {
            test(name, async () => {
                await before(show);

                // todo
            });
        });
    });
});
