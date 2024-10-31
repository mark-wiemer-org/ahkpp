import { suite, test } from 'mocha';
import assert from 'assert';
import { getIncludedPath, resolvePath } from './defProvider.utils';

suite(getIncludedPath.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof getIncludedPath>,
        expected: ReturnType<typeof getIncludedPath>,
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
        test(name, () =>
            assert.strictEqual(getIncludedPath(...args), expected),
        ),
    );
});

suite(resolvePath.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof resolvePath>,
        expected: ReturnType<typeof resolvePath>,
    ][] = [
        ['relative file', ['/c:/users/main.ahk', 'a.ahk'], 'c:\\users\\a.ahk'],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () => assert.strictEqual(resolvePath(...args), expected)),
    );
});
