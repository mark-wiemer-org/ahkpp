; [Issue #25](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/119)
MsgBox, { ; comment with close brace }
bar()
{
    if (foo() == ";")
        true
}
foo()
{
    return ";"
}
