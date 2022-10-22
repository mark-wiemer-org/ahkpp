; [Issue #184](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/184)
obj := { 0:0
    , a: {}
    , b: "string"
    , c: { d: "open brace"
        , e: "nested object"
        , f: { g: "open brace"
            , h: "double nested object"
            , i: "close brace" }
        , j: "close brace" }
    , k: { l: 4 } }

FileAppend, This is the text to append.`n ; A comment is allowed here.
    , %A_ProgramFiles%\SomeApplication\LogFile.txt ; Comment.

if (Color = "Red" or Color = "Green" or Color = "Blue" ; Comment.
    or Color = "Black" or Color = "Gray" or Color = "White") ; Comment.
    and ProductIsAvailableInColor(Product, Color) ; Comment.
{
    MsgBox
    MsgBox
}

if (a = 4
    and b = 5) {
    MsgBox
    MsgBox
}

if (a = 4
    and b = 5)
    MsgBox
MsgBox

if a = 4
    and b = 5
    MsgBox
MsgBox

ProductIsAvailable := (Color = "Red")
    ? false
    : ProductIsAvailableInColor(Product, Color)

foo() {
    return (sizeIndex = 0) ? size " B"
        : round(size, decimalPlaces) . " " . sizes[sizeIndex]
}

Var =
(
A line of text.
By default, the hard carriage return (Enter) between the previous line and this one will be stored as a linefeed (`n).
    By default, the spaces to the left of this line will also be stored (the same is true for tabs).
By default, variable references such as %Var% are resolved to the variable's contents.
)

Var := "
(
Same as above, except that variable references such as %Var% are not resolved.
Instead, specify variables as follows:" Var "
)"

{
    Var := "
(
Text must be not indented.
)"
    Var := "Line must be indented."
    Var := "
    ( LTrim
        Text must be indented with preserved    extra    spaces between words.
    )"
}

++i
--i
;comment must be not indented

+F1::
^F1::
!F1::
#F1::
*F1::
~F1::
<!a::
>!a::
