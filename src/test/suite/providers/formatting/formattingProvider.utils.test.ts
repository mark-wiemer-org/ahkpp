import * as assert from 'assert';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
    trimExtraSpaces,
} from '../../../../providers/formattingProvider.utils';

suite('FormattingProvider utils', () => {
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
});
