import * as assert from 'assert';
import { makeCompileCommand } from '../../../service/runnerService';

suite('runnerService', () => {
    suite('makeCompileCommand', () => {
        // Declare exact type for exact VS Code hover hints
        const defaultArgs: {
            compilePath: 'mockCompilePath';
            scriptPath: 'mockScriptPath';
            showGui: false;
            compileIcon: '';
            compileBaseFile: '';
            useMpress: false;
        } = {
            compilePath: 'mockCompilePath',
            scriptPath: 'mockScriptPath',
            showGui: false,
            compileIcon: '',
            compileBaseFile: '',
            useMpress: false,
        };

        const tests: {
            name: string;
            compilePath: string;
            scriptPath: string;
            showGui: boolean;
            compileIcon: string;
            compileBaseFile: string;
            useMpress: boolean;
            expected: string;
        }[] = [
            {
                name: 'Default args',
                ...defaultArgs,
                expected: `"mockCompilePath"  /in "mockScriptPath" /out "mockScriptPath.exe"   `,
            },
            {
                name: 'Usual current path',
                ...defaultArgs,
                scriptPath: 'mock/current/path/myFile.ahk',
                expected: `"mockCompilePath"  /in "mock/current/path/myFile.ahk" /out "mock/current/path/myFile.exe"   `,
            },
            {
                name: 'Base file',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilePath"  /in "mockScriptPath" /out "mockScriptPath.exe"  /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Compile icon',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                expected: `"mockCompilePath"  /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon"  `,
            },
            {
                name: 'Compile icon and base file',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilePath"  /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Use MPRESS',
                ...defaultArgs,
                useMpress: true,
                expected: `"mockCompilePath"  /in "mockScriptPath" /out "mockScriptPath.exe"   /mpress 1`,
            },
            {
                name: 'Show GUI',
                ...defaultArgs,
                showGui: true,
                expected: `"mockCompilePath" /gui /in "mockScriptPath" /out "mockScriptPath.exe"   `,
            },
            {
                name: 'Everthing populated',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                compileIcon: 'mockCompileIcon',
                showGui: true,
                useMpress: true,
                expected: `"mockCompilePath" /gui /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" /mpress 1`,
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
                scriptPath: '',
                expected: ``,
            },
        ];
        tests.forEach((myTest) => {
            test(myTest.name, () => {
                assert.strictEqual(
                    makeCompileCommand(
                        myTest.compilePath,
                        myTest.scriptPath,
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
