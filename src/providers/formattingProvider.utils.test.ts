import * as assert from 'assert';
import { suite, test } from 'mocha';
import {
    alignLineAssignOperator,
    alignSingleLineComments,
    BraceChar,
    braceNumber,
    buildIndentationChars,
    buildIndentedLine,
    calculateDepth,
    documentToString,
    FlowOfControlNestDepth,
    hasMoreCloseParens,
    hasMoreOpenParens,
    internalFormat,
    nextLineIsOneCommandCode,
    normalizeLineAssignOperator,
    purify,
    removeEmptyLines,
    trimExtraSpaces,
} from './formattingProvider.utils';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FormatOptions } from './formattingProvider.types';

// Default formatting options
const defaultFormattingOptions: {
    insertSpaces: boolean;
    tabSize: number;
    preserveIndent: boolean;
} = {
    insertSpaces: true,
    tabSize: 4,
    preserveIndent: false,
};

suite('braceNum', () => {
    interface TestBraceData {
        in: string;
        bc: BraceChar;
        bn: number;
    }
    // List of test data
    const dataList: TestBraceData[] = [
        // {
        //     in: , // input test string
        //     bc: , // brace character
        //     bn: , // brace number
        // },
        {
            in: '{}',
            bc: '{',
            bn: 0,
        },
        {
            in: '{',
            bc: '{',
            bn: 1,
        },
        {
            in: '{}{',
            bc: '{',
            bn: 1,
        },
        {
            in: '}',
            bc: '}',
            bn: 1,
        },
        {
            in: '{}}',
            bc: '}',
            bn: 1,
        },
    ];
    dataList.forEach((data) => {
        test(
            data.bc + ": '" + data.in + "'" + ' => ' + data.bn.toString(),
            () => {
                assert.strictEqual(braceNumber(data.in, data.bc), data.bn);
            },
        );
    });
});

suite('buildIndentationChars', () => {
    // List of test data
    const dataList = [
        // {
        //     dp: , // depth of indentation
        //     rs: , // expected result
        // },
        {
            dp: 0,
            ...defaultFormattingOptions,
            rs: '',
        },
        {
            dp: 1,
            ...defaultFormattingOptions,
            rs: '    ',
        },
        {
            dp: 2,
            ...defaultFormattingOptions,
            rs: '        ',
        },
        {
            dp: 1,
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: '\t',
        },
        {
            dp: 2,
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: '\t\t',
        },
    ];
    dataList.forEach((data) => {
        test(
            'depth:' +
                data.dp +
                ' spaces:' +
                data.insertSpaces.toString() +
                " => '" +
                data.rs.replace(/\t/g, '\\t') +
                "'",
            () => {
                assert.strictEqual(
                    buildIndentationChars(data.dp, {
                        insertSpaces: data.insertSpaces,
                        tabSize: data.tabSize,
                    }),
                    data.rs,
                );
            },
        );
    });
});

suite('buildIndentedLine', () => {
    // List of test data
    const dataList = [
        // {
        //     dp: , // depth of indentation
        //     fl: , // formatted line
        //     rs: , // expected result
        // },
        {
            dp: 0,
            fl: 'SoundBeep',
            ...defaultFormattingOptions,
            rs: 'SoundBeep',
        },
        {
            dp: 1,
            fl: 'SoundBeep',
            ...defaultFormattingOptions,
            rs: '    SoundBeep',
        },
        {
            dp: 2,
            fl: 'SoundBeep',
            ...defaultFormattingOptions,
            rs: '        SoundBeep',
        },
        {
            dp: 1,
            fl: 'SoundBeep',
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: '\tSoundBeep',
        },
        {
            dp: 2,
            fl: 'SoundBeep',
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: '\t\tSoundBeep',
        },
        {
            dp: 1,
            fl: '',
            ...defaultFormattingOptions,
            preserveIndent: true,
            rs: '    ',
        },
        {
            dp: 2,
            fl: '',
            ...defaultFormattingOptions,
            insertSpaces: false,
            preserveIndent: true,
            rs: '\t\t',
        },
    ];
    dataList.forEach((data) => {
        test(
            'depth:' +
                data.dp +
                ' spaces:' +
                data.insertSpaces.toString() +
                ' preserveIndent:' +
                data.preserveIndent.toString() +
                " '" +
                data.fl +
                "' => '" +
                data.rs.replace(/\t/g, '\\t') +
                "'",
            () => {
                assert.strictEqual(
                    buildIndentedLine(0, 1, data.fl, data.dp, {
                        insertSpaces: data.insertSpaces,
                        tabSize: data.tabSize,
                        preserveIndent: data.preserveIndent,
                    }),
                    data.rs,
                );
            },
        );
    });
});

suite('hasMoreCloseParens', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: ')',
            rs: true,
        },
        {
            in: '()',
            rs: false,
        },
        {
            in: '())',
            rs: true,
        },
        {
            in: '(::',
            rs: false,
        },
        {
            in: '',
            rs: false,
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
            assert.strictEqual(hasMoreCloseParens(data.in), data.rs);
        });
    });
});

suite('hasMoreOpenParens', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: '(',
            rs: true,
        },
        {
            in: '()',
            rs: false,
        },
        {
            in: '(()',
            rs: true,
        },
        {
            in: '(::',
            rs: true,
        },
        {
            in: '',
            rs: false,
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
            assert.strictEqual(hasMoreOpenParens(data.in), data.rs);
        });
    });
});

suite('purify', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: 'foo("; not comment")',
            rs: 'foo("")',
        },
        {
            in: 'MsgBox, { ; comment with close brace }',
            rs: 'MsgBox',
        },
        {
            in: 'MsgBox % "; not comment"',
            rs: 'MsgBox',
        },
        {
            in: 'str = "`; not comment"',
            rs: 'str = ""',
        },
        {
            in: 'str = "; comment with double quote"',
            rs: 'str = ""',
        },
        {
            in: 'str = "; comment',
            rs: 'str = "; comment',
        },
        {
            in: 'str = " ; comment',
            rs: 'str = "',
        },
        {
            in: 'str = " `; not comment',
            rs: 'str = " `; not comment',
        },
        {
            in: 'Gui, %id%: Color, % color',
            rs: 'Gui',
        },
        {
            in: 'Send(Gui)',
            rs: 'Send(Gui)',
        },
        {
            in: 'Send(foo)',
            rs: 'Send(foo)',
        },
        {
            in: 'foo(Gui)',
            rs: 'foo(Gui)',
        },
        {
            in: '{}',
            rs: '',
        },
        {
            in: '{}{}',
            rs: '',
        },
        {
            in: 'a{b{c}d}e',
            rs: 'ae',
        },
        {
            in: '{{}',
            rs: '{',
        },
        {
            in: '{}}',
            rs: '}',
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "' => '" + data.rs + "'", () => {
            assert.strictEqual(purify(data.in), data.rs);
        });
    });
});

suite('removeEmptyLines', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     ln: , // allowed empty lines
        //     rs: , // expected result
        // },
        {
            in: 'text\n\n\n\n\ntext\n\n\n\n\n',
            ln: -1,
            rs: 'text\n\n\n\n\ntext\n\n\n\n\n',
        },
        {
            in: 'text\n\n\n\n\ntext\n\n\n\n\n',
            ln: 0,
            rs: 'text\ntext\n',
        },
        {
            in: 'text\n\n\n\n\ntext\n\n\n\n\n',
            ln: 1,
            rs: 'text\n\ntext\n\n',
        },
        {
            in: 'text\n\n\n\n\ntext\n\n\n\n\n',
            ln: 2,
            rs: 'text\n\n\ntext\n\n\n',
        },
        {
            in: 'text\n\n\n\n\ntext\n\n\n\n\n',
            ln: 3,
            rs: 'text\n\n\n\ntext\n\n\n\n',
        },
        {
            in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
            ln: 0,
            rs: 'text\ntext\n',
        },
        {
            in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
            ln: 1,
            rs: 'text\n    \ntext\n    \n',
        },
        {
            in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
            ln: 2,
            rs: 'text\n    \n    \ntext\n    \n    \n',
        },
        {
            in: 'text\n    \n    \n    \n    \ntext\n    \n    \n    \n    \n',
            ln: 3,
            rs: 'text\n    \n    \n    \ntext\n    \n    \n    \n',
        },
        {
            in: '\n\n\ntext',
            ln: 1,
            rs: 'text',
        },
        {
            in: '    \n',
            ln: 1,
            rs: '',
        },
        {
            in: '\t\n',
            ln: 1,
            rs: '',
        },
        {
            in: 'text\ntext',
            ln: 1,
            rs: 'text\ntext',
        },
        {
            in: 'text\n',
            ln: 1,
            rs: 'text\n',
        },
        {
            // First empty line is \n -> use \n everywhere
            in: 'a\r\n\n\r\n\n\nb',
            ln: 2,
            rs: 'a\r\n\n\nb',
        },
        {
            // First empty line is \r\n -> use \r\n everywhere
            in: 'a\n\r\n\n\r\nb',
            ln: 2,
            rs: 'a\n\r\n\r\nb',
        },
        {
            // First empty line is \r\n -> use \r\n everywhere
            // Even though we have not exceeded count of empty lines
            in: 'a\n\r\n\n\r\nb',
            ln: 3,
            rs: 'a\n\r\n\r\n\r\nb',
        },
        {
            // 4 lines allowed, 3 found
            // Make no change since we have not met or exceeded allowed count
            in: 'a\n\r\n\n\r\nb',
            ln: 4,
            rs: 'a\n\r\n\n\r\nb',
        },
    ];
    dataList.forEach((data) => {
        test(
            'ln:' +
                data.ln +
                " '" +
                data.in.replace(/\r/g, '\\r').replace(/\n/g, '\\n') +
                "' => '" +
                data.rs.replace(/\r/g, '\\r').replace(/\n/g, '\\n') +
                "'",
            () => {
                assert.strictEqual(removeEmptyLines(data.in, data.ln), data.rs);
            },
        );
    });
});

suite('trimExtraSpaces', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        //     ts: , // trim extra spaces
        // },
        {
            in: 'InputFile    :=    "movie.mkv"',
            rs: 'InputFile := "movie.mkv"',
            ts: true,
        },
        {
            in: 'InputFile    :=    "movie.mkv"',
            rs: 'InputFile    :=    "movie.mkv"',
            ts: false,
        },
        {
            in: 'MsgBox,  4,   , testing   testing',
            rs: 'MsgBox, 4, , testing testing',
            ts: true,
        },
    ];
    dataList.forEach((data) => {
        test(
            'Trim(' +
                data.ts.toString() +
                "): '" +
                data.in +
                "' => '" +
                data.rs +
                "'",
            () => {
                assert.strictEqual(trimExtraSpaces(data.in, data.ts), data.rs);
            },
        );
    });
});

suite('normalizeLineAssignOperator', () => {
    // List of test data
    const dataList = [
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
            assert.strictEqual(normalizeLineAssignOperator(data.in), data.rs);
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
    const dataList = [
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
                alignLineAssignOperator(data.in, data.tp),
                data.rs,
            );
        });
    });
});

suite('FlowOfControlNestDepth.enterBlockOfCode', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input array
        //     bn: , // brace number
        //     rs: , // expected result
        // },
        {
            in: new FlowOfControlNestDepth([-1]),
            bn: 1,
            rs: [-1, -1],
        },
        {
            in: new FlowOfControlNestDepth([-1]),
            bn: 2,
            rs: [-1, -1, -1],
        },
    ];
    dataList.forEach((data) => {
        test('[' + data.in.depth + '] => [' + data.rs + ']', () => {
            assert.deepStrictEqual(data.in.enterBlockOfCode(data.bn), data.rs);
        });
    });
});

suite('FlowOfControlNestDepth.exitBlockOfCode', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input array
        //     bn: , // brace number
        //     rs: , // expected result
        // },
        {
            in: new FlowOfControlNestDepth([-1, 0, -1, 1, 2]),
            bn: 1,
            rs: [-1, 0],
        },
        {
            in: new FlowOfControlNestDepth([-1, 0, -1, 1, 2]),
            bn: 2,
            rs: [-1],
        },
    ];
    dataList.forEach((data) => {
        test('[' + data.in.depth + '] => [' + data.rs + ']', () => {
            assert.deepStrictEqual(data.in.exitBlockOfCode(data.bn), data.rs);
        });
    });
});

suite('FlowOfControlNestDepth.pop', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input array
        //     rs: , // expected result
        // },
        {
            in: new FlowOfControlNestDepth([-1]),
            rs: [-1],
        },
    ];
    dataList.forEach((data) => {
        test('[' + data.in.depth + '] => [' + data.rs + ']', () => {
            data.in.pop();
            assert.deepStrictEqual(data.in.depth, data.rs);
        });
    });
});

suite('FlowOfControlNestDepth.restoreEmptyDepth', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input array
        //     rs: , // expected result
        // },
        {
            in: new FlowOfControlNestDepth([]),
            rs: [-1],
        },
    ];
    dataList.forEach((data) => {
        test('[' + data.in.depth + '] => [' + data.rs + ']', () => {
            data.in.restoreEmptyDepth();
            assert.deepStrictEqual(data.in.depth, data.rs);
        });
    });
});

suite('FlowOfControlNestDepth.restoreDepth', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input array
        //     rs: , // expected result
        //     dp: , // depth
        // },
        {
            in: new FlowOfControlNestDepth([-1, 0, -1, 1, 2]),
            rs: 1,
            dp: [-1, 0, -1],
        },
        {
            in: new FlowOfControlNestDepth([-1]),
            rs: undefined,
            dp: [-1],
        },
    ];
    dataList.forEach((data) => {
        test('[' + data.in.depth + "] => '" + data.rs + "'", () => {
            assert.strictEqual(data.in.restoreDepth(), data.rs);
        });
        test('[' + data.in.depth + '] => [' + data.dp + ']', () => {
            data.in.restoreDepth();
            assert.deepStrictEqual(data.in.depth, data.dp);
        });
    });
});

suite('alignSingleLineComments', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: '',
            ...defaultFormattingOptions,
            preserveIndent: true,
            rs: '',
        },
        {
            in: 'MsgBox',
            ...defaultFormattingOptions,
            rs: 'MsgBox',
        },
        {
            in: 'MsgBox\n',
            ...defaultFormattingOptions,
            rs: 'MsgBox\n',
        },
        {
            in: ';comment\nMsgBox',
            ...defaultFormattingOptions,
            rs: ';comment\nMsgBox',
        },
        {
            in: ';comment\n    MsgBox',
            ...defaultFormattingOptions,
            rs: '    ;comment\n    MsgBox',
        },
        {
            in: ';comment\n\tMsgBox',
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: '\t;comment\n\tMsgBox',
        },
        {
            in: ';comment\n}\nMsgBox',
            ...defaultFormattingOptions,
            rs: '    ;comment\n}\nMsgBox',
        },
        {
            in: ';comment\n    , a: 4 }',
            ...defaultFormattingOptions,
            rs: '    ;comment\n    , a: 4 }',
        },
        {
            in: '\n    MsgBox',
            ...defaultFormattingOptions,
            preserveIndent: true,
            rs: '    \n    MsgBox',
        },
        {
            in: '\n\tMsgBox',
            ...defaultFormattingOptions,
            insertSpaces: false,
            preserveIndent: true,
            rs: '\t\n\tMsgBox',
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
            assert.strictEqual(
                alignSingleLineComments(data.in, {
                    insertSpaces: data.insertSpaces,
                    tabSize: data.tabSize,
                    preserveIndent: data.preserveIndent,
                }),
                data.rs,
            );
        });
    });
});

suite('calculateDepth', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: '',
            ...defaultFormattingOptions,
            rs: 0,
        },
        {
            in: 'MsgBox',
            ...defaultFormattingOptions,
            rs: 0,
        },
        {
            in: '        MsgBox',
            ...defaultFormattingOptions,
            rs: 2,
        },
        {
            in: '\t\tMsgBox',
            ...defaultFormattingOptions,
            insertSpaces: false,
            rs: 2,
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
            assert.strictEqual(
                calculateDepth(data.in, {
                    insertSpaces: data.insertSpaces,
                    tabSize: data.tabSize,
                }),
                data.rs,
            );
        });
    });
});

suite('nextLineIsOneCommandCode', () => {
    // List of test data
    const dataList = [
        // {
        //     in: , // input test string
        //     rs: , // expected result
        // },
        {
            in: 'else',
            rs: true,
        },
        {
            in: '}else',
            rs: true,
        },
        {
            in: '} else',
            rs: true,
        },
        {
            in: 'else{',
            rs: true,
        },
        {
            in: 'else {',
            rs: true,
        },
        {
            in: 'Else:',
            rs: false,
        },
    ];
    dataList.forEach((data) => {
        test("'" + data.in + "'" + ' => ' + data.rs.toString(), () => {
            assert.strictEqual(nextLineIsOneCommandCode(data.in), data.rs);
        });
    });
});

// Internal tests mock VS Code behavior to isolate flaws and run faster
suite('internal documentToString', () => {
    const myTests = [
        {
            name: '0 lines (empty string)',
            in: {
                lineCount: 0,
                lineAt(): { text: string } {
                    throw new Error('Argument out of bounds');
                },
            },
            out: '',
        },
        {
            name: '1 non-empty line',
            in: {
                lineCount: 1,
                lineAt(): { text: string } {
                    return { text: 'hi' };
                },
            },
            out: 'hi',
        },
        {
            name: '2 non-empty lines',
            in: {
                lineCount: 2,
                lineAt(i: number): { text: string } {
                    const result = !i ? 'hello' : 'world';
                    return { text: result };
                },
            },
            out: 'hello\nworld',
        },
        {
            name: '3 non-empty lines',
            in: {
                lineCount: 3,
                lineAt(i: 0 | 1 | 2): { text: string } {
                    const map: Record<0 | 1 | 2, string> = {
                        [0]: 'how',
                        [1]: 'are',
                        [2]: 'you',
                    };
                    const result = map[i];
                    return { text: result };
                },
            },
            out: 'how\nare\nyou',
        },
        {
            name: '1 empty line, nothing else',
            in: {
                lineCount: 1,
                lineAt(): { text: string } {
                    return { text: '' };
                },
            },
            out: '',
        },
        {
            name: '2 empty lines, nothing else',
            in: {
                lineCount: 2,
                lineAt(): { text: string } {
                    return { text: '' };
                },
            },
            out: '\n',
        },
    ];

    myTests.forEach((myTest) =>
        test(myTest.name, () => {
            assert.strictEqual(documentToString(myTest.in), myTest.out);
        }),
    );
});

interface FormatTest {
    /** Name of the file, excluding the suffix (@see inFilenameSuffix, @see outFilenameSuffix) */
    filenameRoot: string;
    // Any properties not provided will use `defaultOptions` below
    options?: Partial<FormatOptions>;
}

suite.only('internalFormat', () => {
    // Currently in `out` folder, need to get back to main `src` folder
    const filesParentPath = path.join(
        __dirname, // ./out/src/providers
        '..', // ./out/src
        '..', // ./out
        '..', // .
        'src', // ./src
        'providers', // ./src/providers
        'samples', // ./src/providers/samples
    );

    const inFilenameSuffix = '.in.ahk';
    const outFilenameSuffix = '.out.ahk';

    const fileToString = (path: string): string =>
        fs.readFileSync(path).toString();

    /** Default formatting options, meant to match default extension settings */
    const defaultOptions = {
        tabSize: 4,
        insertSpaces: true,
        allowedNumberOfEmptyLines: 1,
        indentCodeAfterLabel: true,
        indentCodeAfterIfDirective: true,
        preserveIndent: false,
        trimExtraSpaces: true,
    };

    const formatTests: FormatTest[] = [
        { filenameRoot: '25-multiline-string' },
        { filenameRoot: '28-switch-case' },
        { filenameRoot: '40-command-inside-text' },
        { filenameRoot: '55-if-directive' },
        { filenameRoot: '56-return-command-after-label' },
        { filenameRoot: '58-parentheses-indentation' },
        { filenameRoot: '59-one-command-indentation' },
        { filenameRoot: '72-paren-hotkey' },
        { filenameRoot: '119-semicolon-inside-string' },
        { filenameRoot: '161-colon-on-last-position' },
        { filenameRoot: '180-if-else-braces' },
        {
            filenameRoot: '182-multiple-newlines',
            options: { allowedNumberOfEmptyLines: 2 },
        },
        { filenameRoot: '184-continuation-section-expression' },
        { filenameRoot: '184-continuation-section-object' },
        { filenameRoot: '184-continuation-section-text' },
        { filenameRoot: '185-block-comment' },
        {
            filenameRoot: '187-comments-at-end-of-line',
            options: { trimExtraSpaces: false },
        },
        { filenameRoot: '188-one-command-code-in-text' },
        { filenameRoot: '189-space-at-end-of-line' },
        {
            filenameRoot: '192-preserve-indent-true',
            options: { preserveIndent: true },
        },
        { filenameRoot: '255-close-brace' },
        { filenameRoot: '255-else-if' },
        { filenameRoot: '255-if-loop-mix' },
        { filenameRoot: '255-return-function' },
        { filenameRoot: '255-return-label' },
        { filenameRoot: '255-style-allman' },
        { filenameRoot: '255-style-k-and-r' },
        { filenameRoot: '255-style-mix' },
        { filenameRoot: '255-style-one-true-brace' },
        { filenameRoot: '290-ifmsgbox' },
        { filenameRoot: '291-single-line-comment' },
        { filenameRoot: '316-if-object-continuation-section' },
        { filenameRoot: '429-single-line-hotkey' },
        { filenameRoot: '432-label-inside-code-block' },
        {
            filenameRoot:
                '440-fall-through-single-line-hotkey-with-if-directive',
        },
        { filenameRoot: '442-fall-through-single-line-hotkey-with-function' },
        { filenameRoot: 'ahk-explorer' },
        { filenameRoot: 'align-assignment' },
        { filenameRoot: 'demo' },
        {
            filenameRoot: 'indent-code-after-if-directive-false',
            options: { indentCodeAfterIfDirective: false },
        },
        {
            filenameRoot: 'indent-code-after-if-directive-true',
            options: { indentCodeAfterIfDirective: true },
        },
        {
            filenameRoot: 'indent-code-after-label-false',
            options: { indentCodeAfterLabel: false },
        },
        {
            filenameRoot: 'indent-code-after-label-true',
            options: { indentCodeAfterLabel: true },
        },
        {
            filenameRoot: 'insert-spaces-false',
            options: { insertSpaces: false },
        },
        { filenameRoot: 'legacy-text-if-directive' },
        { filenameRoot: 'label-colon' },
        { filenameRoot: 'label-combination' },
        { filenameRoot: 'label-fall-through' },
        { filenameRoot: 'label-specific-name' },
        { filenameRoot: 'return-exit-exitapp' },
        { filenameRoot: 'single-line-comment' },
        {
            filenameRoot: 'tab-size-2',
            options: { tabSize: 2 },
        },
    ];

    formatTests.forEach((formatTest) => {
        test(`${formatTest.filenameRoot} internal format`, async () => {
            // Arrange
            const inFilePath = path.join(
                filesParentPath,
                `${formatTest.filenameRoot}${inFilenameSuffix}`,
            );
            const inFileString = fileToString(inFilePath);
            const outFilePath = path.join(
                filesParentPath,
                `${formatTest.filenameRoot}${outFilenameSuffix}`,
            );
            const outFileString = fileToString(outFilePath);
            const options = { ...defaultOptions, ...formatTest.options };

            // Act
            const actual = internalFormat(inFileString, options);

            // Assert
            assert.strictEqual(actual, outFileString);
        });
    });
});
