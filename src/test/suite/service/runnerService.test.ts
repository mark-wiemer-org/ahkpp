import * as assert from 'assert';
import { makeCompileCommand } from '../../../service/runnerService';

suite.only('runnerService', () => {
    suite('makeCompileCommand', () => {
        let tests = [
            {
                name: 'Happy path',
                compilePath: 'mockCompilePath',
                currentPath: 'mockCurrentPath',
                compileDestPath: 'mockCompileDestPath',
                compileIcon: 'mockCompileIcon',
                compileBaseFile: 'mockCompileBaseFile',
                useMpress: false,
                expected: `"mockCompilePath" /in "mockCurrentPath" /out "mockCompileDestPath" /icon "mockCompileIcon" /bin "mockCompileBaseFile" `,
            },
            {
                name: 'No compile icon',
                compilePath: 'mockCompilePath',
                currentPath: 'mockCurrentPath',
                compileDestPath: 'mockCompileDestPath',
                compileIcon: '',
                compileBaseFile: 'mockCompileBaseFile',
                useMpress: false,
                expected: `"mockCompilePath" /in "mockCurrentPath" /out "mockCompileDestPath"  /bin "mockCompileBaseFile" `,
            },
            {
                name: 'No base file',
                compilePath: 'mockCompilePath',
                currentPath: 'mockCurrentPath',
                compileDestPath: 'mockCompileDestPath',
                compileIcon: 'mockCompileIcon',
                compileBaseFile: '',
                useMpress: false,
                expected: `"mockCompilePath" /in "mockCurrentPath" /out "mockCompileDestPath" /icon "mockCompileIcon"  `,
            },
            {
                name: 'Use MPRESS',
                compilePath: 'mockCompilePath',
                currentPath: 'mockCurrentPath',
                compileDestPath: 'mockCompileDestPath',
                compileIcon: 'mockCompileIcon',
                compileBaseFile: 'mockCompileBaseFile',
                useMpress: true,
                expected: `"mockCompilePath" /in "mockCurrentPath" /out "mockCompileDestPath" /icon "mockCompileIcon" /bin "mockCompileBaseFile" /mpress 1`,
            },
            {
                name: 'No optional values',
                compilePath: 'mockCompilePath',
                currentPath: 'mockCurrentPath',
                compileDestPath: 'mockCompileDestPath',
                compileIcon: '',
                compileBaseFile: '',
                useMpress: false,
                expected: `"mockCompilePath" /in "mockCurrentPath" /out "mockCompileDestPath"   `,
            },
        ];
        tests.forEach((myTest) => {
            test(myTest.name, () => {
                assert.strictEqual(
                    makeCompileCommand(
                        myTest.compilePath,
                        myTest.currentPath,
                        myTest.compileDestPath,
                        myTest.compileIcon,
                        myTest.compileBaseFile,
                        myTest.useMpress,
                    ),
                    myTest.expected,
                );
            });
        });
    });
});
