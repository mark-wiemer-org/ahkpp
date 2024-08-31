; [Issue #429](https://github.com/mark-wiemer-org/ahkpp/issues/429)
#IfWinActive, WinTitle
    F1::
    F2::
        code
    return

    F1::
    F2:: foo()
    F3:: bar()

    F1::
        code
    F2:: foo()
    F3:: bar()
#If
