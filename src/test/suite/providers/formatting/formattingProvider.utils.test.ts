import * as assert from 'assert';
import { hasMoreCloseParens } from '../../../../providers/formattingProvider.utils';

suite('FormattingProvider utils', () => {
    suite('hasMoreCloseParens', () => {
        test("(')') => true", () => {
            assert.strictEqual(hasMoreCloseParens(')'), true);
        });

        test("('()') => false", () => {
            assert.strictEqual(hasMoreCloseParens('()'), false);
        });

        test("('())') => true", () => {
            assert.strictEqual(hasMoreCloseParens('())'), true);
        });

        test("('(::') => false", () => {
            assert.strictEqual(hasMoreCloseParens('(::'), false);
        });

        test("('') => false", () => {
            assert.strictEqual(hasMoreCloseParens(''), false);
        });
    });
});
