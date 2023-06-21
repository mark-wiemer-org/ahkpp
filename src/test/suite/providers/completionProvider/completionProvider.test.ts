import * as vscode from 'vscode';
import * as assert from 'assert';
import { completionItemsForMethod } from '../../../../providers/completionProvider';

// tests for completionItemsForMethod
suite('completionProvider', () => {
    suite('completionItemsForMethod', () => {
        const tests: [
            name: string,
            args: Parameters<typeof completionItemsForMethod>,
            expected: ReturnType<typeof completionItemsForMethod>,
        ][] = [
            [
                'empty',
                [
                    {
                        comment: '',
                        endLine: 0,
                        full: '',
                        line: 0,
                        name: '',
                        params: [],
                        uriString: '',
                        variables: [{ name: '' }],
                    },
                    '',
                    0,
                ],
                [],
            ],
        ];
        tests.forEach(([name, args, expected]) =>
            test(name, () =>
                assert.strictEqual(completionItemsForMethod(...args), expected),
            ),
        );
    });
});
