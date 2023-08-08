import * as assert from 'assert';
import { makeCompileCommand } from '../../../service/runnerService';

suite('runnerService', () => {
    suite('makeCompileCommand', () => {
        // Declare exact type for exact VS Code hover hints
        const defaultArgs: {
            compilerPath: 'mockCompilerPath';
            scriptPath: 'mockScriptPath';
            showGui: false;
            compileIcon: '';
            compileBaseFile: '';
            useMpress: false;
        } = {
            compilerPath: 'mockCompilerPath',
            scriptPath: 'mockScriptPath',
            showGui: false,
            compileIcon: '',
            compileBaseFile: '',
            useMpress: false,
        };

        const tests: {
            name: string;
            compilerPath: string;
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
                expected: `"mockCompilerPath"  /in "mockScriptPath" /out "mockScriptPath.exe"   `,
            },
            {
                name: 'Usual current path',
                ...defaultArgs,
                scriptPath: 'mock/current/path/myFile.ahk',
                expected: `"mockCompilerPath"  /in "mock/current/path/myFile.ahk" /out "mock/current/path/myFile.exe"   `,
            },
            {
                name: 'Base file',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilerPath"  /in "mockScriptPath" /out "mockScriptPath.exe"  /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Compile icon',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                expected: `"mockCompilerPath"  /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon"  `,
            },
            {
                name: 'Compile icon and base file',
                ...defaultArgs,
                compileIcon: 'mockCompileIcon',
                compileBaseFile: 'mockCompileBaseFile',
                expected: `"mockCompilerPath"  /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" `,
            },
            {
                name: 'Use MPRESS',
                ...defaultArgs,
                useMpress: true,
                expected: `"mockCompilerPath"  /in "mockScriptPath" /out "mockScriptPath.exe"   /mpress 1`,
            },
            {
                name: 'Show GUI',
                ...defaultArgs,
                showGui: true,
                expected: `"mockCompilerPath" /gui /in "mockScriptPath" /out "mockScriptPath.exe"   `,
            },
            {
                name: 'Everthing populated',
                ...defaultArgs,
                compileBaseFile: 'mockCompileBaseFile',
                compileIcon: 'mockCompileIcon',
                showGui: true,
                useMpress: true,
                expected: `"mockCompilerPath" /gui /in "mockScriptPath" /out "mockScriptPath.exe" /icon "mockCompileIcon" /bin "mockCompileBaseFile" /mpress 1`,
            },
            {
                name: 'Empty compile path',
                ...defaultArgs,
                compilerPath: '',
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
                        myTest.compilerPath,
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
