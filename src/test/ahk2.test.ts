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
        const tests: [
            name: string,
            show: 'always' | 'never',
            runOrDebug: 'run' | 'debug',
        ][] = [
            ['always + run', 'always', 'run'],
            ['never + run', 'never', 'run'],
            // ['always + debug', 'always', 'debug'],
            // ['never + debug', 'never', 'debug'],
        ];

        tests.forEach(([name, show, runOrDebug]) => {
            test(name, async () => {
                await updateConfig('general', { showOutputView: show });
                const filePath = path.join(filesParentPath, 'ahk2.ahk2');
                const doc = await getDocument(filePath);
                await showDocument(doc);

                // run cmd opens panel
                // debug cmd opens debug console only when panel already opened
                if (runOrDebug === 'run') await closePanel();
                // else await vscode.commands.executeCommand('terminal.focus'); // todo

                await vscode.commands.executeCommand(`ahk++.${runOrDebug}`);

                assert.equal(await isOutputVisible(), show === 'always');
            });
        });
    });
});
