; [Issue #318](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/318)
RAlt & j::AltTab
RAlt & k::ShiftAltTab
AutoTrim, On
BlockInput, MouseMoveOff
DetectHiddenWindows, On
Control, Show
ControlClick, OK, WinTitle,, Left,, NA
CoordMode, Pixel, Screen
Drive, Unlock, C:
DriveGet, OutputVar, List, FIXED
EnvAdd, Var, 5, Days
Var += 5, Days
FileEncoding, CP65001
FileEncoding, UTF-16
For Key in Expression
For Key, Value in Expression
FormatTime, TimeString, T12, Time
FormatTime, TimeString,, LongDate
GetKeyState, OutputVar, WhichKey, P
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
Gui, Add, Edit, Multi Limit ;BUG "Edit" not keyword, but command
Gui, Add, UpDown, Horz 0x80
Gui, Add, Picture, Icon2, Application.exe
Gui, Add, Button, w80 Default, OK
Gui, Add, Checkbox, Checked, Some text
Gui, Add, Radio, Checked, Some text
Gui, Add, DropDownList, Uppercase, Black|White
Gui, Add, ComboBox, Simple, Red|Green
Gui, Add, ListBox, ReadOnly, Red|Green
Gui, Add, DateTime,, ChooseNone
Gui, Add, MonthCal, Multi 8
Gui, Add, Slider, Invert, 50
Gui, Add, Progress, w200 h20 cRed BackgroundGreen, 75 ;BUG "Progress" not keyword, but command
Gui, Add, Tab3, Buttons, General|Settings
Gui, Add, ListView, -LV0x10 AltSubmit cRed
Gui, Add, TreeView, -ReadOnly cRed
Gui, ListView, ListViewName
GuiControl, +AltSubmit -g, MyListBox
GuiControl, GuiName: +AltSubmit -g, MyListBox
GuiControl, %GuiName%: +AltSubmit -g, MyListBox
GuiControl, Font, MyEdit
GuiControl, GuiName:Font, MyEdit
GuiControl, %GuiName%:Font, MyEdit
GuiControlGet, MyEdit, GuiName:Pos
GuiControlGet, MyEdit, %GuiName%:Pos
If var between 1 and 5
If var not between 1 and 5
If var contains 1,3
If var not contains 1,3
If var in exe,bat
If var not in exe,bat
If var is Float
If var is not Float
IfMsgBox, Timeout
InputBox, OutputVar, Title, Prompt, HIDE
Loop, Files, *.jpg, DFR
Loop, Parse, InputVar, CSV
Loop, Reg, HKEY_CURRENT_USER\Software, KVR
Menu, MyMenu, Add
Menu, Tray, Add
MouseClickDrag, Middle
PixelGetColor, OutputVar, X, Y, Alt RGB
PixelSearch, Px, Py, 200, 200, 300, 300, 0x9d6346, 3, Fast RGB
Process, Priority, notepad.exe, BelowNormal
Progress, Show
Progress, CWRed CTRed
RegDelete, HKEY_LOCAL_MACHINE\Software\SomeApplication, AHK_DEFAULT
RegRead, OutputVar, HKEY_LOCAL_MACHINE\Software\SomeApplication, TestValue
RegWrite, REG_SZ, HKEY_LOCAL_MACHINE\SOFTWARE\TestKey, MyValueName, TestValue
RunWait, Target,, Min
SendMode, Event
SetCapsLockState, AlwaysOff
SetFormat, IntegerFast, Hex
SetMouseDelay, 0, Play
SetKeyDelay, 0, 0, Play
SetRegView, 32
SetTimer, Label, Delete
SetTitleMatchMode, Fast
SoundSet, +20, Master, Bass
SoundSet, +1,, Mute
SplashImage, Image.png, CWRed CTRed
SplashImage, Show
StringCaseSense, Locale
SysGet, OutputVar, Monitor
Thread, NoTimers
Transform, OutputVar, Unicode
WinGet, active_id, ID, A
WinSet, Transparent, 200, Untitled

;Special case strings
LegacyString is id on off days grid
GuiString center, hide, disabled alwaysontop hidden
WinGetString word, id
