import * as assert from 'assert';
import { makeCompileCommand } from '../../../service/runnerService';

suite('runnerService', () => {
    suite('makeCompileCommand', () => {
        // Declare exact type for exact VS Code hover hints
        const defaultArgs: {
            compilePath: 'mockCompilePath';
            currentPath: 'mockCurrentPath';
            showGui: false;
            compileIcon: '';
            compileBaseFile: '';
            useMpress: false;
        } = {
            compilePath: 'mockCompilePath',
            currentPath: 'mockCurrentPath',
            showGui: false,
            compileIcon: '',
            compileBaseFile: '',
            useMpress: false,
        };

        let tests: {
            name: string;
            compilePath: string;
            currentPath: string;
            showGui: boolean;
            compileIcon: string;
            compileBaseFile: string;
            useMpress: boolean;
            expected: string;
        }[] = [
            {
                name: 'Default args',
                ...defaultArgs,
                expected: `"mockCompilePath"  /in "mockCurrentPath" /out "mockCurrentPath.exe"   `,
            },
            {
                name: 'Usual current path',
                ...defaultArgs,
                currentPath: 'mock/current/path/myFile.ahk',
                expected: `"mockCompilePath"  /in "mock/current/path/myFile.ahk" /out "mock/current/path/myFile.exe"   `,
            },
            {
                name: 'Base file',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilePath"  /in "mockCurrentPath" /out "mockCurrentPath.exe"  /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Compile icon',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                expected: `"mockCompilePath"  /in "mockCurrentPath" /out "mockCurrentPath.exe" /icon "mockCompileIcon"  `,
            },
            {
                name: 'Compile icon and base file',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilePath"  /in "mockCurrentPath" /out "mockCurrentPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Use MPRESS',
                ...defaultArgs,
                useMpress: true,
                expected: `"mockCompilePath"  /in "mockCurrentPath" /out "mockCurrentPath.exe"   /mpress 1`,
            },
            {
                name: 'Show GUI',
                ...defaultArgs,
                showGui: true,
                expected: `"mockCompilePath" /gui /in "mockCurrentPath" /out "mockCurrentPath.exe"   `,
            },
            {
                name: 'Everthing populated',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                compileIcon: 'mockCompileIcon',
                showGui: true,
                useMpress: true,
                expected: `"mockCompilePath" /gui /in "mockCurrentPath" /out "mockCurrentPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" /mpress 1`,
            },
            {
                name: 'Empty compile path',
                ...defaultArgs,
                compilePath: '',
                expected: ``,
            },
            {
                name: 'Empty current path',
                ...defaultArgs,
                currentPath: '',
                expected: ``,
            },
        ];
        tests.forEach((myTest) => {
            test(myTest.name, () => {
                assert.strictEqual(
                    makeCompileCommand(
                        myTest.compilePath,
                        myTest.currentPath,
                        myTest.showGui,
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
