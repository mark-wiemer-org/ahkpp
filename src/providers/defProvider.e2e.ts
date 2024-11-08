import assert from 'assert';
import { tryGetFileLink } from './defProvider';

suite.only(tryGetFileLink.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof tryGetFileLink>,
        expected: ReturnType<typeof tryGetFileLink>,
    ][] = [['non-match', ['/c:/path/to/file.ahk', 'foo'], undefined]];
    tests.forEach(([name, args, expected]) =>
        test(name, async () => {
            assert.strictEqual(await tryGetFileLink(...args), expected);
        }),
    );
});
