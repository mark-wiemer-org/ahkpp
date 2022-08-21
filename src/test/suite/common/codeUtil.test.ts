import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
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
            test(data.in + ' => ' + data.rs, () => {
                assert.strictEqual(CodeUtil.purify(data.in), data.rs);
            });
        });
    });
});
