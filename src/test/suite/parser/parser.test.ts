import * as assert from 'assert';
import * as vscode from 'vscode';
import { Parser } from '../../../parser/Parser';

suite('Parser', () => {
    suite('detectVariableByLine', () => {
        // List of test data
        let dataList = [
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
});
