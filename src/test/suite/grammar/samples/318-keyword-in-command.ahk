; [Issue #318](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/318)
RAlt & j::AltTab
RAlt & k::ShiftAltTab
Control, Show
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
Gui, Font, s10 Norm Italic cRed
Gui, Color, Red
Gui, Flash, Off
Gui, +AlwaysOnTop +Disabled -SysMenu +Owner
Gui, New, -Caption +LastFound
Gui, Add, Text, x+5 +Hidden
Gui, Add, Edit, Multi Limit ;BUG Edit keyword
Gui, Add, UpDown, Horz 0x80
Gui, Add, Picture, Icon2, Application.exe
Gui, Add, Button, w80 Default, OK
Gui, Add, Checkbox, Checked, Some text
Gui, Add, Radio, Checked, Some text
Gui, Add, DropDownList, Uppercase, Black|White
Gui, Add, ComboBox, Simple, Red|Green
Gui, Add, ListBox, ReadOnly, Red|Green
Gui, Add, DateTime, ChooseNone, LongDate ;???
Gui, Add, MonthCal, Multi 8
Gui, Add, Slider, Invert, 50
Gui, Add, Progress, w200 h20 cRed BackgroundGreen, 75 ;BUG Progress keyword
Gui, Add, Tab3, Buttons, General|Settings
Gui, Add, ListView, -LV0x10 AltSubmit cRed
Gui, Add, TreeView, -ReadOnly cRed
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
Thread, NoTimers
Transform, OutputVar, Unicode
WinGet, active_id, ID, A
WinSet, Transparent, 200, Untitled

Break
Continue

LegacyString is break continue id on off days grid
GuiString center, hide, disabled alwaysontop hidden
WinGetString word, id
