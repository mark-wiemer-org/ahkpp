import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { FormatProvider } from '../../../providers/formattingProvider';

const inFilenameSuffix = '.in.ahk';
const outFilenameSuffix = '.out.ahk';
interface FormatTest {
    /** Name of the file, excluding the suffix (@see inFilenameSuffix, @see outFilenameSuffix) */
    filenameRoot: string;
    /** If not provided, file will be formatted with 4 spaces. */
    options?: Partial<vscode.FormattingOptions>;
}
/** Default formatting options */
const defaultOptions: vscode.FormattingOptions = {
    tabSize: 4,
    insertSpaces: true,
};
const formatTests: FormatTest[] = [
    {
        filenameRoot: '25-multiline-string',
    },
    {
        filenameRoot: '58-parentheses-indentation',
    },
    {
        filenameRoot: '72-paren-hotkey',
    },
    { filenameRoot: 'ahk-explorer' },
    { filenameRoot: 'demo' },
    {
        filenameRoot: 'insert-spaces-false',
        options: { insertSpaces: false },
    },
    {
        filenameRoot: 'tab-size-2',
        options: { tabSize: 2 },
    },
];

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
    'samples',
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
                {
                    ...defaultOptions,
                    ...formatTest.options,
                },
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
