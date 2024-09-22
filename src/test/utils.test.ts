import * as assert from 'assert';
import * as vscode from 'vscode';
import { closePanel, isOutputVisible } from './utils';

suite('utils', () => {
    suite('closeOutputView', () => {
        test('open to closed', async () => {
            vscode.commands.executeCommand('workbench.action.togglePanel'); // open panel
            await closePanel();

            assert.equal(await isOutputVisible(), false);
        });
    });
});
