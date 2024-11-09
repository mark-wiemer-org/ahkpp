;* Formatting should not change this file
;* By default no action needed, older versions would show warnings or errors
#Requires AutoHotkey v2.0

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/591
TraySetIcon(, , true)

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/594
class Test {
    __New() {
        1 ? this.b := 1 : 0
    }
}

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/595
;* Should suggest `ptr` as second arg (Ctrl+Space)
DllCall.Bind("xx", "p")

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/596
Help:: return
Sleep:: return

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/574
if 1 {
    f() {
        MsgBox("in")
    }
    MsgBox("out")
}

; https://github.com/thqby/vscode-autohotkey2-lsp/issues/571
class class2 {
    __New() {
        this.g := Gui()
        ;* hover over `add` to see tooltip
        this.g.add()
    }
}
