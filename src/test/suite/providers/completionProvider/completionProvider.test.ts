import * as vscode from 'vscode';
import { assert } from 'chai';
import { completionItemsForMethod } from '../../../../providers/completionProvider';

// tests for completionItemsForMethod
suite('completionProvider', () => {
    suite.only('completionItemsForMethod', () => {
        const tests: [
            name: string,
            args: Parameters<typeof completionItemsForMethod>,
            expected: ReturnType<typeof completionItemsForMethod>,
        ][] = [
            [
                'minimal: different file, outside of methood',
                [
                    {
                        comment: 'mockComment',
                        endLine: 0,
                        full: '',
                        line: 0,
                        name: 'mockName',
                        params: [],
                        uriString: 'mockUri1',
                        variables: [{ name: '' }],
                    },
                    'mockUri2',
                    1,
                ],
                [
                    {
                        detail: 'mockComment',
                        insertText: 'mockName()',
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName',
                    },
                ],
            ],
        ];
        tests.forEach(([name, args, expected]) =>
            test(name, () =>
                assert.deepEqual(completionItemsForMethod(...args), expected),
            ),
        );
    });
});
