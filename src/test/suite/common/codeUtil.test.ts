import * as assert from 'assert';
import { CodeUtil, getSelectedText } from '../../../common/codeUtil';
import * as vscode from 'vscode';

suite('Code utils', () => {
    suite('purify', () => {
        // List of test data
        const dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: 'a := 5 ; comment',
                rs: 'a := 5 ',
            },
            {
                in: 'str := "string"',
                rs: 'str := ""',
            },
            {
                in: 'b := {str: "object"}',
                rs: 'b := ',
            },
            {
                in: 'str = legacy    text',
                rs: 'str = legacy text',
            },
            {
                in: 'Gui, %id%: Color, % color',
                rs: '',
            },
            {
                in: 'MsgBox % str . (var + 1)',
                rs: 'MsgBox str . (var + 1)',
            },
            {
                in: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl',
                rs: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(CodeUtil.purify(data.in), data.rs);
            });
        });
    });

    // Test against length for now
    suite('matchAll', () => {
        const tests = [
            {
                name: 'no match',
                regex: /hi/g,
                text: 'bye',
                expected: [],
            },
        ];

        tests.forEach((myTest) => {
            test(myTest.name, () => {
                assert.strictEqual(
                    CodeUtil.matchAll(myTest.regex, myTest.text).length,
                    myTest.expected.length,
                );
            });
        });
    });

    suite('getSelectedText', () => {
        const tests: [
            name: string,
            args: Parameters<typeof getSelectedText>,
            expected: ReturnType<typeof getSelectedText>,
        ][] = [
            [
                'has selection',
                [
                    {
                        document: {
                            getText(selection) {
                                return 'hello world';
                            },
                        },
                        selection: new vscode.Selection(1, 2, 3, 4),
                    },
                ],
                'hello world',
            ],
            [
                'empty selection',
                [
                    {
                        document: {
                            getText(selection) {
                                return '';
                            },
                        },
                        selection: new vscode.Selection(1, 2, 3, 4),
                    },
                ],
                '',
            ],
            ['no editor', [undefined], undefined],
        ];
        tests.forEach(([name, args, expected]) =>
            test(name, () =>
                assert.strictEqual(getSelectedText(...args), expected),
            ),
        );
    });
});
