import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
    suite('prepareLineAssignOperator', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: '    InputFile  :=  "movie.mkv"',
                rs: '    InputFile := "movie.mkv"',
            },
            {
                in: '    a := 5 ; beautiful operator :=',
                rs: '    a := 5 ',
            },
            {
                in: '    abc:="abc"',
                rs: '    abc := "abc"',
            },
            {
                in: '    ; beautiful operator :=',
                rs: '    ',
            },
            {
                in: '    str = text',
                rs: '    str = text',
            },
            {
                in: '    ToolTip, text',
                rs: '    ToolTip, text',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(
                    CodeUtil.prepareLineAssignOperator(data.in),
                    data.rs,
                );
            });
        });
    });

    suite('alignLineAssignOperator', () => {
        // List of test data
        /*
        Input Data
            InputFile  :=  "movie.mkv"  
            a := 5 ; beautiful operator :=
            abc:="abc"
            ; beautiful operator :=
        Output Data
            InputFile := "movie.mkv"
            a         := 5 ; beautiful operator :=
            abc       := "abc"
            ; beautiful operator :=
        */
        let dataList = [
            // {
            //     in: , // input test string
            //     tp: , // target position
            //     rs: , // expected result
            // },
            {
                in: '    InputFile  :=  "movie.mkv"  ',
                rs: '    InputFile := "movie.mkv"',
                tp: 14,
            },
            {
                in: '    a := 5 ; beautiful operator :=',
                rs: '    a         := 5 ; beautiful operator :=',
                tp: 14,
            },
            {
                in: '    abc:="abc"',
                rs: '    abc       := "abc"',
                tp: 14,
            },
            {
                in: '    ; beautiful operator :=',
                rs: '    ; beautiful operator :=',
                tp: 14,
            },
            {
                in: '    str = text',
                rs: '    str = text',
                tp: 14,
            },
            {
                in: '    ToolTip, text',
                rs: '    ToolTip, text',
                tp: 14,
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(
                    CodeUtil.alignLineAssignOperator(data.in, data.tp),
                    data.rs,
                );
            });
        });
    });
});
