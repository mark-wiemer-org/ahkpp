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
        MsgBox Overwrite primitive variable!
    }
    ; Known bug: `line <n>` lines should be indented one level more
    ; https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/25
    str_multiline := "
    (LTrim
    line 1
    line 2
    line 3
    )"
    int := 123
    float := 123.456

    emptyArray := []
    smallArray := [1, 2, { str: "string" }]
    sparseArray := { 1: 1, 3: 3 }
    arrayLike := { 1: 1, 2: 2, 3: 3, length: 3 }
    bigArray := []
    Loop 150 {
        bigArray.push(A_Index)
    }
    if (bigArray == "str") {
        MsgBox Overwrite object variable!
    }

    obj := { str: str, int: int, float: float }
    objobj := { str: str, obj: obj }
    objobjobj := { str: str, int: int, obj: { str: str, obj: obj } }

    circular := {}
    circular.circular := circular
    instance := new Cls()

    enum := obj._NewEnum()
}
class Cls
{
    instanceVar := "instance"
    static str := "string"
    static num := 123
    static obj := { str: "string", int: 123, float: 123.456 }
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
*/ ;endregion

; Function calls (with a space before parens)
foo()
bar ()
baz () ; multiple spaces

; SUBROUTINES

; ExitApp indentation for subroutines
MySub:
    foo()
ExitApp ; should not be indented at all

; Formatting line below ternary with third operand a string value
true ? 1 : "string"
foo() ; should not be indented at all