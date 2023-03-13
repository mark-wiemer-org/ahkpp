import * as assert from 'assert';
import { getCommand } from '../../../service/helpService';

suite('helpService', () => {
    suite('getCommand', () => {
        const tests: [
            name: string,
            args: Parameters<typeof getCommand>,
            expected: ReturnType<typeof getCommand>,
        ][] = [
            [
                'no URL happy path',
                ['mockHelpPath', 'mockText'],
                `C:/Windows/hh.exe mockHelpPath`,
            ],
            [
                'yes URL happy path',
                ['mockHelpPath', 'tutorial'],
                `C:/Windows/hh.exe mockHelpPath::/docs/Tutorial.htm`,
            ],
            ['help path empty string', ['', 'tutorial'], undefined],
            ['help path undefined', [undefined, 'tutorial'], undefined],
            [
                'text empty string',
                ['mockHelpPath', ''],
                `C:/Windows/hh.exe mockHelpPath`,
            ],
            [
                'text undefined',
                ['mockHelpPath', undefined],
                `C:/Windows/hh.exe mockHelpPath`,
            ],
        ];
        tests.forEach(([name, args, expected]) =>
            test(name, () => assert.strictEqual(getCommand(...args), expected)),
        );
    });
});
