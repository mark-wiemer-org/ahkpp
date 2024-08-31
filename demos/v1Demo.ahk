#Requires AutoHotkey v1

globalVar := "Global"
global SuperGlobalVar := "SuperGlobal"
function()
return
function()
{
    globalVar := "Local"
    SuperGlobalVar := "Local"
    bool := true
    str := "string"
    if (str == "str") {
        MsgBox Overwrite primitive variable !
    }
    str_multiline :=
        "
    (LTrim
        line 1
        line 2
        line 3
    )"
    int := 123
    float := 123.456

    emptyArray := []
    smallArray := [1, 2, {
        str: "string"}]
    sparseArray := {
        1: 1, 3: 3}
    arrayLike := {
        1: 1, 2: 2, 3: 3, length: 3}
    bigArray := []
    Loop 150 {
        bigArray.push(A_Index)
    }
    if (bigArray == "str") {
        MsgBox Overwrite object variable !
    }

    obj := {
        str: str, int: int, float: float}
    objobj := {
        str: str, obj: obj}
    objobjobj := {
        str: str, int: int, obj: {
            str: str, obj: obj} }

    circular := {
    }
    circular.circular := circular
    instance := new Cls()

    enum := obj._NewEnum()
}
class Cls
{
    instanceVar := "instance"
    static str := "string"
    static num := 123
    static obj := {
        str: "string", int: 123, float: 123.456}
    property[] {
        get {
        }
    }
    method() {
    }
}

; Block comments and nested regions
/* ;region
Collapse me!
{
    Collapse me too!
}
*/

; Block comments and nested regions
/* ;region
Collapse me!
{
    Collapse me too!
}
*/ ;endregion

; Hotkeys and Keywords

<#Tab::AltTab

; FUNCTIONS

; Function calls (with a space before parens)
function()
function ()

; Functions with keyword names
LAlt() {
}
Pause() {
}
AppsKey() {
}
CapsLock() {
}

; Method header comments appear on hover
hoverToSeeComment() {
}

; SUBROUTINES

; ExitApp indentation for subroutines
MySub:
    function()
ExitApp

; RUN SELECTION

; Select the following line and hit `Ctrl + F8` to run selection
f1:: MsgBox, You hit F1

; The F2 hotkey will not work because it was not part of the selection
f2:: MsgBox, You hit F2

; Formatting line below ternary with third operand a string value
true ? 1 : "string"
function()

;;;;;;;;;;
; v3.2.0 ;
;;;;;;;;;;

;;;
; Move lines of code down with correct indentation
;;;

var
foo() {
    if expression
        code
    code
    if (expression)
        code
    if (expression) {
        code
    }

}

;;;
; Check out these correctly-colored lines of code!
;;;

; https://github.com/mark-wiemer-org/ahkpp/pull/278
Hotstring("::ykhis", "you know how it is")
Hotstring(":C:OOS", "out-of::-spec")

; https://github.com/mark-wiemer-org/ahkpp/issues/69
#If WinActive("ahk_class Notepad") or WinActive(MyWindowTitle)
#If

; https://github.com/mark-wiemer-org/ahkpp/issues/86
#Include Chrome.ahk ; and a nice green comment
#IncludeAgain Chrome.ahk ; and another green comment

; https://github.com/mark-wiemer-org/ahkpp/issues/295
foo(); this is not actually a comment, it doesn't have a preceding space

;;;
; And these well-formatted snippets:
;;;

; https://github.com/mark-wiemer-org/ahkpp/issues/291
if (expression)
    ;
    code

; https://github.com/mark-wiemer-org/ahkpp/issues/290
MsgBox, 4, , Would you like to continue ?, 5 ; 5-second timeout.
IfMsgBox, No
Return ; User pressed the "No" button.
IfMsgBox, Timeout
Return ; i.e. Assume "No" if it timed out.
; Otherwise, continue:
; ...

F1 & F2 Up::
code
return

; https://github.com/mark-wiemer-org/ahkpp/issues/303
F1 & F2 Up::
code
return
::btw::
code
return

; https://github.com/mark-wiemer-org/ahkpp/issues/316
if (expression)
    obj := {
    0: ""
        , a: 1
        , b: 2}
else
    obj := {
    0: ""
        , a: 2
        , b: 1}
code

; https://github.com/mark-wiemer-org/ahkpp/pull/287
{
    foo() {
        if
            if
                if
                    return
    }

    foo() {
        for
            for
                if
                    return
    }
}

;;;
; Hover messages are now trimmed
;;;

;        <-- those spaces will be gone!
hoverOverMe() {

}

#HotIf
#HotkeyInterval