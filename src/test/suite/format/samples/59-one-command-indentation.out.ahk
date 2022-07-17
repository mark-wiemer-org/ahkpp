; [Issue #25](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/59)
if (true)
    /*
    typedef struct TEST {
        DWORD cbSize;          0
        DWORD cbSizeBigger;    0
    } NAME;
    */
    /*
    MsgBox, This line is commented out (disabled).
    MsgBox, Common mistake: */ this does not end the comment.
    MsgBox, This line is commented out. 
    */
    /*
    if (true)
        ToolTip
    */
    return
