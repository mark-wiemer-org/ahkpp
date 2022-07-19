import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
    suite('purify', () => {
        // List of test data
        let dataList = [
            // ['input test string', 'expected result']
            ['foo("; not comment")', 'foo("")'],
            ['MsgBox, { ; comment with close brace }', 'MsgBox'],
            ['MsgBox % "; not comment"', 'MsgBox'],
            ['str = "`; not comment"', 'str = ""'],
            ['str = "; comment with double quote"', 'str = ""'],
            ['str = "; comment', 'str = "'],
            ['Gui, %id%: Color, % color', 'Gui'],
            ['Send(Gui)', 'Send(Gui)'],
            ['Send(foo)', 'Send(foo)'],
            ['foo(Gui)', 'foo(Gui)'],
        ];
        dataList.forEach((data) => {
            test(data[0] + ' => ' + data[1], () => {
                assert.strictEqual(CodeUtil.purify(data[0]), data[1]);
            });
        });
    });
});
