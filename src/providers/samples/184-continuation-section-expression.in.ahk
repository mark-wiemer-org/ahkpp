; [Issue #184](https://github.com/mark-wiemer-org/ahkpp/issues/184)
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

Loop
    code
        , code
        , code
code

Loop
    if a > 0
        and b > 0
        and c > 0
        code
code

ProductIsAvailable := (Color = "Red") ? false
    : ProductIsAvailableInColor(Product, Color)

foo() {
    return (sizeIndex = 0) ? size " B"
        : round(size, decimalPlaces) . " " . sizes[sizeIndex]
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