import * as assert from 'assert';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
} from '../../../../providers/formattingProvider.utils';

suite('FormattingProvider utils', () => {
    suite('hasMoreCloseParens', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     out: , // expected result
            // },
            {
                in: ')',
                out: true,
            },
            {
                in: '()',
                out: false,
            },
            {
                in: '())',
                out: true,
            },
            {
                in: '(::',
                out: false,
            },
            {
                in: '',
                out: false,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "'" + ' => ' + data.out.toString(), () => {
                assert.strictEqual(hasMoreCloseParens(data.in), data.out);
            });
        });
    });

    suite('hasMoreOpenParens', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     out: , // expected result
            // },
            {
                in: '(',
                out: true,
            },
            {
                in: '()',
                out: false,
            },
            {
                in: '(()',
                out: true,
            },
            {
                in: '(::',
                out: true,
            },
            {
                in: '',
                out: false,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "'" + ' => ' + data.out.toString(), () => {
                assert.strictEqual(hasMoreOpenParens(data.in), data.out);
            });
        });
    });
});
