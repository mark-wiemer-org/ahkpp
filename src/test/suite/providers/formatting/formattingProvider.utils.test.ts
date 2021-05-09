import * as assert from 'assert';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
} from '../../../../providers/formattingProvider.utils';

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

    suite('hasMoreOpenParens', () => {
        test("('(') => true", () => {
            assert.strictEqual(hasMoreOpenParens('('), true);
        });

        test("('()') => false", () => {
            assert.strictEqual(hasMoreOpenParens('()'), false);
        });

        test("('(()') => true", () => {
            assert.strictEqual(hasMoreOpenParens('(()'), true);
        });

        test("('(::') => true", () => {
            assert.strictEqual(hasMoreOpenParens('(::'), true);
        });

        test("('') => false", () => {
            assert.strictEqual(hasMoreOpenParens(''), false);
        });
    });
});
