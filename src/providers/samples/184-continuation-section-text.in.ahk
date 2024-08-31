; [Issue #184](https://github.com/mark-wiemer-org/ahkpp/issues/184)
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

var =
(LTrim
{
    text
}
)

var =
(LTrim
`(
text
`)
)
