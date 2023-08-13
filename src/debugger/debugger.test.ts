import * as path from 'path';
import * as vscode from 'vscode';
import { getDocument, sleep } from '../test/utils';

// Currently in `out` folder, need to get back to main `src` folder
const filesParentPath = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'debugger',
    'samples',
);

suite('debugger', () => {
    test.only('works', async () => {
        const filePath = path.join(filesParentPath, 'debugger.ahk');
        const file = await getDocument(filePath);
        await vscode.window.showTextDocument(file);
        vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
        vscode.debug.addBreakpoints([
            new vscode.SourceBreakpoint(
                new vscode.Location(
                    vscode.Uri.file(filePath),
                    new vscode.Position(11, 0),
                ),
            ),
        ]);

        await sleep(5_000);
    });
});
