import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
    suite('normalizeLineAssignOperator', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: 'a = 5 ; beautiful operator =',
                rs: 'a = 5 ',
            },
            {
                in: 'abc=text',
                rs: 'abc = text',
            },
            {
                in: 'InputFile  :=  "movie.mkv"',
                rs: 'InputFile := "movie.mkv"',
            },
            {
                in: 'a := 5    ; beautiful operator :=',
                rs: 'a := 5    ',
            },
            {
                in: 'abc:="text"',
                rs: 'abc := "text"',
            },
            {
                in: 'abc:=a  +  b',
                rs: 'abc := a + b',
            },
            {
                in: '; beautiful operator :=',
                rs: '',
            },
            {
                in: 'ToolTip, text',
                rs: 'ToolTip, text',
            },
            {
                in: 'x := "1+1=2"',
                rs: 'x := "1+1=2"',
            },
            {
                in: 'val = "="',
                rs: 'val = "="',
            },
            {
                in: 'withSpaces = "x = y"',
                rs: 'withSpaces = "x = y"',
            },
            {
                in: '    IndentedVariableWithTrailSpaces  =  movie.mkv  ',
                rs: '    IndentedVariableWithTrailSpaces = movie.mkv  ',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(
                    CodeUtil.normalizeLineAssignOperator(data.in),
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
            a := 5    ; beautiful operator :=
            abc:="abc"
            abc:=a  +  b
            ; beautiful operator :=
        Output Data
            InputFile := "movie.mkv"
            a         := 5    ; beautiful operator :=
            abc       := "abc"
            abc       := a + b
            ; beautiful operator :=
        */
        let dataList = [
            // {
            //     in: , // input test string
            //     tp: , // target position
            //     rs: , // expected result
            // },
            {
                in: 'InputFile  =  movie.mkv',
                rs: 'InputFile = movie.mkv',
                tp: 10,
            },
            {
                in: 'a = 5 ; beautiful operator =',
                rs: 'a         = 5 ; beautiful operator =',
                tp: 10,
            },
            {
                in: 'abc=text',
                rs: 'abc       = text',
                tp: 10,
            },
            {
                in: 'InputFile  :=  "movie.mkv"  ',
                rs: 'InputFile := "movie.mkv"',
                tp: 11,
            },
            {
                in: 'a := 5    ; beautiful operator :=',
                rs: 'a         := 5    ; beautiful operator :=',
                tp: 11,
            },
            {
                in: 'abc:=a  +  b',
                rs: 'abc       := a + b',
                tp: 11,
            },
            {
                in: 'abc:="text"',
                rs: 'abc       := "text"',
                tp: 11,
            },
            {
                in: '; beautiful operator :=',
                rs: '; beautiful operator :=',
                tp: 15,
            },
            {
                in: 'ToolTip, text',
                rs: 'ToolTip, text',
                tp: 15,
            },
            {
                in: '    IndentedVarWithTrailSpaces  =  movie.mkv  ',
                rs: '    IndentedVarWithTrailSpaces = movie.mkv',
                tp: 31,
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
