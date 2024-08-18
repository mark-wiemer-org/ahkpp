import { getDocument } from '../test/utils';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { Parser } from '../parser/parser';

suite('Parser', () => {
    suite('detectVariableByLine', () => {
        // List of test data
        const dataList = [
            // {
            //     in: // input test string
            //     rs: // expected result - number of detected variables inside line with command
            // },
            {
                // Space at end of input test string is important: regex that detects variables
                // inside command is not ideal. Whole symbol detection are not ideal and produce
                // many false-positive detects. It does not have simple fix, needs whole refactor.
                in: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl ',
                rs: 4,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => " + data.rs, async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: data.in,
                });
                // Use array access for the private members
                const variables = Parser['detectVariableByLine'](document, 0);
                // 'variables' can be single object or array of objects
                if (Array.isArray(variables)) {
                    assert.strictEqual(variables.length, data.rs);
                } else {
                    assert.strictEqual(1, data.rs);
                }
            });
        });
    });

    suite('getLabelByLine', () => {
        // List of test data
        const dataList = [
            // {
            //     in: // input test string
            //     rs: // expected result - label name or undefined
            // },
            {
                in: 'ValidLabel:',
                rs: 'ValidLabel',
            },
            {
                in: 'NotValidLabel :',
                rs: undefined,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: data.in,
                });
                // Use array access for the private members
                const label = Parser['getLabelByLine'](document, 0);
                if (label === undefined) {
                    assert.equal(label, data.rs);
                } else {
                    assert.strictEqual(label.name, data.rs);
                }
            });
        });
    });

    suite('getRemarkByLine', () => {
        // List of test data
        const dataList = [
            // {
            //     in: // input test string
            //     rs: // expected result
            // },
            {
                in: ';comment',
                rs: 'comment',
            },
            {
                in: '; comment',
                rs: 'comment',
            },
            {
                in: ' ;comment',
                rs: 'comment',
            },
            {
                in: ' ; comment',
                rs: 'comment',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: data.in,
                });
                // Use array access for the private members
                const comment = Parser['getRemarkByLine'](document, 0);
                assert.strictEqual(comment, data.rs);
            });
        });
    });

    suite('buildScript', () => {
        // Currently in `out` folder, need to get back to main `src` folder
        const filesParentPath = path.join(
            __dirname, // ./out/src/parser
            '..', // ./out/src
            '..', // ./out
            '..', // .
            'src', // ./src
            'parser', // ./src/parser
            'samples', // ./src/parser/samples
        );

        const myTests: {
            name: string;
            maximumParseLength: number;
            expectedMethodCount: number;
        }[] = [
            {
                name: 'stops at provided max parse length',
                maximumParseLength: 10_000,
                expectedMethodCount: 1,
            },
            {
                name: 'respects parse lengths higher than ten thousand',
                maximumParseLength: 11_000,
                expectedMethodCount: 2,
            },
            {
                name: '-1 means unlimited parsing',
                maximumParseLength: -1,
                expectedMethodCount: 2,
            },
            {
                name: '0 means no parsing',
                maximumParseLength: 0,
                expectedMethodCount: 0,
            },
        ];

        myTests.forEach((myTest) =>
            test(myTest.name, async () => {
                const filename = '117-ten-thousand-lines.ahk';
                const document = await getDocument(
                    path.join(filesParentPath, filename),
                );
                const result = await Parser.buildScript(document, {
                    maximumParseLength: myTest.maximumParseLength,
                });
                assert.strictEqual(
                    result.methods.length,
                    myTest.expectedMethodCount,
                );
            }),
        );
    });
});
