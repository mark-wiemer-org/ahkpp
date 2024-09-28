import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import { documentToString } from './formattingProvider.utils';

suite('FormattingProvider utils', () => {
    // External tests use real VS Code behavior to ensure extension works end-to-end
    const externalDocumentToString = 'external documentToString';
    suite(externalDocumentToString, () => {
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

        const myTests = [
            { filename: '1-one-empty-line.txt', expected: '' },
            { filename: '2-two-empty-lines.txt', expected: '\n' },
            { filename: '3-three-empty-lines.txt', expected: '\n\n' },
            {
                filename: '4-multiline-ends-with-newline.txt',
                expected: 'hello\nworld\nhow are you\n',
            },
            {
                filename: '5-multiline-no-newline.txt',
                expected: 'hello\nworld\nhow are you',
            },
            {
                filename: '6-single-line-ends-with-newline.txt',
                expected: 'hello\n',
            },
            { filename: '7-single-line-no-newline.txt', expected: 'hello' },
        ];

        myTests.forEach((myTest) =>
            test(myTest.filename, async () => {
                const vscodeDocument = await vscode.workspace.openTextDocument(
                    path.join(filesParentPath, myTest.filename),
                );

                const actual = documentToString(vscodeDocument);

                assert.strictEqual(actual, myTest.expected);
            }),
        );
    });
});
