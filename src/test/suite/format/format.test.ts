import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { FormatProvider } from '../../../providers/formattingProvider';

interface FormatTest {
    filenameRoot: string;
    options: vscode.FormattingOptions;
}

const formatTests: FormatTest[] = [
    { filenameRoot: 'demo', options: { tabSize: 4, insertSpaces: true } },
    { filenameRoot: 'multiline', options: { tabSize: 4, insertSpaces: false } },
];
const inFilenameSuffix = '.in.ahk';
const outFilenameSuffix = '.out.ahk';

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
    formatTests.forEach((formatTest) => {
        test(`Format ${formatTest.filenameRoot}`, async () => {
            const inFilename = formatTest.filenameRoot + inFilenameSuffix;
            const outFilename = formatTest.filenameRoot + outFilenameSuffix;
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
                formatTest.options,
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
});
