import { suite, test } from 'mocha';
import assert from 'assert';
import { includedPath } from './defProvider.utils';

suite('includedPath', () => {
    const tests: [
        name: string,
        args: Parameters<typeof includedPath>,
        expected: ReturnType<typeof includedPath>,
    ][] = [
        ['comma', ['#include , a b.ahk'], 'a b.ahk'],
        ['no hash', ['include , a b.ahk'], undefined],
        [
            'no comma nor extra space',
            ['#include path/to/file.ahk'],
            'path/to/file.ahk',
        ],
        ['ah1', ['#include a.ah1'], 'a.ah1'],
        ['ahk1', ['#include a.ahk1'], 'a.ahk1'],
        ['ext', ['#include a.ext'], 'a.ext'],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () => assert.strictEqual(includedPath(...args), expected)),
    );
});
