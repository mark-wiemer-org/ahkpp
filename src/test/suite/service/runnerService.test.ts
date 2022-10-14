import * as assert from 'assert';
import { RunnerService } from '../../../service/runnerService';

suite('RunnerService', () => {
    suite('compileCommand', () => {
        const compilePath = 'C:/Ahk2Exe.exe';
        const scriptPath = 'C:/Untitled.ahk';
        const exePath = 'C:/Untitled.exe';
        // List of test data
        let dataList = [
            // {
            //     cp: , // compiler path
            //     sp: , // script path
            //     sg: , // show GUI
            //     rs: , // expected result
            // },
            {
                cp: compilePath,
                sp: scriptPath,
                sg: false,
                rs: `"${compilePath}" /in "${scriptPath}" /out "${exePath}"`,
            },
            {
                cp: compilePath,
                sp: scriptPath,
                sg: true,
                rs: `"${compilePath}" /gui /in "${scriptPath}" /out "${exePath}"`,
            },
            {
                cp: '',
                sp: '',
                sg: false,
                rs: '',
            },
        ];
        dataList.forEach((data) => {
            test(
                'compilePath: "' +
                    data.cp +
                    '" scriptPath: "' +
                    data.sp +
                    '" showGui: ' +
                    data.sg.toString() +
                    " => '" +
                    data.rs +
                    "'",
                () => {
                    assert.strictEqual(
                        RunnerService.compileCommand(data.cp, data.sp, data.sg),
                        data.rs,
                    );
                },
            );
        });
    });
});
