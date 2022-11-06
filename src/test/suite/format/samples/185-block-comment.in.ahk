; [Issue #185](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/185)
foo () {
;@AHK++FormatBlockCommentOn
/*
typedef struct TEST {
DWORD cbSize ; 0
} CMINVOKECOMMANDINFOEX;
*/
/*
MsgBox, This line is commented out (disabled).
MsgBox, Common mistake: */ this does not end the comment.
MsgBox, This line is commented out.
*/
/*
bar() {
Loop, 4 {
MsgBox % A_Index
}
if (true) {
SoundBeep
} else {
MsgBox
}
}
if (true)
ToolTip
MsgBox
*/
/*
obj := { a: 4
, b: "string" }
isPositive := x > 0
? true
: false
var =
( LTrim
Text must be indented with preserved    extra    spaces between words.
)
*/
/*
loop
if
loop
code
else
code
code
*/
/*
if {
code
code
*/
;@AHK++FormatBlockCommentOff
MsgBox
/*
    All text in this block comment must save original indent
bar() {
        Loop, 4 {
                MsgBox % A_Index
        }
}
*/
}
