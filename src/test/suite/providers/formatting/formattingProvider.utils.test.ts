import * as vscode from 'vscode';
import * as assert from 'assert';
import path = require('path');
import {
    braceNumber,
    buildIndentationChars,
    buildIndentedLine,
    documentToString,
    hasMoreCloseParens,
    hasMoreOpenParens,
    purify,
    removeEmptyLines,
    trimExtraSpaces,
} from '../../../../providers/formattingProvider.utils';

suite('FormattingProvider utils', () => {
    suite('braceNum', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     bc: , // brace character
            //     bn: , // brace number
            // },
            {
                in: '{}',
                bc: '{',
                bn: 0,
            },
            {
                in: '{',
                bc: '{',
                bn: 1,
            },
            {
                in: '{}{',
                bc: '{',
                bn: 1,
            },
            {
                in: '}',
                bc: '}',
                bn: 1,
            },
            {
                in: '{}}',
                bc: '}',
                bn: 1,
            },
        ];
        dataList.forEach((data) => {
            test(
                data.bc + ": '" + data.in + "'" + ' => ' + data.bn.toString(),
                () => {
                    assert.strictEqual(braceNumber(data.in, data.bc), data.bn);
                },
            );
        });
    });

    suite('buildIndentationChars', () => {
        // List of test data
        let dataList = [
            // {
            //     dp: , // depth of indentation
            //     op: , // formatting options
            //     rs: , // expected result
            // },
            {
                dp: 0,
                op: { insertSpaces: true, tabSize: 4 },
                rs: '',
            },
            {
                dp: 1,
                op: { insertSpaces: true, tabSize: 4 },
                rs: '    ',
            },
            {
                dp: 2,
                op: { insertSpaces: true, tabSize: 4 },
                rs: '        ',
            },
            {
                dp: 1,
                op: { insertSpaces: false, tabSize: 4 },
                rs: '\t',
            },
            {
                dp: 2,
                op: { insertSpaces: false, tabSize: 4 },
                rs: '\t\t',
            },
        ];
        dataList.forEach((data) => {
            test(
                'depth:' +
                    data.dp +
                    ' spaces:' +
                    data.op.insertSpaces.toString() +
                    " => '" +
                    data.rs.replace(/\t/g, '\\t') +
                    "'",
                () => {
                    assert.strictEqual(
                        buildIndentationChars(data.dp, data.op),
                        data.rs,
                    );
                },
            );
        });
    });

    suite('buildIndentedLine', () => {
        // List of test data
        let dataList = [
            // {
            //     dp: , // depth of indentation
            //     fl: , // formatted line
            //     op: , // formatting options
            //     rs: , // expected result
            // },
            {
                dp: 0,
                fl: 'SoundBeep',
                op: { insertSpaces: true, tabSize: 4, preserveIndent: false },
                rs: 'SoundBeep',
            },
            {
                dp: 1,
                fl: 'SoundBeep',
                op: { insertSpaces: true, tabSize: 4, preserveIndent: false },
                rs: '    SoundBeep',
            },
            {
                dp: 2,
                fl: 'SoundBeep',
                op: { insertSpaces: true, tabSize: 4, preserveIndent: false },
                rs: '        SoundBeep',
            },
            {
                dp: 1,
                fl: 'SoundBeep',
                op: { insertSpaces: false, tabSize: 4, preserveIndent: false },
                rs: '\tSoundBeep',
            },
            {
                dp: 2,
                fl: 'SoundBeep',
                op: { insertSpaces: false, tabSize: 4, preserveIndent: false },
                rs: '\t\tSoundBeep',
            },
            {
                dp: 1,
                fl: '',
                op: { insertSpaces: true, tabSize: 4, preserveIndent: true },
                rs: '    ',
            },
            {
                dp: 2,
                fl: '',
                op: { insertSpaces: false, tabSize: 4, preserveIndent: true },
                rs: '\t\t',
            },
        ];
        dataList.forEach((data) => {
            test(
                'depth:' +
                    data.dp +
                    ' spaces:' +
                    data.op.insertSpaces.toString() +
                    ' preserveIndent:' +
                    data.op.preserveIndent.toString() +
                    " '" +
                    data.fl +
                    "' => '" +
                    data.rs.replace(/\t/g, '\\t') +
                    "'",
                () => {
                    assert.strictEqual(
                        buildIndentedLine(0, 1, data.fl, data.dp, data.op),
                        data.rs,
                    );
                },
            );
        });
    });

    suite('hasMoreCloseParens', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: ')',
                rs: true,
            },
            {
                in: '()',
                rs: false,
            },
            {
                in: '())',
                rs: true,
            },
            {
                in: '(::',
                rs: false,
            },
            {
                in: '',
                rs: false,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
                assert.strictEqual(hasMoreCloseParens(data.in), data.rs);
            });
        });
    });

    suite('hasMoreOpenParens', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: '(',
                rs: true,
            },
            {
                in: '()',
                rs: false,
            },
            {
                in: '(()',
                rs: true,
            },
            {
                in: '(::',
                rs: true,
            },
            {
                in: '',
                rs: false,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
                assert.strictEqual(hasMoreOpenParens(data.in), data.rs);
            });
        });
    });

    suite('purify', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: 'foo("; not comment")',
                rs: 'foo("")',
            },
            {
                in: 'MsgBox, { ; comment with close brace }',
                rs: 'MsgBox',
            },
            {
                in: 'MsgBox % "; not comment"',
                rs: 'MsgBox',
            },
            {
                in: 'str = "`; not comment"',
                rs: 'str = ""',
            },
            {
                in: 'str = "; comment with double quote"',
                rs: 'str = ""',
            },
            {
                in: 'str = "; comment',
                rs: 'str = "',
            },
            {
                in: 'Gui, %id%: Color, % color',
                rs: 'Gui',
            },
            {
                in: 'Send(Gui)',
                rs: 'Send(Gui)',
            },
            {
                in: 'Send(foo)',
                rs: 'Send(foo)',
            },
            {
                in: 'foo(Gui)',
                rs: 'foo(Gui)',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(purify(data.in), data.rs);
            });
        });
    });

    suite('removeEmptyLines', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     ln: , // allowed empty lines
            //     rs: , // expected result
            // },
            {
                in: 'text\n\n\n\n\ntext\n\n\n\n\n',
                ln: -1,
                rs: 'text\n\n\n\n\ntext\n\n\n\n\n',
            },
            {
                in: 'text\n\n\n\n\ntext\n\n\n\n\n',
                ln: 0,
                rs: 'text\ntext\n',
            },
            {
                in: 'text\n\n\n\n\ntext\n\n\n\n\n',
                ln: 1,
                rs: 'text\n\ntext\n\n',
            },
            {
                in: 'text\n\n\n\n\ntext\n\n\n\n\n',
                ln: 2,
                rs: 'text\n\n\ntext\n\n\n',
            },
            {
                in: 'text\n\n\n\n\ntext\n\n\n\n\n',
                ln: 3,
                rs: 'text\n\n\n\ntext\n\n\n\n',
            },
            {
                in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
                ln: 0,
                rs: 'text\ntext\n',
            },
            {
                in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
                ln: 1,
                rs: 'text\n    \ntext\n    \n',
            },
            {
                in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
                ln: 2,
                rs: 'text\n    \n    \ntext\n    \n    \n',
            },
            {
                in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
                ln: 3,
                rs: 'text\n    \n    \n    \ntext\n    \n    \n    \n',
            },
            {
                in: '\n\n\ntext',
                ln: 1,
                rs: 'text',
            },
            {
                in: '    \n',
                ln: 1,
                rs: '',
            },
            {
                in: '\t\n',
                ln: 1,
                rs: '',
            },
            {
                in: 'text\ntext',
                ln: 1,
                rs: 'text\ntext',
            },
            {
                in: 'text\n',
                ln: 1,
                rs: 'text\n',
            },
            {
                // First empty line is \n -> use \n everywhere
                in: 'a\r\n\n\r\n\n\nb',
                ln: 2,
                rs: 'a\r\n\n\nb',
            },
            {
                // First empty line is \r\n -> use \r\n everywhere
                in: 'a\n\r\n\n\r\nb',
                ln: 2,
                rs: 'a\n\r\n\r\nb',
            },
            {
                // First empty line is \r\n -> use \r\n everywhere
                // Even though we have not exceeded count of empty lines
                in: 'a\n\r\n\n\r\nb',
                ln: 3,
                rs: 'a\n\r\n\r\n\r\nb',
            },
            {
                // 4 lines allowed, 3 found
                // Make no change since we have not met or exceeded allowed count
                in: 'a\n\r\n\n\r\nb',
                ln: 4,
                rs: 'a\n\r\n\n\r\nb',
            },
        ];
        dataList.forEach((data) => {
            test(
                'ln:' +
                    data.ln +
                    " '" +
                    data.in.replace(/\r/g, '\\r').replace(/\n/g, '\\n') +
                    "' => '" +
                    data.rs.replace(/\r/g, '\\r').replace(/\n/g, '\\n') +
                    "'",
                () => {
                    assert.strictEqual(
                        removeEmptyLines(data.in, data.ln),
                        data.rs,
                    );
                },
            );
        });
    });

    suite('trimExtraSpaces', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            //     ts: , // trim extra spaces
            // },
            {
                in: 'InputFile    :=    "movie.mkv"',
                rs: 'InputFile := "movie.mkv"',
                ts: true,
            },
            {
                in: 'InputFile    :=    "movie.mkv"',
                rs: 'InputFile    :=    "movie.mkv"',
                ts: false,
            },
            {
                in: 'MsgBox,  4,   , testing   testing',
                rs: 'MsgBox, 4, , testing testing',
                ts: true,
            },
        ];
        dataList.forEach((data) => {
            test(
                'Trim(' +
                    data.ts.toString() +
                    "): '" +
                    data.in +
                    "' => '" +
                    data.rs +
                    "'",
                () => {
                    assert.strictEqual(
                        trimExtraSpaces(data.in, data.ts),
                        data.rs,
                    );
                },
            );
        });
    });

    // Internal tests mock VS Code behavior to isolate flaws and run faster
    suite('internal documentToString', () => {
        const myTests = [
            {
                name: '0 lines (empty string)',
                in: {
                    lineCount: 0,
                    lineAt(i: number): { text: string } {
                        throw new Error('Argument out of bounds');
                    },
                },
                out: '',
            },
            {
                name: '1 non-empty line',
                in: {
                    lineCount: 1,
                    lineAt(i: number): { text: string } {
                        return { text: 'hi' };
                    },
                },
                out: 'hi',
            },
            {
                name: '2 non-empty lines',
                in: {
                    lineCount: 2,
                    lineAt(i: number): { text: string } {
                        const result = !i ? 'hello' : 'world';
                        return { text: result };
                    },
                },
                out: 'hello\nworld',
            },
            {
                name: '3 non-empty lines',
                in: {
                    lineCount: 3,
                    lineAt(i: 0 | 1 | 2): { text: string } {
                        const map: Record<0 | 1 | 2, string> = {
                            [0]: 'how',
                            [1]: 'are',
                            [2]: 'you',
                        };
                        const result = map[i];
                        return { text: result };
                    },
                },
                out: 'how\nare\nyou',
            },
            {
                name: '1 empty line, nothing else',
                in: {
                    lineCount: 1,
                    lineAt(i: 0): { text: string } {
                        return { text: '' };
                    },
                },
                out: '',
            },
            {
                name: '2 empty lines, nothing else',
                in: {
                    lineCount: 2,
                    lineAt(i: number): { text: string } {
                        return { text: '' };
                    },
                },
                out: '\n',
            },
        ];

        myTests.forEach((myTest) =>
            test(myTest.name, () => {
                assert.strictEqual(documentToString(myTest.in), myTest.out);
            }),
        );
    });

    // External tests use real VS Code behavior to ensure extension works end-to-end
    const externalDocumentToString = 'external documentToString';
    suite(externalDocumentToString, () => {
        // Currently in `out` folder, need to get back to main `src` folder
        const filesParentPath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            '..',
            'src',
            'test',
            'suite',
            'providers',
            'formatting',
            'samples',
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

        myTests.forEach((myTest, i) =>
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
