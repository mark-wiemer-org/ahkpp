import { getDocument, showDocument } from '../test/utils';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { FormatProvider } from './formattingProvider';
import { FormatOptions } from './formattingProvider.types';

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
    indentCodeAfterIfDirective: true,
    preserveIndent: false,
    trimExtraSpaces: true,
};

// Currently in `out` folder, need to get back to main `src` folder
const filesParentPath = path.join(
    __dirname, // ./out/src/providers
    '..', // ./out/src
    '..', // ./out
    '..', // .
    'src', // ./src
    'providers', // ./src/providers
    'samples', // ./src/providers/samples
);

suite('External formatter', () => {
    // test external formatter a few times to make sure the connection is working
    // advanced tests are for internal formatter only
    //* These tests only support editor settings, not extension settings
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
            const inFilePath = path.join(
                filesParentPath,
                formatTest.filenameRoot + inFilenameSuffix,
            );
            const outFilename = formatTest.filenameRoot + outFilenameSuffix;
            const outFileString = fs
                .readFileSync(path.join(filesParentPath, outFilename))
                .toString();
            const unformattedSampleDoc = await getDocument(inFilePath);
            const originalText = unformattedSampleDoc.getText();
            const textEditor = await showDocument(unformattedSampleDoc);
            const formatter = new FormatProvider();

            // Act
            const edits = formatter.provideDocumentFormattingEdits(
                unformattedSampleDoc,
                {
                    ...defaultOptions,
                    ...formatTest.options,
                },
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
            const lastLineIndex = unformattedSampleDoc.lineCount - 1;
            const lastLineLength =
                unformattedSampleDoc.lineAt(lastLineIndex).text.length;
            const fullDocumentRange = unformattedSampleDoc.validateRange(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(lastLineIndex + 1, lastLineLength + 1), // + 1 to ensure full coverage
                ),
            );

            // editing the file also saves the file
            await textEditor.edit((editBuilder) =>
                editBuilder.replace(fullDocumentRange, originalText),
            );

            // Close opened file
            await vscode.commands.executeCommand(
                'workbench.action.closeActiveEditor',
            );
        });
    });
});
