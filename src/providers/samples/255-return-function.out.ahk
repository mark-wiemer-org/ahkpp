; [Issue #255](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/255)
foo() {
    Loop
        code
    Loop
        if
            code
    return
}

foo() {
    Loop
        code
    Loop
        if {
            code
        }
    return
}
