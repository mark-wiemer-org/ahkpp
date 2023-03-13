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
        const tests: {
            name: string;
            regex: RegExp;
            text: string;
            expected: ReturnType<typeof CodeUtil.matchAll>;
        }[] = [
            {
                name: 'no match',
                regex: /hi/g,
                text: 'bye',
                expected: [],
            },
        ];

        tests.forEach(({ name, regex, text, expected }) =>
            test(name, () =>
                assert.strictEqual(
                    CodeUtil.matchAll(regex, text).length,
                    expected.length,
                ),
            ),
        );
    });
});
