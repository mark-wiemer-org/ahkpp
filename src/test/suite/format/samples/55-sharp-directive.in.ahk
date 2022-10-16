; [Issue #55](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/55)
#If WinActive(title)
s::
SoundBeep
return
#If
s::
MsgBox
return

#IfWinActive, ahk_exe notepad.exe ; Notepad
^w::WinClose
#IfWinActive, ahk_class#32770 ; Windows 10 Properties Panel
^w::WinClose
#IfWinActive, ahk_exe taskmgr.exe ; Windows Task Manager
^w::WinClose
#IfWinActive
^w::WinHide
