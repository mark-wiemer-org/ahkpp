import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { FormatProvider } from '../../../providers/formattingProvider';
// import * as myExtension from '../../extension';

/** Unformatted input file */
const inFilename = 'demo.in.ahk';
/** Formatted output file */
const outFilename = 'demo.out.ahk';

/** Path to the directory holding the formatting samples */
const filesParentPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'src',
    'test',
    'suite',
    'format',
);

suite('Formatter', () => {
    test('Format test', async () => {
        const outFileString = fs
            .readFileSync(path.join(filesParentPath, outFilename))
            .toString();

        const unformattedSampleFile = await vscode.workspace.openTextDocument(
            path.join(filesParentPath, inFilename),
        );
        const textEditor = await vscode.window.showTextDocument(
            unformattedSampleFile,
        );
        const formatter = new FormatProvider();
        const edits = formatter.provideDocumentFormattingEdits(
            unformattedSampleFile,
            { tabSize: 4, insertSpaces: true },
            null,
        );
        await textEditor.edit((editBuilder) => {
            edits.forEach((edit) =>
                editBuilder.replace(edit.range, edit.newText),
            );
        });
        assert.strictEqual(textEditor.document.getText(), outFileString);
    });
});
