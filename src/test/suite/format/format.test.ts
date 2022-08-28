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
    { filenameRoot: '25-multiline-string' },
    { filenameRoot: '40-command-inside-text' },
    { filenameRoot: '56-return-command-after-label' },
    { filenameRoot: '58-parentheses-indentation' },
    { filenameRoot: '59-one-command-indentation' },
    { filenameRoot: '72-paren-hotkey' },
    { filenameRoot: '119-semicolon-inside-string' },
    { filenameRoot: '180-if-else-braces' },
    { filenameRoot: '185-block-comment' },
    { filenameRoot: '188-one-command-code-in-text' },
    { filenameRoot: '189-space-at-end-of-line' },
    { filenameRoot: 'ahk-explorer' },
    { filenameRoot: 'demo' },
    {
        filenameRoot: 'insert-spaces-false',
        options: { insertSpaces: false },
    },
    { filenameRoot: 'label-fall-through' },
    { filenameRoot: 'label-specific-name' },
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
            // Arrange
            const inFilename = formatTest.filenameRoot + inFilenameSuffix;
            const outFilename = formatTest.filenameRoot + outFilenameSuffix;
            const outFileString = fs
                .readFileSync(path.join(filesParentPath, outFilename))
                .toString();
            const unformattedSampleFile =
                await vscode.workspace.openTextDocument(
                    path.join(filesParentPath, inFilename),
                );
            const originalText = unformattedSampleFile.getText();
            const textEditor = await vscode.window.showTextDocument(
                unformattedSampleFile,
            );
            const formatter = new FormatProvider();

            // Act
            const edits = formatter.provideDocumentFormattingEdits(
                unformattedSampleFile,
                {
                    ...defaultOptions,
                    ...formatTest.options,
                },
                null,
            );
            // editing the file also saves the file, so we'll need to teardown
            await textEditor.edit((editBuilder) => {
                edits.forEach((edit) =>
                    editBuilder.replace(edit.range, edit.newText),
                );
            });

            // Assert
            assert.strictEqual(textEditor.document.getText(), outFileString);

            // Teardown - revert the file to its original state
            const lastLineIndex = unformattedSampleFile.lineCount - 1;
            const lastLineLength =
                unformattedSampleFile.lineAt(lastLineIndex).text.length;
            const fullDocumentRange = unformattedSampleFile.validateRange(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(lastLineIndex + 1, lastLineLength + 1), // + 1 to ensure full coverage
                ),
            );

            // editing the file also saves the file
            await textEditor.edit((editBuilder) =>
                editBuilder.replace(fullDocumentRange, originalText),
            );
        });
    });
});
