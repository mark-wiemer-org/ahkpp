import * as vscode from 'vscode';
import { assert } from 'chai';
import { provideCompletionItemsInner } from '../../../../providers/completionProvider';

// tests for completionItemsForMethod
suite('completionProvider', () => {
    // TODO outer
    // parsing vs no parsing
    // intellisense enabled vs disabled

    suite.only('provideCompletionItemsInner', () => {
        const tests: [
            name: string,
            args: Parameters<typeof provideCompletionItemsInner>,
            expected: ReturnType<typeof provideCompletionItemsInner>,
        ][] = [
            ['no methods or variables', [[], 'mockUri', 1, []], []],
            // just method
            [
                'diff file, outside method, no locals',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 0,
                            full: 'mockName()',
                            line: 0,
                            name: 'mockName',
                            params: [],
                            uriString: 'mockUri1',
                            variables: [],
                        },
                    ],
                    'mockUri2',
                    1,
                    [],
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
            [
                'diff file, outside method, only params',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 0,
                            full: 'mockName(mockParam1, mockParam2)',
                            line: 0,
                            name: 'mockName',
                            params: ['mockParam1', 'mockParam2'],
                            uriString: 'mockUri1',
                            variables: [],
                        },
                    ],
                    'mockUri2',
                    1,
                    [],
                ],
                [
                    {
                        detail: 'mockComment',
                        insertText: new vscode.SnippetString('mockName($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName(mockParam1, mockParam2)',
                    },
                ],
            ],
            [
                'diff file, inside method, ignore local variables',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 2,
                            full: 'mockName(mockParam1, mockParam2)',
                            line: 0,
                            name: 'mockName',
                            params: ['mockParam1', 'mockParam2'],
                            uriString: 'mockUri1',
                            variables: ['mockVariable1'],
                        },
                    ],
                    'mockUri2',
                    1,
                    [],
                ],
                [
                    {
                        detail: 'mockComment',
                        insertText: new vscode.SnippetString('mockName($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName(mockParam1, mockParam2)',
                    },
                ],
            ],
            [
                'same file, outside method, no locals',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 0,
                            full: 'mockName()',
                            line: 0,
                            name: 'mockName',
                            params: [],
                            uriString: 'mockUri1',
                            variables: [],
                        },
                    ],
                    'mockUri1',
                    1,
                    [],
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
            [
                'same file, outside method, ignore local variables',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 0,
                            full: 'mockName(mockParam1, mockParam2)',
                            line: 0,
                            name: 'mockName',
                            params: ['mockParam1', 'mockParam2'],
                            uriString: 'mockUri1',
                            variables: ['mockVariable1'],
                        },
                    ],
                    'mockUri1',
                    1,
                    [],
                ],
                [
                    {
                        detail: 'mockComment',
                        insertText: new vscode.SnippetString('mockName($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName(mockParam1, mockParam2)',
                    },
                ],
            ],
            [
                'same file, inside method, include locals (params first)',
                [
                    [
                        {
                            comment: 'mockComment',
                            endLine: 2,
                            full: 'mockName(mockParam1, mockParam2)',
                            line: 0,
                            name: 'mockName',
                            params: ['mockParam1', 'mockParam2'],
                            uriString: 'mockUri1',
                            variables: ['mockVariable1'],
                        },
                    ],
                    'mockUri1',
                    1,
                    [],
                ],
                [
                    {
                        detail: 'mockComment',
                        insertText: new vscode.SnippetString('mockName($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName(mockParam1, mockParam2)',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockParam1',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockParam2',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockVariable1',
                    },
                ],
            ],
            [
                'same file, inside one of two methods, include locals of only the current method',
                [
                    [
                        {
                            comment: 'mockComment1',
                            endLine: 2,
                            full: 'mockName1(mockParam1_1, mockParam1_2)',
                            line: 0,
                            name: 'mockName1',
                            params: ['mockParam1_1', 'mockParam1_2'],
                            uriString: 'mockUri',
                            variables: ['mockVariable1_1'],
                        },
                        {
                            comment: 'mockComment2',
                            endLine: 4,
                            full: 'mockName2(mockParam2_1, mockParam2_2)',
                            line: 3,
                            name: 'mockName2',
                            params: ['mockParam2_1', 'mockParam2_2'],
                            uriString: 'mockUri',
                            variables: ['mockVariable2_1'],
                        },
                    ],
                    'mockUri',
                    1,
                    [],
                ],
                [
                    {
                        detail: 'mockComment1',
                        insertText: new vscode.SnippetString('mockName1($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName1(mockParam1_1, mockParam1_2)',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockParam1_1',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockParam1_2',
                    },
                    {
                        kind: vscode.CompletionItemKind.Variable,
                        label: 'mockVariable1_1',
                    },
                    {
                        detail: 'mockComment2',
                        insertText: new vscode.SnippetString('mockName2($1)'),
                        kind: vscode.CompletionItemKind.Method,
                        label: 'mockName2(mockParam2_1, mockParam2_2)',
                    },
                ],
            ],
        ];
        tests.forEach(([name, args, expected]) =>
            test(name, () =>
                assert.deepEqual(
                    provideCompletionItemsInner(...args),
                    expected,
                ),
            ),
        );
    });
});
