; [Issue #295](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/295)
Foo()
Foo();NotComment
Foo() ;Comment
Foo() {;NotComment
    MsgBox
}
Bar() { ;Comment
    MsgBox
}
