import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
    suite('purify', () => {
        test('foo("; not comment") => foo("")', () => {
            assert.strictEqual(
                CodeUtil.purify('foo("; not comment")'),
                'foo("")',
            );
        });

        test('MsgBox, { ; comment with close brace } => MsgBox', () => {
            assert.strictEqual(
                CodeUtil.purify('MsgBox, { ; comment with close brace }'),
                'MsgBox',
            );
        });

        test('MsgBox % "; not comment" => MsgBox', () => {
            assert.strictEqual(
                CodeUtil.purify('MsgBox % "; not comment"'),
                'MsgBox',
            );
        });

        test('str = "`; not comment" => str = ""', () => {
            assert.strictEqual(
                CodeUtil.purify('str = "`; not comment"'),
                'str = ""',
            );
        });

        test('str = "; comment with double quote" => str = ""', () => {
            assert.strictEqual(
                CodeUtil.purify('str = "; comment with double quote"'),
                'str = ""',
            );
        });

        test('str = "; comment => str = "', () => {
            assert.strictEqual(CodeUtil.purify('str = "; comment'), 'str = "');
        });

        test('Gui, %id%: Color, % color => Gui', () => {
            assert.strictEqual(
                CodeUtil.purify('Gui, %id%: Color, % color'),
                'Gui',
            );
        });

        test('Send(Gui) => Send(Gui)', () => {
            assert.strictEqual(CodeUtil.purify('Send(Gui)'), 'Send(Gui)');
        });

        test('Send(foo) => Send(foo)', () => {
            assert.strictEqual(CodeUtil.purify('Send(foo)'), 'Send(foo)');
        });

        test('foo(Gui) => foo(Gui)', () => {
            assert.strictEqual(CodeUtil.purify('foo(Gui)'), 'foo(Gui)');
        });

        // test(' => ', () => {
        //     assert.strictEqual(CodeUtil.purify(''), '');
        // });
    });
});
