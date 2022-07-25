import * as assert from 'assert';
import {
    hasMoreCloseParens,
    hasMoreOpenParens,
    removeEmptyLines,
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

    suite('removeEmptyLines', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     ln: , // allowed empty lines
            //     rs: , // expected result
            // },
            {
                in: '\ntext\n\n\n\ntext\n\n\n\n',
                ln: 1,
                rs: 'text\n\ntext\n\n',
            },
            {
                in: '\ntext\n\n\n\ntext\n\n\n\n',
                ln: 2,
                rs: 'text\n\n\ntext\n\n\n',
            },
            {
                in: 'text\ntext',
                ln: 1,
                rs: 'text\ntext',
            },
            {
                in: 'text\n',
                ln: 1,
                rs: 'text\n',
            },
        ];
        dataList.forEach((data) => {
            test(
                "'" +
                    data.in.replace(/\n/g, '\\n') +
                    "' => '" +
                    data.rs.replace(/\n/g, '\\n') +
                    "'",
                () => {
                    assert.strictEqual(
                        removeEmptyLines(data.in, data.ln),
                        data.rs,
                    );
                },
            );
        });
    });
});
