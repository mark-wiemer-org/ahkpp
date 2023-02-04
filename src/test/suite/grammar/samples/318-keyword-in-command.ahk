; [Issue #318](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/318)
CoordMode, ToolTip, Screen ;BUG ToolTip keyword
Drive, Unlock, C:
DriveGet, OutputVar, List, FIXED
FormatTime, TimeString, T12, Time
FormatTime, TimeString,, LongDate
Gui, Show, Center NoActivate, Title
Gui, GuiName:Show, Options, Title
Gui, %GuiName%:Show, Options, Title
Gui, Add, Link, Options, Title
Gui, GuiName:Add, Link, Options, Title
Gui, %GuiName%:Add, Link, Options, Title
Gui, Submit, NoHide
Gui, Font, s10 Norm Italic
Gui, Color, White
Gui, Flash, Off
If var between 1 and 5
If var not between 1 and 5
If var contains 1,3
If var not contains 1,3
If var in exe,bat
If var not in exe,bat
If var is Time
If var is not Time
IfMsgBox, Timeout
Loop, Files, *.jpg
Loop, Reg, HKEY_CURRENT_USER\Software, KVR
Menu, MyMenu, Add
Menu, Tray, Add
Process, Priority, notepad.exe, BelowNormal
SetCapsLockState, AlwaysOff
SetFormat, IntegerFast, Hex
WinGet, active_id, ID, A
WinSet, Transparent, 200, Untitled

Break
Continue

legacyString = is break continue id center hide on off days grid
