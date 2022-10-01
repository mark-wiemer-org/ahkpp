import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    FormatProvider,
    internalFormat,
} from '../../../providers/formattingProvider';

const inFilenameSuffix = '.in.ahk';
const outFilenameSuffix = '.out.ahk';
interface FormatTest {
    /** Name of the file, excluding the suffix (@see inFilenameSuffix, @see outFilenameSuffix) */
    filenameRoot: string;
    /** If not provided, file will be formatted with 4 spaces. */
    options?: Partial<vscode.FormattingOptions>;
}
/** Default formatting options */
const defaultOptions = {
    tabSize: 4,
    insertSpaces: true,
    allowedNumberOfEmptyLines: 1,
    preserveIndent: false,
    trimExtraSpaces: true,
};
const formatTests: FormatTest[] = [
    { filenameRoot: '25-multiline-string' },
    { filenameRoot: '40-command-inside-text' },
    { filenameRoot: '56-return-command-after-label' },
    { filenameRoot: '58-parentheses-indentation' },
    { filenameRoot: '59-one-command-indentation' },
    { filenameRoot: '72-paren-hotkey' },
    { filenameRoot: '119-semicolon-inside-string' },
    { filenameRoot: '161-colon-on-last-position' },
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
    {
        filenameRoot: 'tab-size-2',
        options: { tabSize: 2 },
    },
];

// Currently in `out` folder, need to get back to main `src` folder
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

const fileToString = (path: string): string => fs.readFileSync(path).toString();

suite('Internal formatter', () => {
    formatTests.forEach((formatTest) => {
        test(`${formatTest.filenameRoot} internal format`, async () => {
            // Arrange
            const inFilePath = path.join(
                filesParentPath,
                `${formatTest.filenameRoot}${inFilenameSuffix}`,
            );
            const inFileString = fileToString(inFilePath);
            const outFilePath = path.join(
                filesParentPath,
                `${formatTest.filenameRoot}${outFilenameSuffix}`,
            );
            const outFileString = fileToString(outFilePath);
            const options = { ...defaultOptions, ...formatTest.options };

            // Act
            const actual = internalFormat(inFileString, options);

            // Assert
            assert.strictEqual(actual, outFileString);
        });
    });
});

suite('External formatter', () => {
    // we only have to test one external formatter to make sure the connection is working
    // in the future we should add tests for various config values
    const externalFormatTests: FormatTest[] = [
        { filenameRoot: '25-multiline-string' },
    ];

    externalFormatTests.forEach((formatTest) => {
        test(`${formatTest.filenameRoot} external format`, async () => {
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
