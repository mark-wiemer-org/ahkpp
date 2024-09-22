import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { getDocument, isOutputVisible } from './utils';

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
        test('always + run', async () => {
            vscode.workspace
                .getConfiguration('AHK++')
                .update('general', { showOutputView: 'always' }, true);

            const filePath = path.join(filesParentPath, 'ahk2.ahk2');
            const doc = await getDocument(filePath);

            await vscode.window.showTextDocument(doc);
            await vscode.commands.executeCommand('ahk++.run');

            assert.equal(await isOutputVisible(), true);
        });
    });
});
