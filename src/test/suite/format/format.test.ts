import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    FormatProvider,
    internalFormat,
} from '../../../providers/formattingProvider';
import { FormatOptions } from '../../../providers/formattingProvider.types';

const inFilenameSuffix = '.in.ahk';
const outFilenameSuffix = '.out.ahk';
interface FormatTest {
    /** Name of the file, excluding the suffix (@see inFilenameSuffix, @see outFilenameSuffix) */
    filenameRoot: string;
    // Any properties not provided will use `defaultOptions` below
    options?: Partial<FormatOptions>;
}
/** Default formatting options, meant to match default extension settings */
const defaultOptions = {
    tabSize: 4,
    insertSpaces: true,
    allowedNumberOfEmptyLines: 1,
    indentCodeAfterLabel: true,
    indentCodeAfterSharpDirective: true,
    preserveIndent: false,
    trimExtraSpaces: true,
};
const formatTests: FormatTest[] = [
    { filenameRoot: '25-multiline-string' },
    { filenameRoot: '28-switch-case' },
    { filenameRoot: '40-command-inside-text' },
    { filenameRoot: '55-sharp-directive' },
    { filenameRoot: '56-return-command-after-label' },
    { filenameRoot: '58-parentheses-indentation' },
    { filenameRoot: '59-one-command-indentation' },
    { filenameRoot: '72-paren-hotkey' },
    { filenameRoot: '119-semicolon-inside-string' },
    { filenameRoot: '161-colon-on-last-position' },
    { filenameRoot: '180-if-else-braces' },
    {
        filenameRoot: '182-multiple-newlines',
        options: { allowedNumberOfEmptyLines: 2 },
    },
    { filenameRoot: '184-continuation-section-expression' },
    { filenameRoot: '184-continuation-section-object' },
    { filenameRoot: '184-continuation-section-text' },
    { filenameRoot: '185-block-comment' },
    {
        filenameRoot: '187-comments-at-end-of-line',
        options: { trimExtraSpaces: false },
    },
    { filenameRoot: '188-one-command-code-in-text' },
    { filenameRoot: '189-space-at-end-of-line' },
    {
        filenameRoot: '192-preserve-indent-true',
        options: { preserveIndent: true },
    },
    { filenameRoot: '255-close-brace' },
    { filenameRoot: '255-else-if' },
    { filenameRoot: '255-if-loop-mix' },
    { filenameRoot: '255-return-function' },
    { filenameRoot: '255-return-label' },
    { filenameRoot: '255-style-allman' },
    { filenameRoot: '255-style-k-and-r' },
    { filenameRoot: '255-style-mix' },
    { filenameRoot: '255-style-one-true-brace' },
    { filenameRoot: 'ahk-explorer' },
    { filenameRoot: 'align-assignment' },
    { filenameRoot: 'demo' },
    {
        filenameRoot: 'indent-code-after-label-false',
        options: { indentCodeAfterLabel: false },
    },
    {
        filenameRoot: 'indent-code-after-label-true',
        options: { indentCodeAfterLabel: true },
    },
    {
        filenameRoot: 'indent-code-after-sharp-directive-false',
        options: { indentCodeAfterSharpDirective: false },
    },
    {
        filenameRoot: 'indent-code-after-sharp-directive-true',
        options: { indentCodeAfterSharpDirective: true },
    },
    {
        filenameRoot: 'insert-spaces-false',
        options: { insertSpaces: false },
    },
    { filenameRoot: 'legacy-text-sharp-directive' },
    { filenameRoot: 'label-fall-through' },
    { filenameRoot: 'label-specific-name' },
    { filenameRoot: 'return-exit-exitapp' },
    { filenameRoot: 'single-line-comment' },
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
    // test external formatter a few times to make sure the connection is working
    // advanced tests are for internal formatter only
    const externalFormatTests: FormatTest[] = [
        { filenameRoot: '25-multiline-string' },
        {
            filenameRoot: 'insert-spaces-false',
            options: { insertSpaces: false },
        },
        {
            filenameRoot: 'tab-size-2',
            options: { tabSize: 2 },
        },
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
