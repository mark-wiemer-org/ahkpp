; [Issue #161](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/161)
foo()
{
    if (InStr(fileExist(CurrentDir%whichSide%), "D"))
    {
        for i, drive in drives {
            DriveGet, totalSpace, Capacity, %drive%:
            DriveSpaceFree, freeSpace, %drive%:
            GuiControl, Show, Drive%i%
        }
    } else {
        ToolTip
    }
}
