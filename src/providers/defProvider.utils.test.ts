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
        ['preceding whitespace', ['   #include a.ahk'], 'a.ahk'],
        ['directory', ['#include a'], 'a'],
        ['non-whitespace preceding char', [';#include a'], undefined],
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
        ['relative file', ['/c:/main.ahk', 'a.ahk'], 'c:\\a.ahk'],
        ['absolute file', ['/c:/users/main.ahk', 'd:/b.ahk'], 'd:\\b.ahk'],
        ['with single dot', ['/c:/main.ahk', './c.ahk'], 'c:\\c.ahk'],
        ['with double dot', ['/c:/users/main.ahk', '../d.ahk'], 'c:\\d.ahk'],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () => assert.strictEqual(resolvePath(...args), expected)),
    );
});
