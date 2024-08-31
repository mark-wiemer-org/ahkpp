; [Issue #255](https://github.com/vscode-autohotkey/ahkpp/issues/290)
MsgBox, 4, , Would you like to continue?, 5 ; 5-second timeout.
IfMsgBox, No
    Return ; User pressed the "No" button.
IfMsgBox, Timeout
    Return ; i.e. Assume "No" if it timed out.
; Otherwise, continue
