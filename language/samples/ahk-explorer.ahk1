; From https://github.com/FuPeiJiang/ahk_explorer/blob/tests/ahk_explorer.ahk
; Copyright 2021 FuPeiJiang, used with permission
; https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/pull/32#issuecomment-770233225

#NoEnv ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance, force
SendMode Input ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir% ; Ensures a consistent starting directory.
SetBatchLines, -1
#KeyHistory 0
ListLines Off

SetWinDelay, -1
SetControlDelay, -1

#MaxThreads, 20
#MaxThreadsPerHotkey, 4
SetTitleMatchMode, 2

currentDirSearch=
;%appdata%\ahk_explorer_settings
FileRead, favoriteFolders, %A_AppData%\ahk_explorer_settings\favoriteFolders.txt
favoriteFolders:=StrSplit(favoriteFolders,"`n","`r")
loadSettings()
;gsettings

FOLDERID_Downloads := "{374DE290-123F-4565-9164-39C4925E467B}"
RegRead, v, HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders, % FOLDERID_Downloads
VarSetCapacity(downloads, (261 + !A_IsUnicode) << !!A_IsUnicode)
DllCall("ExpandEnvironmentStrings", Str, v, Str, downloads, UInt, 260)
EcurrentDir1:=downloads
; EcurrentDir1=C:\Users\Public\AHK\notes\tests
; EcurrentDir1=C:\Users\Public\AHK\notes\tests\File Watcher
; EcurrentDir2=C:\Users\Public\AHK
; EcurrentDir1=C:\Users\Public\AHK\notes\tests\New Folder
EcurrentDir2=C:\Users\Public\AHK\notes\tests\New Folder 3
whichSide:=1

lastDir1:="C:"

for n, param in A_Args ; For each parameter:
{
fileExist:=fileExist(param)
if (fileExist) {
if (InStr(fileExist, "D")) {
EcurrentDir%whichSide%:=param

} else {
SplitPath, param, OutFileName, OutDir
EcurrentDir%whichSide%:=OutDir
toFocus:=OutFileName
;select file
}
}
else {
p("the folder or file you are trying to open doesn't exist`nyou were trying to open:`n" param)
}
break
}
;vars
watching1:=["control"]
watching2:=["control"]
maxRows:=50
rememberIconNumber:=0
lastInputSearchCurrentDir:=false
dirHistory1:=[]
dirHistory2:=[]
undoHistory1:=[]
undoHistory2:=[]
global DROPEFFECT_NONE	:= 0
global DROPEFFECT_COPY	:= 1
global DROPEFFECT_MOVE	:= 2
global DROPEFFECT_LINK	:= 4
calculatefileSizes:=1
calculateDates:=1
doIcons:=1
global dropEffectFormat := DllCall("RegisterClipboardFormat", "Str", CFSTR_PREFERREDDROPEFFECT := "Preferred DropEffect", "UInt")

Gui, main:New, +hwndthisHwnd
thisUniqueWintitle:="ahk_id " thisHwnd
Gui, main:Default
Gui,Font, s10, Segoe UI

Gui, +LastFound
hw_gui := WinExist()

Gui, Margin, 0, 0

folderListViewWidth:=250
favoritesListViewWidth:=130

listViewWidth:=500
favoritesLenght:=favoriteFolders.Length()

Gui, Add, Button, w%favoritesListViewWidth% ggsettings y212,settings
Gui, Add, ListView, r%favoritesLenght% w%favoritesListViewWidth% x0 y+0 nosort vfavoritesListView ggfavoritesListView AltSubmit ,Favorites

Gui, Add, ListView, r10 w%folderListViewWidth% y0 x+0 vfolderListView1_1 gfolderlistViewEvents1_1 AltSubmit ,Name
Gui, Add, ListView, r10 w%folderListViewWidth% x+0 y0 vfolderlistView2_1 gfolderlistViewEvents2_1 AltSubmit ,Name

Gui, Add, Edit, hwndEdithwnd1 r1 w%listViewWidth% y+0 x+-500 vvcurrentDirEdit1 gcurrentDirEdit1Changed, %EcurrentDir1%

Gui, Add, ListView, NoSort HwndListviewHwnd1 Count5000 r25 -WantF2 w%listViewWidth% -ReadOnly vvlistView1 glistViewEvents1 AltSubmit ,type|Name|Date|sortableDate|Size|sortableSize

Gui, Add, ListView, r10 w%folderListViewWidth% y0 x+0 vfolderListView1_2 gfolderlistViewEvents1_2 AltSubmit ,Name
Gui, Add, ListView, r10 w%folderListViewWidth% x+0 y0 vfolderlistView2_2 gfolderlistViewEvents2_2 AltSubmit ,Name
Gui, Add, Edit, hwndEdithwnd2 r1 w%listViewWidth% y+0 x+-500 vvcurrentDirEdit2 gcurrentDirEdit2Changed, %EcurrentDir2%
Gui, Add, ListView, NoSort HwndListviewHwnd2 Count5000 r25 -WantF2 w%listViewWidth% -ReadOnly vvlistView2 glistViewEvents2 AltSubmit ,type|Name|Date|sortableDate|Size|sortableSize

OnMessage(0x4A, "WM_COPYDATA_READ")

OnMessage(0x111, "HandleMessage" )
loop 2 {
Gui, ListView, vlistView%A_Index%
LV_Colors.OnMessage()
LV_Colors.Attach(ListviewHwnd%A_Index%, 1, 0)

LV_ModifyCol(1,20)
LV_ModifyCol(2,300)
LV_ModifyCol(3,"50 Right")
LV_ModifyCol(5,"80 Right")

LV_ModifyCol(2, "Logical")
LV_ModifyCol(6,"Integer")

LV_ModifyCol(4,0) ; hides 3rd row
LV_ModifyCol(6,0) ; hides 3rd row
focused=flistView
ImageListID%A_Index% := IL_Create(50)
LV_SetImageList(ImageListID%A_Index%) ;desactivated this to test
}

Gui, Show,,ahk_explorer
Gui, ListView, favoritesListView
favoriteFoldersNames:=[]
for k, v in favoriteFolders {
SplitPath, v, OutFileName
favoriteFoldersNames.Push(OutFileName)
LV_Add(, OutFileName)
}

renderCurrentDir()
run, "lib\FolderWatcher2.ahk",,,PID_FolderWatcher2

IServiceProvider := ComObjCreate("{C2F03A33-21F5-47FA-B4BB-156362A2F239}", "{6D5140C1-7436-11CE-8034-00AA006009FA}")
IVirtualDesktopManagerInternal := ComObjQuery(IServiceProvider, "{C5E0CDCA-7B6E-41B2-9FC4-D93975CC467B}", "{F31574D6-B682-4CDC-BD56-1827860ABEC6}")
MoveViewToDesktop := vtable(IVirtualDesktopManagerInternal, 4) ; void MoveViewToDesktop(object pView, IVirtualDesktop desktop);
GetCurrentDesktop := vtable(IVirtualDesktopManagerInternal, 6) ; IVirtualDesktop GetCurrentDesktop();
ImmersiveShell := ComObjCreate("{C2F03A33-21F5-47FA-B4BB-156362A2F239}", "{00000000-0000-0000-C000-000000000046}")

if !(IApplicationViewCollection := ComObjQuery(ImmersiveShell,"{1841C6D7-4F9D-42C0-AF41-8747538F10E5}","{1841C6D7-4F9D-42C0-AF41-8747538F10E5}" ) ) ; 1607-1809
{
MsgBox IApplicationViewCollection interface not supported.
}
GetViewForHwnd							:= vtable(IApplicationViewCollection, 6) ; (IntPtr hwnd, out IApplicationView view);

return

; f3::
Process, Close, %PID_getFolderSizes%
Exitapp
return

;labels
gsaveSettings:
gui, settingsGui:Default
gui, submit
FileRecycle, %A_AppData%\ahk_explorer_settings\settings.txt
FileAppend, %vsettings%, *%A_AppData%\ahk_explorer_settings\settings.txt
loadSettings()
return

gsettings:
Gui, settingsGui:Default
FileRead, settingsTxt, %A_AppData%\ahk_explorer_settings\settings.txt
if (!settingsGuiCreated)
{
settingsGuiCreated:=true
editSize:=[1000, 200]
textSize:=[190, editSize[2]]
editPos:=[textSize[1]+30, 50]
textPos:=[10, ZTrim(editPos[2]+1.5) ]
guiSize:=[editSize[1]+textSize[1]+20, editPos[2]+editSize[2]+10]
guiPos:=[A_ScreenWidth/2-guiSize[1]/2,A_ScreenHeight/2-guiSize[2]/2]
Gui,Font,s12 w500 q5, Consolas

Gui, add, button, ggsaveSettings,Save Settings
Gui,add,Text, % "x" textPos[1] " y" textPos[2] " w" textSize[1] " h" textSize[2], peazipPath`nvscodePath`nBGColorOfSelectedPane`nAhk2ExePath`nspekPath
Gui,add,Edit, % "x" editPos[1] " y" editPos[2] " w" editSize[1] " h" editSize[2] " vvsettings -wrap",%settingsTxt%
} else {
Guicontrol, text, vsettings,%settingsTxt%
}
Gui,show, % "x" guiPos[1] " y" guiPos[2] " w" guiSize[1] " h" guiSize[2] ,set_settings_GUI
return

gChangeDrive:
index:=SubStr(A_GuiControl, 0)
EcurrentDir%whichSide%:=drives[index] ":"
renderCurrentDir()
return
multiRenameGuiGuiClose:
Gui, Destroy
return
gmultiRenameApply:
multiRenameNames:=getMultiRenameNames()
multiRenameNamesBak:=multiRenameNames.Clone()
namesToMultiRenameBak:=namesToMultiRename.Clone()

for k, v in multiRenameNamesBak {
toRenamePath := multiRenameDir "\" namesToMultiRenameBak[k]
renamedPath := multiRenameDir "\" v

renamedPathExists:=fileExist(renamedPath)
if (renamedPathExists) {
p("name already taken", renamedPathExists)
break
}
toRenameExists:=fileExist(toRenamePath)
if (toRenameExists) {
if (InStr(toRenameExists, "D")) {
FileMoveDir, %toRenamePath%, %renamedPath%
} else {
FileMove, %toRenamePath%, %renamedPath%
}
if ErrorLevel {
p("file", toRenamePath "could not be renamed to", renamedPath)
break
}
namesToMultiRename.RemoveAt(1)
multiRenameNames.RemoveAt(1)
} else {
p("file to rename:", toRenamePath, "doesn't exist anymore")
break
}
}
multiRenamelength:=namesToMultiRename.Length()
if (multiRenamelength) {
Guicontrol, text, vmultiRenameTargets, % "|" array_ToVerticleBarString(namesToMultiRename)
Guicontrol, text, vmultiRenamePreview, % "|" array_ToVerticleBarString(multiRenameNames)
} else {
Gui, Destroy
setWhichSideFromDir(multiRenameDir)
renderCurrentDir() ;refresh
}
return
gmultiRenamePreview:
Guicontrol, text, vmultiRenamePreview, % "|" array_ToVerticleBarString(getMultiRenameNames())
return
RemoveToolTip:
ToolTip
return
TypingInRenameSimple:
Gui,Submit,NoHide

Size:=10
Gui,Fake:Font,s%Size%,Segoe UI
Gui,Fake:Add,Text, -Wrap vDummy,% RenamingSimple
GuiControlGet,Pos,Fake:Pos,Dummy
Gui,Fake:Destroy

if (posw+ 2 * Size>renameTextWidthLimit) {
renameTextWidthLimit:=(posw+ 2 * Size) + (8 * Size)
width:=renameTextWidthLimit
GuiControl Move,RenamingSimple, W%width%
Guiwidth:=width+2
Gui, Show, W%Guiwidth%
}
if (!firstRename) {
firstRename:=true
SplitPath, TextBeingRenamed,, , , OutNameNoExt
SendMessage,0xB1, 0, 0, , ahk_id %RenameHwnd%
fileExist:=fileExist(EcurrentDir%whichSide% "\" TextBeingRenamed)
if (InStr(fileExist, "D"))
SendMessage, 0xB1,0,% StrLen(TextBeingRenamed),, ahk_id %RenameHwnd% ;select all
else
SendMessage, 0xB1,0,% StrLen(OutNameNoExt),, ahk_id %RenameHwnd%
} else {
ControlGet, Outvar ,CurrentCol,, Edit1
Outvar -=1
Postmessage,0xB1, 0, 0, Edit1 ;move caret to front to pan
Postmessage,0xB1,%Outvar%,%Outvar%, Edit1 ;move caret back to end

}
return
;renameLabel
grenameFileLabel:
fromButton:=true
renameFileLabel:
if (canRename) {
gui, renameSimple:Default
gui, submit
gui, main:Default
noRenameError:=true

if not(TextBeingRenamed==RenamingSimple) { ;Case Sensitive
if (stuffByName[RenamingSimple].Count()) {
noRenameError:=false
p("file with same name")
} else {
SourcePath:=EcurrentDir%whichSide% "\" TextBeingRenamed
fileExist:=FileExist(SourcePath)
if (fileExist) {
DestPath:=EcurrentDir%whichSide% "\" RenamingSimple

if (TextBeingRenamed=RenamingSimple) { ;only different capitalization
randomPath:=generateRandomUniqueName(SourcePath,isDir)

if (isDir) {
FileMoveDir, %SourcePath%, %randomPath%
} else {
FileMove, %SourcePath%, %randomPath%
}
if ErrorLevel {
noRenameError:=false
p("file could not be renamed:illegal name or file in use")
}
SoundPlay, *-1

SourcePath:=randomPath
}

if (InStr(fileExist, "D")) {
FileMoveDir, %SourcePath%, %DestPath%
} else {
; p("FileMove")
FileMove, %SourcePath%, %DestPath%
}
if ErrorLevel {
noRenameError:=false
p("file could not be renamed:illegal name or file in use")
}
SoundPlay, *-1
}
}
}
if (noRenameError)
{
canRename:=false
gui, renameSimple:Default
gui, destroy

gui, main:Default
if (fromButton) {
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
}
} else {
gui, main:Default

gui, show

gui, renameSimple:Default
gui, show,,renamingWinTitle
}
fromButton:=false
}
return

mainGuiClose:
if GetKeyState("Shift") {
Process, Close, %PID_getFolderSizes%
Process, Close, %PID_FolderWatcher2%
Exitapp
} else {
Process, Close, %PID_getFolderSizes%
windowHidden:=true
Gui, main:Default
Gui, hide
}
return

couldNotCreateFolder()
{
global
Gui, createFolder:Default
creatingNewFolder:=true
dontSearch:=true
ControlSetText,, %createFolderName%, ahk_id %folderCreationHwnd%
SendMessage, 0xB1, 0, -1,, % "ahk_id " folderCreationHwnd
gui, createFolder: show,, create_folder
dontSearch:=false
}
;new folder
;create folder
createLabel:
gui, createFolder: submit
toCreate:=EcurrentDir%whichSide% "\" createFolderName
if (!fileExist(toCreate)) {
FileCreateDir, %toCreate%
if (ErrorLevel) {
SoundPlay, *16
p("Could not create Folder, illegal name or idk")
couldNotCreateFolder()
} else {
Gui, main:Default
SoundPlay, *-1
}
} else {
SoundPlay, *16
p("folder already exists")
couldNotCreateFolder()
}
return

createAndOpenLabel:
gui, createFolder: submit
toCreate:=EcurrentDir%whichSide% "\" createFolderName
if (!fileExist(toCreate)) {
FileCreateDir, %toCreate%
if (ErrorLevel) {
SoundPlay, *16
p("Could not create Folder, illegal name or idk")
couldNotCreateFolder()
} else {
EcurrentDir%whichSide%:=toCreate
Gui, main:Default
renderCurrentDir()
SoundPlay, *-1
}
} else {
SoundPlay, *16
p("folder already exists")
couldNotCreateFolder()
}
return

gfavoritesListView:
if (A_GuiEvent = "DoubleClick") {
Gui, ListView, favoritesListView
doubleClickedFolderOrFile(favoriteFolders[A_EventInfo])
} else if (A_GuiEvent="ColClick") {
path=%A_AppData%\ahk_explorer_settings\favoriteFolders.txt
toRun:= """" vscodePath """ """ path """"
run, %toRun%
}
return

folderlistViewEvents1_1:
folderlistViewEvents2_1:
folderlistViewEvents1_2:
folderlistViewEvents2_2:
whichSide:=SubStr(A_GuiControl, 0)
num:=SubStr(A_GuiControl, 15, 1)
whichParent:=(num=1) ? 2 : 1
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"

if (A_GuiEvent="ColClick")
{
EcurrentDir%whichSide%:=parent%whichParent%Dir%whichSide%
renderCurrentDir()
} else if (A_GuiEvent = "DoubleClick") {
EcurrentDir%whichSide%:=parent%whichParent%DirDirs%whichSide%[A_EventInfo]
renderCurrentDir()
}
return
currentDirEdit1Changed:
currentDirEdit2Changed:
SetTimer, currentDirEdit1ChangedTimer, -0
return
currentDirEdit1ChangedTimer:
Gui, main:Default
gui, submit, nohide
if (focused="searchCurrentDirEdit")
{
if (vcurrentDirEdit%whichSide%!=lastEditText)
lastEditText:=vcurrentDirEdit%whichSide%
if (!submittingGui) {
searchString%whichSide%:=vcurrentDirEdit%whichSide%
searchInCurrentDir()
} else {
p(6456)
queueSubmitGui:=true
}
}
return
listViewEvents1:
listViewEvents2:
; whichSide:=SubStr(A_GuiControl, 0)
if (A_GuiEvent=="D") {
selectedPaths:=getSelectedPaths()

if (GetKeyState("Alt")) {
FileToClipboard(selectedPaths, "cut")
} else {
FileToClipboard(selectedPaths)
}

Cursors := []
Cursors[1] := DllCall("LoadCursor", "Ptr", 0, "Ptr", 32515, "UPtr") ; DROPEFFECT_COPY = IDC_CROSS
Cursors[2] := DllCall("LoadCursor", "Ptr", 0, "Ptr", 32516, "UPtr") ; DROPEFFECT_MOVE = IDC_UPARROW
Cursors[3] := DllCall("LoadCursor", "Ptr", 0, "Ptr", 32648, "UPtr") ; Copy or Move = IDC_NO
DoDragDrop(Cursors)
}
else if (A_GuiEvent=="F") {
whichSide:=SubStr(A_GuiControl, 0)
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"

If (ICELV%whichSide%["Changed"]) {
Msg := ""
p(ICELV%whichSide%.Changed["Txt"])
ICELV%whichSide%.Remove("Changed")
}
}
else if (A_GuiEvent=="e") {
whichSide:=SubStr(A_GuiControl, 0)
focused:="flistView"
LV_GetText(OutputVar,A_EventInfo,2)

for k, v in stuffByName
{
if (v=renaming) {
SourcePath:=filePaths[k]
DestPath:=EcurrentDir%whichSide% "\" OutputVar
stuffByName[k]:=OutputVar
filePaths[k]:=DestPath
fileExist:=FileExist(SourcePath)
if (fileExist) {
if (InStr(fileExist, "D")) {
FileMoveDir, %SourcePath%, %DestPath%
} else {
FileMove, %SourcePath%, %DestPath%
}
}
}
}
} else if (A_GuiEvent=="E") {
focused:="renaming"
LV_GetText(OutputVar,A_EventInfo,2)
renaming:=OutputVar
SplitPath, OutputVar, , , OutExtension, OutNameNoExt
if (OutNameNoExt) {
Postmessage,0xB1, 0, % StrLen(OutNameNoExt), Edit2
} else {
Postmessage,0xB1, 1, % StrLen(OutExtension)+1, Edit2
}
} else if (A_GuiEvent = "DoubleClick")
{
if (!canRename)
doubleClickedNormal(A_EventInfo)
}
else if (A_GuiEvent=="K") ;key pressed
{
if (!dontSearch) {
whichSide:=SubStr(A_GuiControl, 0)
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
Gui, ListView, vlistView%whichSide%

key := GetKeyName(Format("vk{:x}", A_EventInfo))
if (key="Backspace")
{
}
else if (key="f2") {
canRename:=true
; focused:="renaming"
firstRename:=false
fromButton:=false
renameTextWidthLimit:=200

row:=LV_GetNext("")
LV_GetText(TextBeingRenamed, row, 2)
ICELV%whichSide%.EditCell(row, 2)
sleep, 25
WinGetPos, xpos, ypos,,,% ahk_explorer ahk_class AutoHotkeyGUI
if (whichSide=1)
xpos+=161
else
xpos+=161+listViewWidth

ypos+=A_CaretY - 5
Gui, renameSimple:Default
Gui,Font, s10, Segoe UI
Gui, Margin , 0,0,0,0
gui, add, edit,y2 r1 w%renameTextWidthLimit% -wrap gTypingInRenameSimple vRenamingSimple hwndRenameHwnd, %TextBeingRenamed%
Gui, Add, Button, Hidden Default ggrenameFileLabel

gui, show, X%xpos% Y%ypos% h0,renamingWinTitle
WinSet, Style, -0xC00000,a ; remove the titlebar and border(s)

gosub, TypingInRenameSimple

return
sleep, 500

LV_GetText(OutputVar,A_EventInfo,2)
SplitPath, OutputVar, , , OutExtension, OutNameNoExt
if (OutNameNoExt) {
Postmessage,0xB1, 0, % StrLen(OutNameNoExt), Edit2
} else {
Postmessage,0xB1, 1, % StrLen(OutExtension)+1, Edit2
}
}
else if (key="Lwin") {

}
else if (key="NumpadRight") {

}
else if (key="NumpadLeft") {

}
else if (key="NumpadUp") {

}
else if (key="NumpadDown") {

}
else if (key="Alt") {

}
else if (key="Control") {

}
else if (key="Shift") {

} else if (key="F1") {
send, {f1}
} else if (key="F3") {
send, {f3}
} else if (key="F4") {
; send, {f4}
}
else if (key="\") {
}
else if (key="NumpadEnd") {
}
else if (key="Numpad0") {
}
else if (key="NumpadHome") {
}
else if (key="NumpadPgDn") {
}
else if (key="NumpadPgUp") {
}
else if (key="]") {
}
else if (key="NumpadDel") {

selectedNames:=getSelectedNames()

for k, v in getSelectedNames() {
finalStr:="""" A_AhkPath """ ""lib\fileRecycle_one.ahk"" """ EcurrentDir%whichSide% "\" v """"
run, %finalStr%
}

return
} else {
if (focused!="searchCurrentDirEdit")
{
ShiftIsDown := GetKeyState("Shift")
CtrlIsDown := GetKeyState("Ctrl")

if (CtrlIsDown and !ShiftIsDown) {
if (key="c") {
selectedPaths:=getSelectedPaths()
FileToClipboard(selectedPaths)
SoundPlay, *-1
}
else if (key="x") {
selectedPaths:=getSelectedPaths()
FileToClipboard(selectedPaths, "cut")
SoundPlay, *-1
} else if (key="v")
{
pasteFile()

} else if (key="a") {
loop % LV_GetCount()
{
LV_Modify(A_Index, "+Select") ; select
}
} else if (key="h") {

}
return
} else if (ShiftIsDown and !CtrlIsDown) {
if (key="F10") {
selectedNames:=getSelectedNames()
ShellContextMenu(EcurrentDir%whichSide%,selectedNames)
}
} else if (CtrlIsDown and ShiftIsDown) {
if (key="x") {
for k, v in getSelectedNames() ;extract using 7zip, 7-zip
{
SplitPath, v,,,, OutNameNoExt
runwait, % "lib\7z x """ EcurrentDir%whichSide% "\" v """ -o""" EcurrentDir%whichSide% "\" OutNameNoExt """ -spe",,Hide
; runwait, """" peazipPath """ -ext2folder """ EcurrentDir%whichSide% "\" v """"
}
soundplay, *-1
EcurrentDir%whichSide%:=EcurrentDir%whichSide% "\" OutNameNoExt
renderCurrentDir()
return
} else if (key="d") {
files:=array_ToSpacedString(getSelectedPaths())
runwait, "%peazipPath%" -add2archive %files%
soundplay, *-1
renderCurrentDir() ;refresh
return
} else if (key="v") {
if (DllCall("IsClipboardFormatAvailable", "UInt", CF_HDROP := 15)) { ; file being copied
if (DllCall("IsClipboardFormatAvailable", "UInt", dropEffectFormat)) {
if (DllCall("OpenClipboard", "Ptr", A_ScriptHwnd)) {
if (data := DllCall("GetClipboardData", "UInt", dropEffectFormat, "Ptr")) {
if (effect := DllCall("GlobalLock", "Ptr", data, "UInt*")) {
if (effect & DROPEFFECT_COPY) {
files:=StrSplit(clipboard, "`n","`r")
for k, v in files {
fileExist:=FileExist(v)
if (fileExist) {
SplitPath, v , OutFileName
dest:=EcurrentDir%whichSide%
Run, TeraCopy.exe Copy "%v%" "%dest%"
}
}
; renderCurrentDir()
SoundPlay, *-1
}
; action:="copy"
else if (effect & DROPEFFECT_MOVE) {
p("no move")
}
; action:="move"
DllCall("GlobalUnlock", "Ptr", data)
}
}
DllCall("CloseClipboard")
}
}
}
return

}
}
if (CtrlIsDown or ShiftIsDown)
return

focused=searchCurrentDirEdit
GuiControl, Focus, vcurrentDirEdit%whichSide%
GuiControl, Text, vcurrentDirEdit%whichSide%,% searchString%whichSide% key
SendMessage, 0xB1, -2, -1,, % "ahk_id " Edithwnd%whichSide%
}
}
}
}
else if (A_GuiEvent="RightClick") {
selectedNames:=getSelectedNames()
ShellContextMenu(EcurrentDir%whichSide%,selectedNames)
}
else if (A_GuiEvent="ColClick")
{
whichSide:=SubStr(A_GuiControl, 0)

columnsToSort:=[1,2,4,6]
if (A_EventInfo=1) {
if (!foldersFirst)
{
foldersFirst:=true
sortColumn(1, "SortDesc")
} else {
foldersFirst:=false
sortColumn(1, "Sort")
}
} else if (A_EventInfo=2) {
if (!A_ZSort%whichSide%)
{
A_ZSort%whichSide%:=true
sortColumn(2, "Sort")
} else {
A_ZSort%whichSide%:=false
sortColumn(2, "SortDesc")
}
} else if (A_EventInfo=3) {
if (!oldNew%whichSide%)
{
whichsort%whichSide%:="oldNew"
oldNew%whichSide%:=true
renderFunctionsToSort(sortedByDate%whichSide%, true)
} else {
whichsort%whichSide%:="newOld"
oldNew%whichSide%:=false
renderFunctionsToSort(sortedByDate%whichSide%)
}
} else if (A_EventInfo=5) {
if (canSortBySize%whichSide%) {
if (!bigSmall%whichSide%)
{
whichsort%whichSide%:="bigSmall"
bigSmall%whichSide%:=true
renderFunctionsToSort(sortedBySize%whichSide%)
} else {
whichsort%whichSide%:="smallBig"
bigSmall%whichSide%:=false
renderFunctionsToSort(sortedBySize%whichSide%, true)
}
}
}
}

return
;includes
#include <Class_LV_InCellEdit>
#include <cMsgbox>
;Classes
; ======================================================================================================================
; Namespace:      LV_Colors
; Function:       Helper object and functions for ListView row and cell coloring
; Testted with:   AHK 1.1.15.04 (A32/U32/U64)
; Tested on:      Win 8.1 (x64)
; Changelog:
;     0.5.00.00/2014-08-13/just me - changed 'static mode' handling
;     0.4.01.00/2013-12-30/just me - minor bug fix
;     0.4.00.00/2013-12-30/just me - added static mode
;     0.3.00.00/2013-06-15/just me - added "Critical, 100" to avoid drawing issues
;     0.2.00.00/2013-01-12/just me - bugfixes and minor changes
;     0.1.00.00/2012-10-27/just me - initial release
; ======================================================================================================================
; CLASS LV_Colors
;
; The class provides seven public methods to register / unregister coloring for ListView controls, to set individual
; colors for rows and/or cells, to prevent/allow sorting and rezising dynamically, and to register / unregister the
; included message handler function for WM_NOTIFY -> NM_CUSTOMDRAW messages.
;
; If you want to use the included message handler you must call LV_Colors.OnMessage() once.
; Otherwise you should integrate the code within LV_Colors_WM_NOTIFY into your own notification handler.
; Without notification handling coloring won't work.
; ======================================================================================================================
Class LV_Colors {
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; PRIVATE PROPERTIES ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Static MessageHandler := "LV_Colors_WM_NOTIFY"
Static WM_NOTIFY := 0x4E
Static SubclassProc := RegisterCallback("LV_Colors_SubclassProc")
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; PUBLIC PROPERTIES  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; Static Critical := 0
Static Critical := 100
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; META FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
__New(P*) {
Return False ; There is no reason to instantiate this class!
}
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; PRIVATE METHODS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
On_NM_CUSTOMDRAW(H, L) {
Static CDDS_PREPAINT := 0x00000001
Static CDDS_ITEMPREPAINT := 0x00010001
Static CDDS_SUBITEMPREPAINT := 0x00030001
Static CDRF_DODEFAULT := 0x00000000
Static CDRF_NEWFONT := 0x00000002
Static CDRF_NOTIFYITEMDRAW := 0x00000020
Static CDRF_NOTIFYSUBITEMDRAW := 0x00000020
Static CLRDEFAULT := 0xFF000000
; Size off NMHDR structure
Static NMHDRSize := (2 * A_PtrSize) + 4 + (A_PtrSize - 4)
; Offset of dwItemSpec (NMCUSTOMDRAW)
Static ItemSpecP := NMHDRSize + (5 * 4) + A_PtrSize + (A_PtrSize - 4)
; Size of NMCUSTOMDRAW structure
Static NCDSize := NMHDRSize + (6 * 4) + (3 * A_PtrSize) + (2 * (A_PtrSize - 4))
; Offset of clrText (NMLVCUSTOMDRAW)
Static ClrTxP := NCDSize
; Offset of clrTextBk (NMLVCUSTOMDRAW)
Static ClrTxBkP := ClrTxP + 4
; Offset of iSubItem (NMLVCUSTOMDRAW)
Static SubItemP := ClrTxBkP + 4
; Offset of clrFace (NMLVCUSTOMDRAW)
Static ClrBkP := SubItemP + 8
DrawStage := NumGet(L + NMHDRSize, 0, "UInt")
, Row := NumGet(L + ItemSpecP, 0, "UPtr") + 1
, Col := NumGet(L + SubItemP, 0, "Int") + 1
If This[H].IsStatic
Row := This.MapIndexToID(H, Row)
; SubItemPrepaint ------------------------------------------------------------------------------------------------
If (DrawStage = CDDS_SUBITEMPREPAINT) {
NumPut(This[H].CurTX, L + ClrTxP, 0, "UInt"), NumPut(This[H].CurTB, L + ClrTxBkP, 0, "UInt")
, NumPut(This[H].CurBK, L + ClrBkP, 0, "UInt")
ClrTx := This[H].Cells[Row][Col].T, ClrBk := This[H].Cells[Row][Col].B
If (ClrTx <> "")
NumPut(ClrTX, L + ClrTxP, 0, "UInt")
If (ClrBk <> "")
NumPut(ClrBk, L + ClrTxBkP, 0, "UInt"), NumPut(ClrBk, L + ClrBkP, 0, "UInt")
If (Col > This[H].Cells[Row].MaxIndex()) && !This[H].HasKey(Row)
Return CDRF_DODEFAULT
Return CDRF_NOTIFYSUBITEMDRAW
}
; ItemPrepaint ---------------------------------------------------------------------------------------------------
If (DrawStage = CDDS_ITEMPREPAINT) {
This[H].CurTX := This[H].TX, This[H].CurTB := This[H].TB, This[H].CurBK := This[H].BK
ClrTx := ClrBk := ""
If This[H].Rows.HasKey(Row)
ClrTx := This[H].Rows[Row].T, ClrBk := This[H].Rows[Row].B
If (ClrTx <> "")
NumPut(ClrTx, L + ClrTxP, 0, "UInt"), This[H].CurTX := ClrTx
If (ClrBk <> "")
NumPut(ClrBk, L + ClrTxBkP, 0, "UInt") , NumPut(ClrBk, L + ClrBkP, 0, "UInt")
, This[H].CurTB := ClrBk, This[H].CurBk := ClrBk
If This[H].Cells.HasKey(Row)
Return CDRF_NOTIFYSUBITEMDRAW
Return CDRF_DODEFAULT
}
; Prepaint -------------------------------------------------------------------------------------------------------
If (DrawStage = CDDS_PREPAINT) {
Return CDRF_NOTIFYITEMDRAW
}
; Others ---------------------------------------------------------------------------------------------------------
Return CDRF_DODEFAULT
}
; -------------------------------------------------------------------------------------------------------------------
MapIndexToID(HWND, Row) {
; LVM_MAPINDEXTOID = 0x10B4 -> http://msdn.microsoft.com/en-us/library/bb761139(v=vs.85).aspx
SendMessage, 0x10B4, % (Row - 1), 0, , % "ahk_id " . HWND
Return ErrorLevel
}
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; PUBLIC METHODS ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
; ===================================================================================================================
; Attach()        Register ListView control for coloring
; Parameters:     HWND        -  ListView's HWND.
;                 Optional ------------------------------------------------------------------------------------------
;                 StaticMode  -  Static color assignment, i.e. the colors will be assigned permanently to a row
;                                rather than to a row number.
;                                Values:  True / False
;                                Default: False
;                 NoSort      -  Prevent sorting by click on a header item.
;                                Values:  True / False
;                                Default: True
;                 NoSizing    -  Prevent resizing of columns.
;                                Values:  True / False
;                                Default: True
; Return Values:  True on success, otherwise false.
; ===================================================================================================================
Attach(HWND, StaticMode := False, NoSort := True, NoSizing := True) {
Static LVM_GETBKCOLOR := 0x1000
Static LVM_GETHEADER := 0x101F
Static LVM_GETTEXTBKCOLOR := 0x1025
Static LVM_GETTEXTCOLOR := 0x1023
Static LVM_SETEXTENDEDLISTVIEWSTYLE := 0x1036
Static LVS_EX_DOUBLEBUFFER := 0x00010000
If !DllCall("User32.dll\IsWindow", "Ptr", HWND, "UInt")
Return False
If This.HasKey(HWND)
Return False
; Set LVS_EX_DOUBLEBUFFER style to avoid drawing issues, if it isn't set as yet.
SendMessage, % LVM_SETEXTENDEDLISTVIEWSTYLE, % LVS_EX_DOUBLEBUFFER, % LVS_EX_DOUBLEBUFFER, , % "ahk_id " . HWND
If (ErrorLevel = "FAIL")
Return False
; Get the default colors
SendMessage, % LVM_GETBKCOLOR, 0, 0, , % "ahk_id " . HWND
BkClr := ErrorLevel
SendMessage, % LVM_GETTEXTBKCOLOR, 0, 0, , % "ahk_id " . HWND
TBClr := ErrorLevel
SendMessage, % LVM_GETTEXTCOLOR, 0, 0, , % "ahk_id " . HWND
TxClr := ErrorLevel
; Get the header control
SendMessage, % LVM_GETHEADER, 0, 0, , % "ahk_id " . HWND
Header := ErrorLevel
; Store the values in a new object
This[HWND] := {BK: BkClr, TB: TBClr, TX: TxClr, Header: Header, IsStatic: !!StaticMode}
If (NoSort)
This.NoSort(HWND)
If (NoSizing)
This.NoSizing(HWND)
Return True
}
; ===================================================================================================================
; Detach()        Unregister ListView control
; Parameters:     HWND        -  ListView's HWND
; Return Value:   Always True
; ===================================================================================================================
Detach(HWND) {
; Remove the subclass, if any
Static LVM_GETITEMCOUNT := 0x1004
If (This[HWND].SC)
DllCall("Comctl32.dll\RemoveWindowSubclass", "Ptr", HWND, "Ptr", This.SubclassProc, "Ptr", HWND)
This.Remove(HWND, "")
WinSet, Redraw, , % "ahk_id " . HWND
Return True
}
; ===================================================================================================================
; Row()           Set background and/or text color for the specified row
; Parameters:     HWND        -  ListView's HWND
;                 Row         -  Row number
;                 Optional ------------------------------------------------------------------------------------------
;                 BkColor     -  Background color as RGB color integer (e.g. 0xFF0000 = red)
;                                Default: Empty -> default background color
;                 TxColor     -  Text color as RGB color integer (e.g. 0xFF0000 = red)
;                                Default: Empty -> default text color
; Return Value:   True on success, otherwise false.
; ===================================================================================================================
Row(HWND, Row, BkColor := "", TxColor := "") {
If !This.HasKey(HWND)
Return False
If This[HWND].IsStatic
Row := This.MapIndexToID(HWND, Row)
If (BkColor = "") && (TxColor = "") {
This[HWND].Rows.Remove(Row, "")
Return True
}
BkBGR := TxBGR := ""
If BkColor Is Integer
BkBGR := ((BkColor & 0xFF0000) >> 16) | (BkColor & 0x00FF00) | ((BkColor & 0x0000FF) << 16)
If TxColor Is Integer
TxBGR := ((TxColor & 0xFF0000) >> 16) | (TxColor & 0x00FF00) | ((TxColor & 0x0000FF) << 16)
If (BkBGR = "") && (TxBGR = "")
Return False
If !This[HWND].HasKey("Rows")
This[HWND].Rows := {}
If !This[HWND].Rows.HasKey(Row)
This[HWND].Rows[Row] := {}
If (BkBGR <> "")
This[HWND].Rows[Row].Insert("B", BkBGR)
If (TxBGR <> "")
This[HWND].Rows[Row].Insert("T", TxBGR)
Return True
}
; ===================================================================================================================
; Cell()          Set background and/or text color for the specified cell
; Parameters:     HWND        -  ListView's HWND
;                 Row         -  Row number
;                 Col         -  Column number
;                 Optional ------------------------------------------------------------------------------------------
;                 BkColor     -  Background color as RGB color integer (e.g. 0xFF0000 = red)
;                                Default: Empty -> default background color
;                 TxColor     -  Text color as RGB color integer (e.g. 0xFF0000 = red)
;                                Default: Empty -> default text color
; Return Value:   True on success, otherwise false.
; ===================================================================================================================
Cell(HWND, Row, Col, BkColor := "", TxColor := "") {
If !This.HasKey(HWND)
Return False
If This[HWND].IsStatic
Row := This.MapIndexToID(HWND, Row)
If (BkColor = "") && (TxColor = "") {
This[HWND].Cells.Remove(Row, "")
Return True
}
BkBGR := TxBGR := ""
If BkColor Is Integer
BkBGR := ((BkColor & 0xFF0000) >> 16) | (BkColor & 0x00FF00) | ((BkColor & 0x0000FF) << 16)
If TxColor Is Integer
TxBGR := ((TxColor & 0xFF0000) >> 16) | (TxColor & 0x00FF00) | ((TxColor & 0x0000FF) << 16)
If (BkBGR = "") && (TxBGR = "")
Return False
If !This[HWND].HasKey("Cells")
This[HWND].Cells := {}
If !This[HWND].Cells.HasKey(Row)
This[HWND].Cells[Row] := {}
This[HWND].Cells[Row, Col] := {}
If (BkBGR <> "")
This[HWND].Cells[Row, Col].Insert("B", BkBGR)
If (TxBGR <> "")
This[HWND].Cells[Row, Col].Insert("T", TxBGR)
Return True
}
; ===================================================================================================================
; NoSort()        Prevent / allow sorting by click on a header item dynamically.
; Parameters:     HWND        -  ListView's HWND
;                 Optional ------------------------------------------------------------------------------------------
;                 Apply       -  True / False
;                                Default: True
; Return Value:   True on success, otherwise false.
; ===================================================================================================================
NoSort(HWND, Apply := True) {
Static HDM_GETITEMCOUNT := 0x1200
If !This.HasKey(HWND)
Return False
If (Apply)
This[HWND].NS := True
Else
This[HWND].Remove("NS")
Return True
}
; ===================================================================================================================
; NoSizing()      Prevent / allow resizing of columns dynamically.
; Parameters:     HWND        -  ListView's HWND
;                 Optional ------------------------------------------------------------------------------------------
;                 Apply       -  True / False
;                                Default: True
; Return Value:   True on success, otherwise false.
; ===================================================================================================================
NoSizing(HWND, Apply := True) {
Static OSVersion := DllCall("Kernel32.dll\GetVersion", "UChar")
Static HDS_NOSIZING := 0x0800
If !This.HasKey(HWND)
Return False
HHEADER := This[HWND].Header
If (Apply) {
If (OSVersion < 6) {
If !(This[HWND].SC) {
DllCall("Comctl32.dll\SetWindowSubclass", "Ptr", HWND, "Ptr", This.SubclassProc, "Ptr", HWND, "Ptr", 0)
This[HWND].SC := True
} Else {
Return True
}
} Else {
Control, Style, +%HDS_NOSIZING%, , ahk_id %HHEADER%
}
} Else {
If (OSVersion < 6) {
If (This[HWND].SC) {
DllCall("Comctl32.dll\RemoveWindowSubclass", "Ptr", HWND, "Ptr", This.SubclassProc, "Ptr", HWND)
This[HWND].Remove("SC")
} Else {
Return True
}
} Else {
Control, Style, -%HDS_NOSIZING%, , ahk_id %HHEADER%
}
}
Return True
}
; ===================================================================================================================
; OnMessage()     Register / unregister LV_Colors message handler for WM_NOTIFY -> NM_CUSTOMDRAW messages
; Parameters:     Apply       -  True / False
;                                Default: True
; Return Value:   Always True
; ===================================================================================================================
OnMessage(Apply := True) {
If (Apply)
OnMessage(This.WM_NOTIFY, This.MessageHandler)
Else If (This.MessageHandler = OnMessage(This.WM_NOTIFY))
OnMessage(This.WM_NOTIFY, "")
Return True
}
}
; ======================================================================================================================
; PRIVATE FUNCTION LV_Colors_WM_NOTIFY() - message handler for WM_NOTIFY -> NM_CUSTOMDRAW notifications
; ======================================================================================================================
LV_Colors_WM_NOTIFY(W, L) {
Static NM_CUSTOMDRAW := -12
Static LVN_COLUMNCLICK := -108
Critical, % LV_Colors.Critical
If LV_Colors.HasKey(H := NumGet(L + 0, 0, "UPtr")) {
M := NumGet(L + (A_PtrSize * 2), 0, "Int")
; NM_CUSTOMDRAW --------------------------------------------------------------------------------------------------
If (M = NM_CUSTOMDRAW)
Return LV_Colors.On_NM_CUSTOMDRAW(H, L)
; LVN_COLUMNCLICK ------------------------------------------------------------------------------------------------
If (LV_Colors[H].NS && (M = LVN_COLUMNCLICK))
Return 0
}
}
; ======================================================================================================================
; PRIVATE FUNCTION LV_Colors_SubclassProc() - subclass for WM_NOTIFY -> HDN_BEGINTRACK notifications (Win XP)
; ======================================================================================================================
LV_Colors_SubclassProc(H, M, W, L, S, R) {
Static HDN_BEGINTRACKA := -306
Static HDN_BEGINTRACKW := -326
Static WM_NOTIFY := 0x4E
Critical, % LV_Colors.Critical
If (M = WM_NOTIFY) {
; HDN_BEGINTRACK -------------------------------------------------------------------------------------------------
C := NumGet(L + (A_PtrSize * 2), 0, "Int")
If (C = HDN_BEGINTRACKA) || (C = HDN_BEGINTRACKW) {
Return True
}
}
Return DllCall("Comctl32.dll\DefSubclassProc", "Ptr", H, "UInt", M, "Ptr", W, "Ptr", L, "UInt")
}
; ======================================================================================================================
;start of functions start

URItoPath(vPathUrl)
{
vChars := 300 ;300 is an arbitrary number
VarSetCapacity(vPath, vChars*2)
DllCall("shlwapi\PathCreateFromUrl" (A_IsUnicode?"W":"A"), "Str",vPathUrl, "Str",vPath, "UInt*",vChars, "UInt",0)
return vPath
}

decodeStrAs(source,encoding)
{
;example: "Ã©" -> "é"
sourceSize := VarSetCapacity(target,StrLen(source),0)
Loop % sourceSize
NumPut(NumGet(&source, A_Index*2-1-1, "UChar"), &target, A_Index-1, "UChar")
return StrGet(&target, encoding)
}

sortArrByKey(ar, byref key,byref reverse:=false) {
str=
for k,v in ar {
str.=v[key] "+" k "|"
}
length:=ar.Length()
firstValue:=ar[1][key]
if firstValue is number
{
sortType := "N"
}
Sort, str, % "D|" sortType (reverse ? "R" : "")
finalAr:=[]
finalAr.SetCapacity(length)
barPos:=1
; if (reverse) {
loop %length% {
plusPos:=InStr(str, "+",, barPos)
barPos:=InStr(str, "|",, plusPos)

num:=SubStr(str, plusPos + 1, barPos - plusPos - 1)
finalAr.Insert(1,ar[num])
}
;} else {
; loop %length% {
; plusPos:=InStr(str, "+",, barPos)
; barPos:=InStr(str, "|",, plusPos)
;
; num:=SubStr(str, plusPos + 1, barPos - plusPos - 1)
; finalAr.Push(ar[num])
; }
; }

return finalAr
}

hashFiles(algorithm)
{
global EcurrentDir1, EcurrentDir2, whichSide
finalStr=
for notUsed, name in getSelectedNames() {
finalStr.=getHash(algorithm, EcurrentDir%whichSide% "\" name) "`n"
}
if (finalStr) {
StringTrimRight, finalStr, finalStr, 1 ;remove the last "`n" from the end
clipboard:=finalStr
cMsgbox(finalStr)
} else {
p("couldn't get hash")
}
}

getHash(algorithm, Apath)
{
FileGetAttrib, fileAttrib, %Apath%
if (InStr(fileAttrib, "D")) {
return "can't hash Directory"
} else {
cmdOutput:=RunCmd("certutil -hashfile """ Apath """ " algorithm)
return StrSplit(cmdOutput, "`n", "`r")[2]
}
}

generateRandomUniqueName(Apath, byref isDir:="")
{
inputFileExist:=fileExist(Apath)
if (inputFileExist) {
if (InStr(inputFileExist, "D"))
isDir:=true
SplitPath, Apath, OutFileName, OutDir, OutExtension, OutNameNoExt, OutDrive
loop {
if (isDir) {
tryPath:=OutDir "\" OutNameNoExt "_" randomName(6)
} else {
tryPath:=OutDir "\" OutNameNoExt "_" randomName(6) "." OutExtension
}
if (!FileExist(tryPath)) {
return tryPath
}
}
} else {
p("input path does not exist")
}

}
randomName(length)
{
chars:=[".", "_", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

charsLength:=chars.Length()

loop % length
{
Random, randInt , 1, charsLength
strng.=chars[randInt]
}
return strng
}

loadSettings()
{
global
FileRead, settingsTxt, %A_AppData%\ahk_explorer_settings\settings.txt
settingsArr:=StrSplit(settingsTxt, "`n", "`r")
peazipPath:=settingsArr[1]
vscodePath:=settingsArr[2]
BGColorOfSelectedPane:=settingsArr[3]
Ahk2ExePath:=settingsArr[4]
spekPath:=settingsArr[5]
}

removeFromSizes(byref name, byref whichSide)
{
for k, obj in sortedSizes%whichSide% {
if (obj["name"]=name) {
sortedSizes%whichSide%.Remove(k)
break
}
}
}
addToSizes(byref name, byref size, byref whichSide)
{
sortedSizes%whichSide%.Push({size:size,name:name})
sortedSizes%whichSide%:=sortArrByKey(sortedSizes%whichSide%,"size")
; sortedSizes%whichSide%:=sortArrByKey(sortedSizes%whichSide%,"size",true)

sortedBySize%whichSide%:=[]
for k, v in sortedSizes%whichSide% {
sortedBySize%whichSide%.Push(v["name"])
}
}
sortSizes()
{
global

sortedSizes%whichSide%:=[]
for name, obj in stuffByName%whichSide% {
sortedSizes%whichSide%.Push({size:obj["size"],name:name})
}

sortedSizes%whichSide%:=sortArrByKey(sortedSizes%whichSide%,"size")
; sortedSizes%whichSide%:=sortArrByKey(sortedSizes%whichSide%,"size",true)
sortedBySize%whichSide%:=[]
for k, v in sortedSizes%whichSide% {
sortedBySize%whichSide%.Push(v["name"])
}

}

bothSameDir(whichSide)
{
global
otherSide:=(whichSide=1) ? 2 : 1
if (EcurrentDir%whichSide%=EcurrentDir%otherSide%)
return otherSide
return false
}

revealFileInExplorer(folderPath, files)
{
COM_CoUninitialize()
COM_CoInitialize()
DllCall("shell32\SHParseDisplayName", "Wstr", folderPath, "Uint", 0, "Ptr*", pidl, "Uint", 0, "Uint", 0)
DllCall("shell32\SHBindToObject","Ptr",0,"Ptr",pidl,"Ptr",0,"Ptr",GUID4String(IID_IShellFolder,"{000214E6-0000-0000-C000-000000000046}"),"Ptr*",pIShellFolder)
length:=files.Length()
VarSetCapacity(apidl, length * A_PtrSize, 0)
for k, v in files {
;IShellFolder:ParseDisplayName
DllCall(VTable(pIShellFolder,3),"Ptr", pIShellFolder,"Ptr",win_hwnd,"Ptr",0,"Wstr",v,"Uint*",0,"Ptr*",tmpPIDL,"Uint*",0)
NumPut(tmpPIDL, apidl, (k - 1)*A_PtrSize, "Ptr")
}
DllCall("shell32\SHOpenFolderAndSelectItems", "Ptr", pidl, "UINT", length, "Ptr", &apidl, "Uint", 0)
COM_CoUninitialize()
}
COM_CoInitialize()
{
Return	DllCall("ole32\CoInitialize", "Uint", 0)
}
COM_CoUninitialize()
{
DllCall("ole32\CoUninitialize")
}
send_stringToFolderWatcher(whichFolderWatcher, num, stringToSend:="")
{
stringToSend .= "|" num
VarSetCapacity(message, size := StrPut(stringToSend, "UTF-16")*2, 0)
StrPut(stringToSend, &message, "UTF-16")
VarSetCapacity(COPYDATASTRUCT, A_PtrSize*3)
NumPut(size, COPYDATASTRUCT, A_PtrSize, "UInt")
NumPut(&message, COPYDATASTRUCT, A_PtrSize*2)
DetectHiddenWindows, On
SetTitleMatchMode, 2
SendMessage, WM_COPYDATA := 0x4A,, &COPYDATASTRUCT,, FolderWatcher%whichFolderWatcher%.ahk ahk_class AutoHotkey
}
startWatchFolder(byref whichSide, byref AcurrentDir)
{
if (whichSide=1) {
If !WatchFolder(AcurrentDir, "Watch1", 0, 3) { ;files and folders
MsgBox, 0, Error, Call of WatchFolder() failed!
Return
}
} else {
send_stringToFolderWatcher(whichSide, 1, AcurrentDir) ;1 for watch 2 for stop
}
}
stopWatchFolder(byref whichSide, byref dirToStopWatching)
{
if (whichSide=1) {
WatchFolder(dirToStopWatching, "**DEL")
} else {
send_stringToFolderWatcher(whichSide, 2, dirToStopWatching) ;1 for watch 2 for stop
}
}
Watch1(Folder, Changes) {
For Each, Change In Changes {
WatchN(1,Change.Action, Change.OldName, Change.Name)
}
}
WatchN(whichSide,Byref Action,Byref OldName,Byref Name)
{
global EcurrentDir1,EcurrentDir2,vlistView1,vlistView2
otherSide:=bothSameDir(whichSide)
GuiControl, -Redraw, vlistView%whichSide%
if (otherSide)
GuiControl, -Redraw, vlistView%otherSide%

if (Action=1) {
fileAdded(whichSide, Name)
} else if (Action=2) {
fileDeleted(whichSide, Name)
if (otherSide) {
fileDeleted(otherSide, Name)
}
} else if (Action=4) {
SplitPath, % Name, OutFileNameNew, OutDirNew
SplitPath, % OldName, OutFileNameOld, OutDirOld
if (OutDirNew=EcurrentDir%whichSide%) { ;renamed
fileRenamed(whichSide, OutFileNameOld, OutFileNameNew)
if (otherSide) {
fileRenamed(otherSide, OutFileNameOld, OutFileNameNew)
}
} else if (OutDirOld=EcurrentDir%otherSide%) { ;moved from other Side
fileAdded(whichSide, Name)
fileDeleted(otherSide, OldName)
} else { ;moved

fileAdded(whichSide, Name)
if (otherSide) {
fileAdded(otherSide, Name)
}
}
}
GuiControl, +Redraw, vlistView%whichSide%
if (otherSide)
GuiControl, +Redraw, vlistView%otherSide%

}
fileRenamed(whichSide, Byref renameFrom,Byref renameInto)
{
global
Gui, main:Default
Gui, ListView, vlistView%whichSide%
clipboard:=EcurrentDir%whichSide% "\" renameInto
FileGetSize, outputSize, % EcurrentDir%whichSide% "\" renameInto
obj:=stuffByName%whichSide%[renameFrom]
stuffByName%whichSide%[renameInto]:=stuffByName%whichSide%[renameFrom]
stuffByName%whichSide%.Delete(renameFrom)
stuffByName%whichSide%[renameInto]["size"]:=outputSize

;rename in sortedByDate
for k, v in sortedByDate%whichSide% {
if (v=renameFrom) {
sortedByDate%whichSide%[k]:=renameInto
break
}
}

removeFromSizes(renameFrom, whichSide)
addToSizes(renameInto,outputSize, whichSide)

rowNums:=LV_GetCount()
loop % rowNums {
LV_GetText(OutputVar,A_Index,2)
if (OutputVar=renameFrom) {
calculateStuff(,outputSize,OutputVar,A_Index)

LV_Modify(A_Index,, ,renameInto,,,formattedBytes,bytes)

justOneIcon(renameInto,A_Index,whichSide)

break
}
}
}
fileAdded(whichSide, Byref path) {
global
Gui, main:Default
Gui, ListView, vlistView%whichSide%
SplitPath, path, OutFileName
sortWithAr%whichSide%:=[]
FileGetSize, outputSize, %path%
FileGetAttrib, OutputAttri , %path%

stuffByName%whichSide%[OutFileName]:={date:A_Now,attri:OutputAttri,size:outputSize}

sortedByDate%whichSide%.InsertAt(1,OutFileName)

addToSizes(OutFileName,outputSize,whichSide)

whereToAddFile(whichSide, OutFileName, A_Now,outputSize)

if (bothSameDir(whichSide)) {
stuffByName%otherSide%[OutFileName]:=stuffByName%whichSide%[OutFileName]
sortedBySize%otherSide%:=sortedBySize%whichSide%.Clone()
sortedByDate%otherSide%:=sortedByDate%whichSide%.Clone()
whereToAddFile(otherSide, OutFileName, A_Now,outputSize)
}

}
fileDeleted(Byref whichSide, Byref path)
{
global
Gui, main:Default
Gui, ListView, vlistView%whichSide%
SplitPath, path, OutFileName
GuiControl, -Redraw, vlistView%whichSide%

rowNums:=LV_GetCount()
loop % rowNums {
LV_GetText(OutputVar,A_Index,2)
if (OutputVar=OutFileName) {

LV_Delete(A_Index)
if !LV_GetNext(1) {
if (A_Index=rowNums and A_Index>1) {
LV_Modify(A_Index-1, "+Select +Focus Vis") ; select
}
else
LV_Modify(A_Index, "+Select +Focus Vis") ; select
}
; GuiControl, +Redraw, vlistView%whichSide%
obj:=stuffByName%whichSide%[OutFileName]

;remove name from sortedByDate
for k, v in sortedByDate%whichSide% {
if (v=OutFileName) {
sortedByDate%whichSide%.Remove(k)
break
}
}

removeFromSizes(OutFileName,whichSide)

stuffByName%whichSide%.Delete(OutFileName)

break
}
}
}

whereToAddFile(byref whichSide, byref OutFileName,byref date,byref size) {
global
Gui, main:Default
Gui, ListView, vlistView%whichSide%
insertNum:=0

if (whichsort%whichSide%="newOld") {
if (focused="searchCurrentDirEdit" or focused="listViewInSearch") {
if (SubStr(searchString%whichSide%, 1, 1)!=".") {
counter:=0
objectToSort:=[]
for k,v in sortedByDate%whichSide% {
if (counter>maxRows)
break
SplitPath, v,,,, OutNameNoExt

pos:=InStr(OutNameNoExt, searchString%whichSide%)
if (pos) {
counter++
objectToSort.Push({name:v,pos:pos})
}
}
objectToSort:=ObjectSort(objectToSort,"pos")

for k,v in objectToSort {
name:=v["name"]
if (name=OutFileName) {
insertNum:=k
}
}
} else {
searchFoldersOnly:=(searchString%whichSide%=".") ? true : false
if (searchFoldersOnly) {
counter:=0
for k,v in sortedByDate%whichSide% {
if (v=OutFileName) {
if (counter>maxRows)
break
SplitPath, v,,, OutExtension
if (!OutExtension) {
insertNum:=k
}
}
}
} else {
searchStringBak%whichSide%:=SubStr(searchString%whichSide%, 2)
counter:=0
objectToSort:=[]
for k,v in sortedByDate%whichSide% {
if (counter>maxRows)
break
SplitPath, v,,, OutExtension
pos:=InStr(OutExtension, searchStringBak%whichSide%)
if (pos) {
counter++
objectToSort.Push({name:v,pos:pos})
}
}
objectToSort:=ObjectSort(objectToSort,"pos")
for k,v in objectToSort {
name:=v["name"]
if (name=OutFileName) {
insertNum:=k
}
}
}

}
} else {
insertNum:=1
}
} else if (whichsort%whichSide%="oldNew") {
rowNums:=LV_GetCount()
insertNum:=rowNums+1
} else if (whichsort%whichSide%="bigSmall") {
for k, v in sortedBySize%whichSide% {
if (k>maxRows)
break
if (v=OutFileName) {
insertNum:=k
}
}
} else if (whichsort%whichSide%="smallBig") {
lengthAddedOne:=sortedBySize%whichSide%.Length()+1
for k in sortedBySize%whichSide% {
v:=sortedBySize%whichSide%[lengthAddedOne-k]
if (k>maxRows)
break
if (v=OutFileName) {
insertNum:=k
}
}
}

if (insertNum) {
insertRow(whichSide, OutFileName, insertNum, date,size)
}
}

insertRow(byref whichSide, byref OutFileName,byref row,byref date,byref size)
{
global

Gui, main:Default
Gui, ListView, vlistView%whichSide%
calculateStuff(date,size,OutFileName,row)
GuiControl, -Redraw, vlistView%whichSide%
LV_Insert(row,,,OutFileName,var1,var2,formattedBytes,bytes)
LV_Colors.Cell(ListviewHwnd%whichSide%,row,3,color)

justOneIcon(OutFileName,row,whichSide)
GuiControl, +Redraw, vlistView%whichSide%
}

pasteFile()
{
global
; action:=false
if (DllCall("IsClipboardFormatAvailable", "UInt", CF_HDROP := 15)) { ; file being copied
if (DllCall("IsClipboardFormatAvailable", "UInt", dropEffectFormat)) {
if (DllCall("OpenClipboard", "Ptr", A_ScriptHwnd)) {
if (data := DllCall("GetClipboardData", "UInt", dropEffectFormat, "Ptr")) {
if (effect := DllCall("GlobalLock", "Ptr", data, "UInt*")) {
; action:="copy"
if (effect & DROPEFFECT_COPY) {
files:=StrSplit(clipboard, "`n","`r")
for k, v in files {
fileExist:=FileExist(v)
if (fileExist) {
SplitPath, v , OutFileName
if (InStr(fileExist, "D")) {
FileCopyDir, %v%, % EcurrentDir%whichSide% "\" OutFileName
} else {
FileCopy, %v%, % EcurrentDir%whichSide%
}
if (ErrorLevel) {
p("couldn't copy file " v)
break
}
}
}
SoundPlay, *-1
}
; action:="move"
else if (effect & DROPEFFECT_MOVE) {
files:=StrSplit(clipboard, "`n","`r")
if (files.Length()) {
for k, v in files {
fileExist:=FileExist(v)
if (fileExist) {
SplitPath, v , OutFileName
if (InStr(fileExist, "D")) {
FileMoveDir, %v%, % EcurrentDir%whichSide% "\" OutFileName
} else {
FileMove, %v%, % EcurrentDir%whichSide%
}
if (ErrorLevel) {
p("couldn't move file " v)
break
}
}
}

SoundPlay, *-1
}

}
DllCall("GlobalUnlock", "Ptr", data)
}
}
DllCall("CloseClipboard")
}
}
}

}

paddedNumber(number, howManyChars)
{
VarSetCapacity(ZeroPaddedNumber, 20) ; Ensure the variable is large enough to accept the new string.
DllCall("wsprintf", "Str", ZeroPaddedNumber, "Str", "%0" howManyChars "d", "Int", number, "Cdecl") ; Requires the Cdecl calling convention.
return ZeroPaddedNumber
}

setWhichSideFromDir(dir)
{
global
if (EcurrentDir1=dir) {
whichSide:=1
} else if (EcurrentDir2=dir) {
whichSide:=2
}
}

getMultiRenameNames()
{
global
Gui, multiRenameGui:Default
gui, submit, nohide

startingNums:=StrSplit(multiRenameStartingNums, ",")
asteriskLength:=StrSplit(multiRenameTheName, "*").Length()
previewNames:=[]
for k, v in namesToMultiRename {
nameInstance:=multiRenameTheName

continueChar:=true
charIndex:=1

length:=StrLen(nameInstance)
lessGreaters:=[]
asterisksAndQmarks:=[]
while (charIndex<=length) {
char:=SubStr(nameInstance, charIndex, 1)

if (char="*") {
asterisksAndQmarks.Push("*")
} else if (char="?") {

questionMarkCounter:=0
while (char="?") {
questionMarkCounter++
charIndex++
char:=SubStr(nameInstance, charIndex, 1)
}
asterisksAndQmarks.Push(string_Multiply("?",questionMarkCounter))
continue
} else if (char="<") {
savedIndex:=charIndex
while (char!=">") {
charIndex++
char:=SubStr(nameInstance, charIndex, 1)
}
subLen:=charIndex - savedIndex + 1
asterisksAndQmarks.Push(SubStr(nameInstance, savedIndex, subLen))
lessGreaters.Insert(1, [savedIndex,subLen])
continue
}
charIndex++
}
for key, value in lessGreaters {
nameInstance:=SubStr(nameInstance, 1, value[1]-1) SubStr(nameInstance, value[1] + value[2])
}

SplitPath, v,,, OutExtension
nameInstance:=StrReplace(nameInstance, "|name", v)
nameInstance:=StrReplace(nameInstance, "|ext", OutExtension)

fileExist:=fileExist(multiRenameDir "\" v)
if (InStr(fileExist, "D" )) {
nameInstance:=StrReplace(nameInstance, "|Dext" , "")
nameInstance:=StrReplace(nameInstance, "|.Dext" , "")
} else {
nameInstance:=StrReplace(nameInstance, "|Dext" , OutExtension)
nameInstance:=StrReplace(nameInstance, "|.Dext" , "." OutExtension)
}

for key, value in asterisksAndQmarks {
num:=(startingNums[key]) ? startingNums[key] : 1
actualNum:=num+k-1
if (InStr(value, "?" )) {
actualNum:=paddedNumber(actualNum, StrLen(value))
} else if (InStr(value, "<" )) {
inside:=SubStr(value, 2, StrLen(value)-2)
nameInstance:=StrReplace(nameInstance, inside, "",, num)
if (num<0) {
p("oof")
}
continue
}
nameInstance:=StrReplace(nameInstance, value , actualNum,, 1)
}

previewNames.Push(nameInstance)

}
return previewNames
}

getTextWidth(text)
{
global Dummy
Gui,Fake:Font,s10,Segoe UI
Gui,Fake:Add,Text, -Wrap vDummy,% text
GuiControlGet,Pos,Fake:Pos,Dummy
Gui,Fake:Destroy
return posw
}
calculateStuff(ByRef date:="", ByRef size:="", ByRef name:="", Byref k:="") {
global
if (calculateDates and date!="") {
now:=A_Now
var1Num := now
var2 := date
EnvSub, var1Num, %var2%, Minutes
var1:=var1Num "’"
color=0xFF0000 ;red
if (Abs(var1Num)>525599) {
var1Num := now
EnvSub, var1Num, %var2%, Days
var1Num:=Floor(var1Num/365.25) ;the average days in a month
var1:=var1Num " y"
color=0x808080 ;grey ; pink
}
else if (Abs(var1Num)>86399) {
var1Num := now
EnvSub, var1Num, %var2%, Days
var1Num:=Floor(var1Num/30.44) ;the average days in a month
var1:=var1Num " m"
color=0x00FFFF ;AQUA
}
else if (Abs(var1Num)>1439) {
var1Num := now
EnvSub, var1Num, %var2%, Days
var1:=var1Num " d"
color=0x00FF00 ;lime green
} else if (Abs(var1Num)>59) {
var1Num := now
EnvSub, var1Num, %var2%, Hours
var1:=var1Num " h"
color=0xFFFF00 ;yellow
}
}
if (calculatefileSizes and size!="") {
bytes:=""
formattedBytes:=""

bytes:=size

if (bytes!="")
formattedBytes:=autoByteFormat(bytes)
}
}
applySizes() {
global
if (namesForSizes%whichSide%.Length()) {
namesStr:="""" EcurrentDir%whichSide% """"
for k, v in namesForSizes%whichSide% {
namesStr.=" """ v """"
}
Process, Close, %PID_getFolderSizes%
Run, "%A_AhkPath%" "lib\getFolderSizes.ahk" %namesStr%,,,PID_getFolderSizes
} else {
Process, Close, %PID_getFolderSizes%
sortSizes()
canSortBySize%whichSide%:=true
}
}
justOneIcon(byref name,byref row, byref whichSide) {
global
if (doIcons) {
hIcon := DllCall("Shell32\ExtractAssociatedIcon", UInt, 0, Str, EcurrentDir%whichSide% "\" name , UShortP, iIndex)
if hIcon
{
IconNumber := DllCall("ImageList_ReplaceIcon", UInt, ImageListID%whichSide%, Int, -1, UInt, hIcon) + 1
DllCall("DestroyIcon", Uint, hIcon)
}
else
IconNumber = 1

LV_Modify(row,"Icon" . IconNumber)
lastIconNumber:=IconNumber
}

}

applyIcons(byref names) {
global
if (doIcons) {
for k, v in names {
hIcon := DllCall("Shell32\ExtractAssociatedIcon", UInt, 0, Str, EcurrentDir%whichSide% "\" v , UShortP, iIndex)
if hIcon
{
IconNumber := DllCall("ImageList_ReplaceIcon", UInt, ImageListID%whichSide%, Int, -1, UInt, hIcon) + 1
DllCall("DestroyIcon", Uint, hIcon)
}
else
IconNumber = 1

LV_Modify(k,"Icon" . IconNumber)
lastIconNumber:=IconNumber
}

}
}

renderFunctionsToSort(ByRef objectToSort, reverse:=false)
{
global
Gui, main:Default
Gui, ListView, vlistView%whichSide%
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%

GuiControl,Text,vcurrentDirEdit%whichSide%, % EcurrentDir%whichSide%
searchString%whichSide%=

GuiControl, -Redraw, vlistView%whichSide%
LV_Delete()
length:=objectToSort.Length()
if (reverse) {
startPos:=length
inc:=-1
reverseSort:=true
}
else {
startPos:=1
inc:=1
reverseSort:=false
}
namesForIcons%whichSide%:=[]
namesForSizes%whichSide%:=[]
rowsForSizes%whichSide%:=[]

if (length<=maxRows) {
rowsToLoop:=length
} else {
rowsToLoop:=maxRows
if (toFocus) {
loop % length {
if (toFocus=objectToSort[A_Index]) {
if (length - A_Index<maxRows - 1) {
startPos:=length - maxRows + 1
if (startPos<1)
startPos:=1
}
else {
startPos:=A_Index
}
}
}
}
}
k:=startPos
loop % rowsToLoop {
name:=objectToSort[k]
v:=stuffByName%whichSide%[name]

if (name=toFocus)
{
rowToFocus:=A_Index
}
calculateStuff(v["date"],v["size"],name,A_Index)
LV_Add(,,name,var1,var2,formattedBytes,bytes)
LV_Colors.Cell(ListviewHwnd%whichSide%,A_Index,3,color)
namesForIcons%whichSide%.Push(name)

if (!quickFixIcon%whichSide%) {
quickFixIcon%whichSide%:=true
hIcon:=DllCall("Shell32\ExtractAssociatedIcon", UInt, 0, Str, "", UShortP, iIndex)
if hIcon
{
IconNumber := DllCall("ImageList_ReplaceIcon", UInt, ImageListID1, Int, -1, UInt, hIcon) + 1
DllCall("DestroyIcon", Uint, hIcon)
}
else
IconNumber = 1
LV_Modify(A_Index,"Icon" . IconNumber)
lastIconNumber:=IconNumber
}

k+=inc
}
if (toFocus)
{
LV_Modify(rowToFocus, "+Select +Focus Vis")
} else {
LV_Modify(1, "+Select +Focus")
}
toFocus:=false
if (!firstIce%whichSide%) {
firstIce%whichSide%:=true
ICELV%whichSide% := New LV_InCellEdit(ListviewHwnd%whichSide%, false, true)
ICELV%whichSide%.SetColumns(0)
}
GuiControl, +Redraw, vlistView%whichSide%
applyIcons(namesForIcons%whichSide%)
if (firstSizes%whichSide%) {
firstSizes%whichSide%:=false
for key in objectToSort {
if (reverse) {
k:=length-key+1
} else {
k:=key
}
name:=objectToSort[k]
v:=stuffByName%whichSide%[name]
if (InStr(v["attri"], "D")) {
if (key<51)
rowsForSizes%whichSide%.Push(key)
namesForSizes%whichSide%.Push(name)
}
}
applySizes()
}
stopSizes:=true
}

manageCMDArguments(pathArgument)
{
global
Gui, main:Default
cmdFileExist:=fileExist(pathArgument)
if (cmdFileExist) {
if (InStr(cmdFileExist, "D")) {
EcurrentDir%whichSide%:=pathArgument
} else {
SplitPath, pathArgument, OutFileName, OutDir
EcurrentDir%whichSide%:=OutDir
toFocus:=OutFileName
}
}
else {
p("the folder or file you are trying to open doesn't exist`nyou were trying to open: pathArgument=`n" pathArgument)
clipboard:=pathArgument
cmdFileExist:=fileExist(pathArgument)
p(cmdFileExist " pathArgument was copied to clip" )
}
winactivate, ahk_explorer ahk_class AutoHotkeyGUI
renderCurrentDir()
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
}

receivedFolderSize(string) {
global

if (rowsForSizes%whichSide%.Length()) {
Gui, main:Default
ar:=StrSplit(string,"|")

whichListView_bak:=A_DefaultListView
Gui, ListView, vlistView%whichSide%
LV_Modify(rowsForSizes%whichSide%[1],,,,,,ar[2],ar[3])
Gui, ListView, %whichListView_bak%

rowsForSizes%whichSide%.RemoveAt(1)
}
stuffByName%whichSide%[ar[1]]["size"]:=ar[3]
}
;virtual desktop
revealAhk_Explorer:
CurrentIVirtualDesktop := 0
GetCurrentDesktop_return_value := DllCall(GetCurrentDesktop, "UPtr", IVirtualDesktopManagerInternal, "UPtrP", CurrentIVirtualDesktop, "UInt")

pView := 0
DllCall(GetViewForHwnd, "UPtr", IApplicationViewCollection, "Ptr", thisHwnd, "Ptr*", pView, "UInt")

DllCall(MoveViewToDesktop, "ptr", IVirtualDesktopManagerInternal, "Ptr", pView, "UPtr", CurrentIVirtualDesktop, "UInt")
winactivate, ahk_id %thisHwnd%
return

WM_COPYDATA_READ(wp, lp) {
global
data := StrGet(NumGet(lp + A_PtrSize*2), "UTF-16")
RegExMatch(data, "s)(.*)\|(\d+)", match)

if (match2=1) {
manageCMDArguments(match1)
} else if (match2=2) {
; p(match1)
receivedFolderSize(match1)
} else if (match2=3) {
sortSizes()
canSortBySize%whichSide%:=true
} else if (match2=4) {
gosub, selectPanel%match1%
} else if (match2=5) {
gosub, copySelectedPaths
} else if (match2=6) {
if (windowHidden) {
windowHidden:=false
gui, main:Default
; gui, hide
gui, show
} else {
SetTimer, revealAhk_Explorer , -0
}
} else if (match2=7) {
Action_OldName_Name:=StrSplit(match1, "|")
WatchN(2,Action_OldName_Name[1],Action_OldName_Name[2],Action_OldName_Name[3])
} else {
p("something went wrong")
}
}

submitAndRenderDir()
{
global
Gui, main:Default
Gui, Submit, NoHide

StringUpper, OutputVar,% SubStr(vcurrentDirEdit%whichSide%,1,1)
EcurrentDir%whichSide%:=OutputVar SubStr(vcurrentDirEdit%whichSide%,2)
renderCurrentDir()
}

Bin(x){
while x
r:=1&x r,x>>=1
return r
}
compareTwoStrings2(para_string1,para_string2) {
;Sørensen-Dice coefficient
savedBatchLines := A_BatchLines
SetBatchLines, -1

vCount := 0
oArray := {}
oArray := {base:{__Get:Func("Abs").Bind(0)}} ;make default key value 0 instead of a blank string
Loop, % vCount1 := StrLen(para_string1) - 1
oArray["z" SubStr(para_string1, A_Index, 2)]++
Loop, % vCount2 := StrLen(para_string2) - 1
if (oArray["z" SubStr(para_string2, A_Index, 2)] > 0) {
oArray["z" SubStr(para_string2, A_Index, 2)]--
vCount++
}
vSDC := Round((2 * vCount) / (vCount1 + vCount2),2)
; if (!vSDC || vSDC < 0.005) { ;round to 0 if less than 0.005
; return 0
; }
if (vSDC = 1) {
return 1
}
SetBatchLines, % savedBatchLines
return vSDC
}

compareTwoStrings(para_string1,para_string2)
{
;Sørensen-Dice coefficient
savedBatchLines := A_BatchLines
SetBatchLines, -1

vCount := 0
oArray := {}
oArray := {base:{__Get:Func("Abs").Bind(0)}} ;make default key value 0 instead of a blank string
Loop, % vCount1 := StrLen(para_string1)
; Loop, % vCount1 := StrLen(para_string1) - 1
oArray["z" SubStr(para_string1, A_Index, 1)]++
; oArray["z" SubStr(para_string1, A_Index, 2)]++
Loop, % vCount2 := StrLen(para_string2)
; Loop, % vCount2 := StrLen(para_string2) - 1
; p(oArray)
if (oArray["z" SubStr(para_string2, A_Index, 1)] > 0) {
; if (oArray["z" SubStr(para_string2, A_Index, 2)] > 0) {
oArray["z" SubStr(para_string2, A_Index, 1)]--
; oArray["z" SubStr(para_string2, A_Index, 2)]--
vCount++
}
; p(vCount)
vSDC := (vCount) / (vCount2)
; vSDC := (2 * vCount) / (vCount1 + vCount2)
; vSDC := Round((2 * vCount) / (vCount1 + vCount2),2)
; if (!vSDC || vSDC < 0.005) { ;round to 0 if less than 0.005
; return 0
; }
if (vSDC = 1) {
return 1
}
SetBatchLines, % savedBatchLines
return vSDC
}

autoMegaByteFormat(size, decimalPlaces = 2)
{
static sizes :=["GB", "TB"]

sizeIndex := 0

while (size >= 1024)
{
sizeIndex++
size /= 1024.0

if (sizeIndex = sizes.Length())
break
}

return (sizeIndex = 0) ? size " MB"
: round(size, decimalPlaces) . " " . sizes[sizeIndex]
}

autoByteFormat(size, decimalPlaces = 2)
{
static sizes :=["KB", "MB", "GB", "TB"]

sizeIndex := 0

while (size >= 1024)
{
sizeIndex++
size /= 1024.0

if (sizeIndex = sizes.Length())
break
}

return (sizeIndex = 0) ? size " B"
: round(size, decimalPlaces) . " " . sizes[sizeIndex]
}

sortColumn(column, sortMethod)
{
global columnsToSort

for k, v in columnsToSort {
if (v!=column) {
LV_ModifyCol(v, "NoSort")
}
}
LV_ModifyCol(column, sortMethod)
}

getSelectedNames()
{
global
gui, main:default
Gui, ListView, vlistView%whichSide%
index:=""
selectedNames:=[]
loop {
index:=LV_GetNext(index)
if (!index)
break
LV_GetText(OutputVar,index,2)
selectedNames.Push(OutputVar)

}
return selectedNames
}

getSelectedPaths()
{
global
selectedPaths:=[]
for k, v in getSelectedNames() {
selectedPaths.Push(EcurrentDir%whichSide% "\" v)
}
return selectedPaths
}

doubleClickedNormal(ByRef index)
{
global
gui, main:default
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
Gui, ListView, vlistView%whichSide%

LV_GetText(filename,index,2)
path:=EcurrentDir%whichSide% "\" filename
doubleClickedFolderOrFile(path)
}

doubleClickedFolderOrFile(ByRef path)
{
global
fileExist:=FileExist(path)
if (fileExist) {
if (InStr(fileExist, "D"))
{
EcurrentDir%whichSide%:=path
renderCurrentDir()
}
else {
path:=path
Run, "%path%", % EcurrentDir%whichSide%
}
}
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
}

stopSearching()
{
global
Gui, main:Default
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
focused=flistView
GuiControl,Text,currentDirEdit, % EcurrentDir%whichSide%
searchString%whichSide%=
renderCurrentDir()
}

HandleMessage( p_w, p_l, p_m, p_hw )
{
global
local control
; return
; p(p_w)
if (!ignoreOut) {
if (p_w=0x1000007) {
; p(p_l)

whichSide:=1
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
if (focused="flistView") ; if listView for instance
{
focused:="changePath"
} else if (focused="listViewInSearch") {
focused:="searchCurrentDirEdit"
}
}
else if (p_w=0x100000B) {

whichSide:=2
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
if (focused="flistView") ; if listView for instance
{
focused:="changePath"
} else if (focused="listViewInSearch") {
focused:="searchCurrentDirEdit"
}
}

;   16777222
else if ( p_w & 0x2000000 )
{
if (p_w=0x2000007) {

whichSide:=1
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
}
else if (p_w=0x200000B) {

whichSide:=2
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
}

if (((p_w >> 16) & 0x200) and not ((p_w >> 16) & 0x100))
; if (If ((p_w >> 16) & 0x200) and not ((p_w >> 16) & 0x100))
{
if ( p_l = Edithwnd%whichSide% )
{
if (focused="searchCurrentDirEdit")
{
focused=listViewInSearch
}
else if (focused="changePath") {

MouseGetPos,,, OutputVarWin
GuiControl, Focus, vlistView%whichSide%
winactivate, ahk_id %OutputVarWin%
; static EM_SETSEL   := 0x00B1
; static EN_SETFOCUS := 0x0100
submitAndRenderDir()
focused:="flistView"
}
else
{
; Gui, Submit, NoHide
; currentDir:=currentDirEdit
;
}
} else if ( p_l = RenameHwnd ) {
if (!fromButton)
gosub, renameFileLabel
}
}
}
}

}
return

searchInCurrentDir() {
global
if (searchString%whichSide%="") {
}
else {
searching:=true
Gui, main:Default
Gui, ListView, vlistView%whichSide%

ignoreOut:=true
objectToSort:=[]
namesForIcons%whichSide%:=[]

GuiControl, -Redraw, vlistView%whichSide%
LV_Delete()
if (SubStr(searchString%whichSide%, 1, 1)!=".") {
counter:=0
objectToSort:=[]

for k,v in sortedByDate%whichSide% {
if (counter>maxRows)
break
attri:=stuffByName%whichSide%[v]["attri"]
if InStr(attri, "D") {
pos:=InStr(v, searchString%whichSide%)
} else {
SplitPath, v,,,, OutNameNoExt
pos:=InStr(OutNameNoExt, searchString%whichSide%)
}

if (pos) {
counter++
objectToSort.Push({name:v,pos:pos})
}
}
objectToSort:=ObjectSort(objectToSort,"pos")

for k,v in objectToSort {
name:=v["name"]
obj:=stuffByName%whichSide%[name]
calculateStuff(obj["date"],obj["size"],name,k)

LV_Add(,,name,var1,var2,formattedBytes,bytes)
LV_Colors.Cell(ListviewHwnd%whichSide%,k,3,color)
namesForIcons%whichSide%.Push(name)
}
} else {
searchFoldersOnly:=(searchString%whichSide%=".") ? true : false
if (searchFoldersOnly) {
counter:=0
for k,v in sortedByDate%whichSide% {
if (counter>maxRows)
break
SplitPath, v,,, OutExtension
if (!OutExtension) {
obj:=stuffByName%whichSide%[v]

calculateStuff(obj["date"],obj["size"],v,k)

LV_Add(,,v,var1,var2,formattedBytes,bytes)
LV_Colors.Cell(ListviewHwnd%whichSide%,k,3,color)
namesForIcons%whichSide%.Push(v)
}
}
} else {
searchStringBak%whichSide%:=SubStr(searchString%whichSide%, 2)
counter:=0
objectToSort:=[]
for k,v in sortedByDate%whichSide% {
if (counter>maxRows)
break
SplitPath, v,,, OutExtension
pos:=InStr(OutExtension, searchStringBak%whichSide%)
if (pos) {
counter++
objectToSort.Push({name:v,pos:pos})
}
}
objectToSort:=ObjectSort(objectToSort,"pos")
for k,v in objectToSort {
name:=v["name"]
obj:=stuffByName%whichSide%[name]

calculateStuff(obj["date"],obj["size"],name,k)

LV_Add(,,name,var1,var2,formattedBytes,bytes)
LV_Colors.Cell(ListviewHwnd%whichSide%,k,3,color)
namesForIcons%whichSide%.Push(name)
}
}

}
GuiControl, +Redraw, vlistView%whichSide%
applyIcons(namesForIcons%whichSide%)
}

loop % LV_GetCount() - 1 {

LV_Modify(A_Index+1, "-Select -Focus") ; select
}

LV_Modify(1, "+Select +Focus Vis") ; select

searching:=false
ignoreOut:=false
}

minusEverythingAfterPoint(index)
{
global rowBak

indexBak:=index+1
loop % rowBak.Length() - index {
if (rowBak[indexBak]!=0)
rowBak[indexBak]--
indexBak++
}
}

addEverythingAfterPoint(index) {
global rowBak

indexBak:=index+1
loop % rowBak.Length() - index {
if (rowBak[indexBak]!=0)
rowBak[indexBak]++
indexBak++
}
}

getinsertPoint(index)
{
global rowBak
index--
while (rowBak[index]=0) {
index--
}

if (index<1)
return 1

return rowBak[index]+1

}

renderCurrentDir()
{
global
local ansiPath, bothSameDir, dirToStopWatching,i,k,v,y,drive,freeSpace,lastChar,text,totalSpace,OutputVar
; global EcurrentDir1, EcurrentDir2, whichSide, currentDirSearch, stopSizes
Gui, main:Default

if (SubStr(EcurrentDir%whichSide%,1,5)="file:") {
ansiPath:=URItoPath(EcurrentDir%whichSide%)
EcurrentDir%whichSide%:=decodeStrAs(ansiPath, "UTF-8")
}

EcurrentDir%whichSide%:=LTrim(EcurrentDir%whichSide%,"file:///")
EcurrentDir%whichSide%:=StrReplace(EcurrentDir%whichSide%, "%20", " ")
; d(EcurrentDir%whichSide%)
lastChar:=SubStr(EcurrentDir%whichSide%, 0)
if (lastChar="\")
EcurrentDir%whichSide%:=SubStr(EcurrentDir%whichSide%, 1, StrLen(EcurrentDir%whichSide%)-1)
EcurrentDir%whichSide%:=Rtrim(EcurrentDir%whichSide%," ")
EcurrentDir%whichSide%:=StrReplace(EcurrentDir%whichSide%, "/" , "\")
Gui, ListView, vlistView%whichSide%

currentDirSearch:=""
if (InStr(fileExist(EcurrentDir%whichSide%), "D"))
{
stopSizes:=false

if (lastDir%whichSide%!=EcurrentDir%whichSide% ) {
bothSameDir:=bothSameDir(whichSide)
if (lastDir%whichSide%!="" and EcurrentDir%otherSide%!=lastDir%whichSide%) {
for k, v in watching%whichSide% {
if (v=lastDir%whichSide%) {
watching%whichSide%.Remove(k)
dirToStopWatching:=v
break
}
}
stopWatchFolder(whichSide,dirToStopWatching)
}

if (!bothSameDir) {
watching%whichSide%.Push(EcurrentDir%whichSide%)
startWatchFolder(whichSide,EcurrentDir%whichSide%)
}

if (lastDir%whichSide%!="" and !cannotDirHistory%whichSide%) {
dirHistory%whichSide%.Push(lastDir%whichSide%)
}
}
if cannotDirHistory%whichSide% {
cannotDirHistory%whichSide%:=false
}
lastDir%whichSide%:=EcurrentDir%whichSide%
focused=flistView

filePaths:=[]
rowBak:=[]
; dates:=[]
sortableDates:=[]
sizes:=[]
sortableSizes:=[]
; dateColors:=[]
; filesWithNoExt:=[]
if (lastIconNumber)
rememberIconNumber:=lastIconNumber

unsorted%whichSide%:=[]
sortedByDate%whichSide%:=[]
sortedBySize%whichSide%:=[]
canSortBySize%whichSide%:=false
stuffByName%whichSide%:={}
sortedDates:=[]
sortedSizes%whichSide%:=[]
Loop, Files, % EcurrentDir%whichSide% "\*", DF
{
stuffByName%whichSide%[A_LoopFileName]:={date:A_LoopFileTimeModified,attri:A_LoopFileAttrib,size:A_LoopFileSize}

sortedDates.Push({date:A_LoopFileTimeModified,name:A_LoopFileName})
}

sortedDates:=sortArrByKey(sortedDates,"date")
; sortedDates:=sortArrByKey(sortedDates,"date",true)

for k, v in sortedDates {
sortedByDate%whichSide%.Push(v["name"])
}

firstSizes%whichSide%:=true
whichsort%whichSide%:="newOld"
oldNew%whichSide%:=false

renderFunctionsToSort(sortedByDate%whichSide%)

Gui, ListView, folderlistView2_%whichSide%
LV_Delete()
parent1DirDirs%whichSide%:=[]
SplitPath, EcurrentDir%whichSide%, , parent1Dir%whichSide%
SplitPath, parent1Dir%whichSide%, Out2DirName%whichSide% , parent2Dir%whichSide%,,,OutDrive2%whichSide%
SplitPath, parent2Dir%whichSide%, Out3DirName%whichSide%, parent3Dir%whichSide%,,,OutDrive3%whichSide%
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"

if (parent1Dir%whichSide%!=EcurrentDir%whichSide%) {
if (!Out2DirName%whichSide%)
Out2DirName%whichSide%:=OutDrive2%whichSide%
LV_ModifyCol(1,"NoSort", Out2DirName%whichSide%)
Loop, Files, % parent1Dir%whichSide% "\*", D
{
if (A_LoopFileLongPath!=EcurrentDir%whichSide%) {
LV_Add(, A_LoopFileName)
parent1DirDirs%whichSide%.Push(A_LoopFileLongPath)
} else {
toSelect:=(A_Index=1) ? 1 : A_Index-1
}
}
Gui, ListView, folderlistView2_%whichSide% ;just in case
LV_Modify(toSelect, "+Select +Focus Vis") ; select
} else
{
LV_ModifyCol(1,"NoSort", "")
}
Gui, ListView, folderlistView1_%whichSide%
LV_Delete()
parent2DirDirs%whichSide%:=[]
if (parent2Dir%whichSide%!=parent1Dir%whichSide%) {
if (!Out3DirName%whichSide%)
Out3DirName%whichSide%:=OutDrive3%whichSide%
LV_ModifyCol(1,"NoSort", Out3DirName%whichSide%)
Loop, Files, % parent2Dir%whichSide% "\*", D
{
if (A_LoopFileLongPath!=parent1Dir%whichSide%) {
LV_Add(, A_LoopFileName)
parent2DirDirs%whichSide%.Push(A_LoopFileLongPath)
} else {
toSelect:=(A_Index=1) ? 1 : A_Index-1
}
}
Gui, ListView, folderlistView1_%whichSide% ;just in case
LV_Modify(toSelect, "+Select +Focus Vis") ; select
}
else
{
LV_ModifyCol(1,"NoSort", "")
}

DriveGet, OutputVar, List
drives:=StrSplit(OutputVar,"")
length:=drives.Length()

for i, drive in drives {
y:=40*(i-1)
DriveGet, totalSpace, Capacity, %drive%:
DriveSpaceFree, freeSpace, %drive%:

text:=drive ":\ " Round(100-100*freeSpace/totalSpace, 2) "%`n" autoMegaByteFormat(freeSpace) "/" autoMegaByteFormat(totalSpace)
if (i>numberOfDrives) {
gui, add, button,h40 y%y% w%favoritesListViewWidth% vDrive%i% x0 Left ggChangeDrive, % text
}
else {
GuiControl, Show, Drive%i%
GuiControl, Text, Drive%i%, % text
}
}

loop % numberOfDrives {
if (A_Index>length) {
GuiControl, Hide, Drive%A_Index%
}
}

if (length>numberOfDrives)
numberOfDrives:=length
} else {
SplitPath, EcurrentDir%whichSide%, OutFileName%whichSide%, OutDir%whichSide%
if (InStr(fileExist(OutDir%whichSide%), "D")) {
toFocus:=OutFileName%whichSide%
EcurrentDir%whichSide%:=OutDir%whichSide%

renderCurrentDir()

} else {
; p(fileExist(currentDir))
EcurrentDir%whichSide%:=lastDir%whichSide%
GuiControl, Text,vcurrentDirEdit%whichSide%, % EcurrentDir%whichSide%

if (focused!="changePath") {
renderCurrentDir()
}
; lastDir:=currentDir
}

}
Gui, ListView, vlistView%whichSide%
}

findNextDirNameNumberIteration(path)
{
global left
global right
SplitPath, path, OutFileName, OutDir, OutExtension, OutNameNoExt, OutDrive
getLeftRight(OutNameNoExt, "*")
pathToCheck:=OutDir "\" left right
incrementNumber:=2
while (FileExist(pathToCheck)) {
pathToCheck:=OutDir "\" left incrementNumber right
incrementNumber++
}
return pathToCheck
}

getLeftRight(string, needle)
{
global left
global right
asteriskPos:=InStr(string, "*")
left:=SubStr(string, 1, asteriskPos-1)
right:=SubStr(string, asteriskPos+1)
}

ShellContextMenu(folderPath, files, win_hwnd = 0 )
{
if ( !folderPath )
return
if !win_hwnd
{
Gui,SHELL_CONTEXT:New, +hwndwin_hwnd
Gui,Show
}

If sPath Is Not Integer
DllCall("shell32\SHParseDisplayName", "Wstr", folderPath, "Ptr", 0, "Ptr*", pidl, "Uint", 0, "Uint", 0)
else
DllCall("shell32\SHGetFolderLocation", "Ptr", 0, "int", folderPath, "Ptr", 0, "Uint", 0, "Ptr*", pidl)
DllCall("shell32\SHBindToObject","Ptr",0,"Ptr",pidl,"Ptr",0,"Ptr",GUID4String(IID_IShellFolder,"{000214E6-0000-0000-C000-000000000046}"),"Ptr*",pIShellFolder)

length:=files.Length()
VarSetCapacity(apidl, length * A_PtrSize, 0)
for k, v in files {
;IShellFolder:ParseDisplayName
DllCall(VTable(pIShellFolder,3),"Ptr", pIShellFolder,"Ptr",win_hwnd,"Ptr",0,"Wstr",v,"Uint*",0,"Ptr*",tmpPIDL,"Uint*",0)
NumPut(tmpPIDL, apidl, (k - 1)*A_PtrSize, "Ptr")
}
;IShellFolder->GetUIObjectOf
DllCall(VTable(pIShellFolder,10),"Ptr",pIShellFolder,"Ptr",win_hwnd,"Uint",length,"Ptr",&apidl,"Ptr",GUID4String(IID_IContextMenu,"{000214E4-0000-0000-C000-000000000046}"),"UINT*",0,"Ptr*",pIContextMenu)

ObjRelease(pIShellFolder)
CoTaskMemFree(pidl)

hMenu := DllCall("CreatePopupMenu")
;IContextMenu->QueryContextMenu
;http://msdn.microsoft.com/en-us/library/bb776097%28v=VS.85%29.aspx
DllCall(VTable(pIContextMenu, 3), "Ptr", pIContextMenu, "Ptr", hMenu, "Uint", 0, "Uint", 3, "Uint", 0x7FFF, "Uint", 0x100) ;CMF_EXTENDEDVERBS
; p(hMenu)
ComObjError(0)
global pIContextMenu2 := ComObjQuery(pIContextMenu, IID_IContextMenu2:="{000214F4-0000-0000-C000-000000000046}")
global pIContextMenu3 := ComObjQuery(pIContextMenu, IID_IContextMenu3:="{BCFCE0A0-EC17-11D0-8D10-00A0C90F2719}")
e := A_LastError ;GetLastError()
ComObjError(1)
if (e != 0)
goTo, StopContextMenu
Global WPOld:= DllCall("SetWindowLongPtr", "Ptr", win_hwnd, "int",-4, "Ptr",RegisterCallback("WindowProc"),"UPtr")
DllCall("GetCursorPos", "int64*", pt)
; DllCall("InsertMenu", "Ptr", hMenu, "Uint", 0, "Uint", 0x0400|0x800, "Ptr", 2, "Ptr", 0)
; DllCall("InsertMenu", "Ptr", hMenu, "Uint", 0, "Uint", 0x0400|0x002, "Ptr", 1, "Ptr", &sPath)
idn := DllCall("TrackPopupMenuEx", "Ptr", hMenu, "Uint", 0x0100|0x0001, "int", pt << 32 >> 32, "int", pt >> 32, "Ptr", win_hwnd, "Uint", 0)
; p(idn)
; return
; Formatter ignores block comments for now, nbd
        /*
        typedef struct _CMINVOKECOMMANDINFOEX {
            DWORD   cbSize;          0
            DWORD   fMask;           4
            HWND    hwnd;            8
            LPCSTR  lpVerb;          8+A_PtrSize
            LPCSTR  lpParameters;    8+2*A_PtrSize
            LPCSTR  lpDirectory;     8+3*A_PtrSize
            int     nShow;           8+4*A_PtrSize
            DWORD   dwHotKey;        12+4*A_PtrSize
            HANDLE  hIcon;           16+4*A_PtrSize
            LPCSTR  lpTitle;         16+5*A_PtrSize
            LPCWSTR lpVerbW;         16+6*A_PtrSize
            LPCWSTR lpParametersW;   16+7*A_PtrSize
            LPCWSTR lpDirectoryW;    16+8*A_PtrSize
            LPCWSTR lpTitleW;        16+9*A_PtrSize
            POINT   ptInvoke;        16+10*A_PtrSize
        } CMINVOKECOMMANDINFOEX, *LPCMINVOKECOMMANDINFOEX;
        http://msdn.microsoft.com/en-us/library/bb773217%28v=VS.85%29.aspx
        */
struct_size := 16+11*A_PtrSize
VarSetCapacity(pici,struct_size,0)
NumPut(struct_size,pici,0,"Uint") ;cbSize
NumPut(0x4000|0x20000000|0x00100000,pici,4,"Uint") ;fMask
NumPut(win_hwnd,pici,8,"UPtr") ;hwnd
NumPut(1,pici,8+4*A_PtrSize,"Uint") ;nShow
NumPut(idn-3,pici,8+A_PtrSize,"UPtr") ;lpVerb
NumPut(idn-3,pici,16+6*A_PtrSize,"UPtr") ;lpVerbW
NumPut(pt,pici,16+10*A_PtrSize,"Uptr") ;ptInvoke

DllCall(VTable(pIContextMenu, 4), "Ptr", pIContextMenu, "Ptr", &pici) ; InvokeCommand

DllCall("GlobalFree", "Ptr", DllCall("SetWindowLongPtr", "Ptr", win_hwnd, "int", -4, "Ptr", WPOld,"UPtr"))
DllCall("DestroyMenu", "Ptr", hMenu)
StopContextMenu:
ObjRelease(pIContextMenu3)
ObjRelease(pIContextMenu2)
ObjRelease(pIContextMenu)
pIContextMenu2:=pIContextMenu3:=WPOld:=0
Gui,SHELL_CONTEXT:Destroy
return idn
}
WindowProc(hWnd, nMsg, wParam, lParam)
{
Global pIContextMenu2, pIContextMenu3, WPOld
If pIContextMenu3
{ ;IContextMenu3->HandleMenuMsg2
If !DllCall(VTable(pIContextMenu3, 7), "Ptr", pIContextMenu3, "Uint", nMsg, "Ptr", wParam, "Ptr", lParam, "Ptr*", lResult)
Return lResult
}
Else If pIContextMenu2
{ ;IContextMenu2->HandleMenuMsg
If !DllCall(VTable(pIContextMenu2, 6), "Ptr", pIContextMenu2, "Uint", nMsg, "Ptr", wParam, "Ptr", lParam)
Return 0
}
Return DllCall("user32.dll\CallWindowProcW", "Ptr", WPOld, "Ptr", hWnd, "Uint", nMsg, "Ptr", wParam, "Ptr", lParam)
}
VTable(ppv, idx)
{
Return NumGet(NumGet(1*ppv)+A_PtrSize*idx)
}

other_vtable(ptr, n) {
return NumGet(NumGet(ptr+0), n*A_PtrSize)
}

GUID4String(ByRef CLSID, String)
{
VarSetCapacity(CLSID, 16,0)
return DllCall("ole32\CLSIDFromString", "wstr", String, "Ptr", &CLSID) >= 0 ? &CLSID : ""
}
Guid_FromStr(sGuid, ByRef VarOrAddress)
{
if IsByRef(VarOrAddress) && (VarSetCapacity(VarOrAddress) < 16)
VarSetCapacity(VarOrAddress, 16) ; adjust capacity
pGuid := IsByRef(VarOrAddress) ? &VarOrAddress : VarOrAddress
if ( DllCall("ole32\CLSIDFromString", "WStr", sGuid, "Ptr", pGuid) < 0 )
throw Exception("Invalid GUID", -1, sGuid)
return pGuid ; return address of GUID struct
}
Guid_ToStr(ByRef VarOrAddress)
{
pGuid := IsByRef(VarOrAddress) ? &VarOrAddress : VarOrAddress
VarSetCapacity(sGuid, 78) ; (38 + 1) * 2
if !DllCall("ole32\StringFromGUID2", "Ptr", pGuid, "Ptr", &sGuid, "Int", 39)
throw Exception("Invalid GUID", -1, Format("<at {1:p}>", pGuid))
return StrGet(&sGuid, "UTF-16")
}
CoTaskMemFree(pv)
{
Return DllCall("ole32\CoTaskMemFree", "Ptr", pv)
}
FileToClipboard(PathToCopy,Method="copy")
{
FileCount:=0
PathLength:=0
FileCount:=PathToCopy.Length()
; Count files and total string length

for k, v in PathToCopy {
PathLength+=StrLen(v)
}
; Loop,Parse,PathToCopy,`n,`r
; {
; PathLength+=StrLen(A_LoopField)
; }

pid:=DllCall("GetCurrentProcessId","uint")
hwnd:=WinExist("ahk_pid " . pid)
; 0x42 = GMEM_MOVEABLE(0x2) | GMEM_ZEROINIT(0x40)
hPath := DllCall("GlobalAlloc","uint",0x42,"uint",20 + (PathLength + FileCount + 1) * 2,"UPtr")
pPath := DllCall("GlobalLock","UPtr",hPath)
NumPut(20,pPath+0),pPath += 16 ; DROPFILES.pFiles = offset of file list
NumPut(1,pPath+0),pPath += 4 ; fWide = 0 -->ANSI,fWide = 1 -->Unicode
Offset:=0
for k, v in PathToCopy {
offset += StrPut(v,pPath+offset,StrLen(v)+1,"UTF-16") * 2
}
; Loop,Parse,PathToCopy,`n,`r ; Rows are delimited by linefeeds (`r`n).
; offset += StrPut(A_LoopField,pPath+offset,StrLen(A_LoopField)+1,"UTF-16") * 2
;
DllCall("GlobalUnlock","UPtr",hPath)
DllCall("OpenClipboard","UPtr",hwnd)
DllCall("EmptyClipboard")
DllCall("SetClipboardData","uint",0xF,"UPtr",hPath) ; 0xF = CF_HDROP

; Write Preferred DropEffect structure to clipboard to switch between copy/cut operations
; 0x42 = GMEM_MOVEABLE(0x2) | GMEM_ZEROINIT(0x40)
mem := DllCall("GlobalAlloc","uint",0x42,"uint",4,"UPtr")
str := DllCall("GlobalLock","UPtr",mem)

if (Method="copy")
DllCall("RtlFillMemory","UPtr",str,"uint",1,"UChar",0x05)
else if (Method="cut")
DllCall("RtlFillMemory","UPtr",str,"uint",1,"UChar",0x02)
else
{
DllCall("CloseClipboard")
return
}

DllCall("GlobalUnlock","UPtr",mem)

cfFormat := DllCall("RegisterClipboardFormat","Str","Preferred DropEffect")
DllCall("SetClipboardData","uint",cfFormat,"UPtr",mem)
DllCall("CloseClipboard")
return
}

sortArrayByArray(toSort, sortWith, reverse=false, key=false)
{
global
array:=[]
finalAr:=[]
if (key) {
count:=0
for k, v in sortWith {
count++
array.Push({1:v[key], 2:count})
}
array:=ObjectSort(array, 1,, reverse)
for k in array {
finalAr.Push(toSort[array[k][2]])
}
} else {
for k in toSort {
array.Push([toSort[k],sortWith[k]])
}
array:=ObjectSort(array, 2,,reverse)
for k, v in array {
finalAr.Push(v[1])
}
}
return finalAr
}

;end of functions
;hotkeys
#if winactive(thisUniqueWintitle)
^e::
; revealFileInExplorer(EcurrentDir%whichSide%, getSelectedNames())
path:=getSelectedPaths()[1]
if (path) {
Run, % "explorer.exe /select,""" path """"
} else {
Run, % "explorer.exe """ EcurrentDir%whichSide% """"
}
return

#d::
if (focused="changePath") {
focused:="flistView"
GuiControl, Focus, vlistView%whichSide%
ComObjCreate("Shell.Application").ToggleDesktop()
submitAndRenderDir()
} else {
ComObjCreate("Shell.Application").ToggleDesktop()
}
return
$^+left::
if (focused="changePath" or focused="searchCurrentDirEdit") {
send, ^+{left}
return
}
gui, main:default
whichSide:=1
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
GuiControl, Focus, vlistView1 ;bad code
ControlFocus,, ahk_id %ListviewHwnd1%
GuiControl, +Background%BGColorOfSelectedPane%, vlistView1
GuiControl, +BackgroundWhite, vlistView2
EcurrentDir1:=EcurrentDir2
renderCurrentDir()
return
$^+right::
if (focused="changePath") {
send, ^+{right}
return
}
gui, main:default
whichSide:=2
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
GuiControl, Focus, vlistView2 ;bad code
ControlFocus,, ahk_id %ListviewHwnd2%
GuiControl, +Background%BGColorOfSelectedPane%, vlistView2
GuiControl, +BackgroundWhite, vlistView1
EcurrentDir2:=EcurrentDir1
renderCurrentDir()
return
left:: ;always uses keyboard hook
^left::
if (focused="changePath" or focused="searchCurrentDirEdit") {
thisHotkey:=StrReplace(A_ThisHotkey, "left", "{left}")
send, %thisHotkey%
return
}
^1::
selectPanel1:
gui, main:default
whichSide:=1
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
GuiControl, Focus, vlistView1 ;bad code
ControlFocus,, ahk_id %ListviewHwnd1%
GuiControl, +Background%BGColorOfSelectedPane%, vlistView1
GuiControl, +BackgroundWhite, vlistView2
return

right:: ;always uses keyboard hook
^right::
if (focused="changePath" or focused="searchCurrentDirEdit") {
thisHotkey:=StrReplace(A_ThisHotkey, "Right", "{Right}")
send, %thisHotkey%
return
}
^2::
selectPanel2:
gui, main:default
whichSide:=2
Gui, Show,NA,% EcurrentDir%whichSide% " - ahk_explorer"
GuiControl, Focus, vlistView2 ;bad code
ControlFocus,, ahk_id %ListviewHwnd2%
GuiControl, +Background%BGColorOfSelectedPane%, vlistView2
GuiControl, +BackgroundWhite, vlistView1

return
$RAlt::
if (focused="searchCurrentDirEdit" or focused="flistView" or focused="listViewInSearch") {
Run,"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe", % EcurrentDir%whichSide%
}
return

$RCtrl::
if (focused="searchCurrentDirEdit" or focused="flistView" or focused="listViewInSearch") {
Run,"%ComSpec%", % EcurrentDir%whichSide%
}
return
$RShift::
if (focused="searchCurrentDirEdit" or focused="flistView" or focused="listViewInSearch") {
toRun:= """" vscodePath """ """ EcurrentDir%whichSide% """"
run, %toRun%
} else {
send, +\
}
return

$\::
Gui, main:Default
if (focused="searchCurrentDirEdit" or focused="flistView" or focused="listViewInSearch") {
selectedPaths:=getSelectedPaths()
if (selectedPaths.Length()) {
for k,v in selectedPaths {
; toRun:= """" vscodePath """ """ v """"
toRun:= """" A_AhkPath """ /CP65001 ""lib\vscode_runner.ahk"" """ v """"
;  d(toRun)
run, %toRun%
}
}
} else {
send, \
}

return

; $`::
p(watching1,watching2)
Return

$^+r::
namesToMultiRename:=getSelectedNames()
multiRenameDir:=EcurrentDir%whichSide%
multiRenamelength:=namesToMultiRename.Length()
Gui, multiRenameGui:Default
; Gui,Font, s10, Segoe UI
Gui,Font, s10, Consolas

Gui, Add, Edit, w400 vmultiRenameTheName
Gui, Add, Edit, x+5 w300 vmultiRenameStartingNums

Gui, Add, Button, h30 w200 y+5 x+-705 ggmultiRenamePreview,preview
Gui, Add, Button, h30 w200 x+5 ggmultiRenameApply,apply

Gui, Add, ListBox, r%multiRenamelength% w500 y+5 vvmultiRenameTargets x+-405 , % array_ToVerticleBarString(selectedNames)
Gui, Add, ListBox, r%multiRenamelength% w500 x+5 vvmultiRenamePreview,
Gui, show,,multiRenameGui
return

$^r::
$esc::
stopSearching()
return

$^n::

return
$^+n::
Gui, createFolder:Default

creatingNewFolder:=true
dontSearch:=true
newFolderPath:=findNextDirNameNumberIteration(EcurrentDir%whichSide% "\New Folder *")
SplitPath, newFolderPath, newFolderName
strLen:=StrLen(newFolderName)
if (SubStr(newFolderName, 0)=" " and strLen > 1) {
newFolderName:=SubStr(newFolderName, 1, strLen-1)
}

if (!notFirstTimeCreatingFolder) {
notFirstTimeCreatingFolder:=true
Gui, createFolder: Font, s10, Segoe UI
;Segoe UI
gui, createFolder: add, text,, Folder Name: ; Save this control's position and start a new section.
gui, createFolder: add, edit, w250 vcreateFolderName hwndfolderCreationHwnd, %newFolderName%
gui, createFolder: add, button, Default w125 x11 vcreate gcreateLabel,Create Folder`n{Enter}
gui, createFolder: add, button, w125 x+2 vcreateAndOpen gcreateAndOpenLabel,Create and Open`n{Shift + Enter}
} else {
; GuiControl, text, createFolderName, %newFolderName%
ControlSetText,, %newFolderName%, ahk_id %folderCreationHwnd%
SendMessage, 0xB1, 0, -1,, % "ahk_id " folderCreationHwnd
}
gui, createFolder: show,, create_folder
dontSearch:=false

return
^s::
selectedNames:=getSelectedNames()
for notUsed, name in selectedNames {
Run, "%spekPath%" "%name%", % EcurrentDir%whichSide%
}
return

!h::
hashFiles("sha256")
return

^h::
hashFiles("md5")
return

^+e::
selectedNames:=getSelectedNames()
for notUsed, name in selectedNames {
SplitPath, name,,,, OutNameNoExt
FileRecycle, % EcurrentDir%whichSide% "\" OutNameNoExt ".exe"
Run, "%Ahk2ExePath%" /in "%name%" /bin "%Ahk2ExePath%\..\Unicode 32-bit.bin", % EcurrentDir%whichSide%
}
return
!c::
copySelectedNames:
Gui, main:Default
dontSearch:=true
selectedNames:=getSelectedNames()
finalStr=
length:=selectedNames.Length()
for k, v in selectedNames {
if (k=length) {
finalStr.=v
}
else {
finalStr.=v "`n"
}
}
clipboard:=finalStr
dontSearch:=false

#Persistent
ToolTip, % length
SetTimer, RemoveToolTip,-1000
return

copySelectedPaths:
^+c::
Gui, main:Default
dontSearch:=true
selectedNames:=getSelectedNames()
finalStr=
length:=selectedNames.Length()
for k, v in selectedNames {
if (k=length) {
finalStr.=EcurrentDir%whichSide% "\" v
}
else {
finalStr.=EcurrentDir%whichSide% "\" v "`n"
}
}
clipboard:=finalStr
dontSearch:=false

#Persistent
ToolTip, % length
SetTimer, RemoveToolTip,-1000
return

return

$!left::
focusDirOnBack:=true
goToParentDir:
Gui, main:Default
SplitPath, % EcurrentDir%whichSide%,OutDirName, ParentDir1
if (focusDirOnBack) {
focusDirOnBack:=false
toFocus:=OutDirName
}

EcurrentDir%whichSide%:=ParentDir1
renderCurrentDir()
return

$!right::
Gui, main:Default
undoHistory%whichSide%.Push(EcurrentDir%whichSide%)
EcurrentDir%whichSide%:=dirHistory%whichSide%[dirHistory%whichSide%.Length()]
dirHistory%whichSide%.RemoveAt(dirHistory%whichSide%.Length())
cannotDirHistory%whichSide%:=true
renderCurrentDir()
return

$!up::
Gui, main:Default
EcurrentDir%whichSide%:=undoHistory%whichSide%[undoHistory%whichSide%.Length()]
undoHistory%whichSide%.RemoveAt(undoHistory%whichSide%.Length())
renderCurrentDir()
return

^l::
/::
; p(434)
focused:="changePath"
ControlFocus,, % "ahk_id " Edithwnd%whichSide%
SendMessage, 177, 0, -1,, % "ahk_id " Edithwnd%whichSide%
return

$backspace::
Gui, main:Default
if (focused="changePath" or focused="renaming") {
send, {backspace}
} else if (focused="listViewInSearch") {
if (searchString%whichSide%="") {
stopSearching()
} else {
GuiControl, focus,vcurrentDirEdit%whichSide%
SendMessage, 0xB1, -2, -1,, % "ahk_id " Edithwnd%whichSide%
send, {backspace}
}
} else if (focused="searchCurrentDirEdit") {
if (searchString%whichSide%="") {
stopSearching()
} else {
send, {backspace}
}
} else if (focused="flistView") {
gosub,goToParentDir
}
return
$^+up::
gosub, shiftUp
gosub, shiftUp
return

shiftUp:
$+up::
Gui, main:Default
Gui, ListView, vlistView%whichSide%

focusRow:=LV_GetNext(0, "F")

before:=LV_GetNext(focusRow - 2)
if (focusRow - 1 > 0) {
if (before=focusRow - 1) {
LV_Modify(focusRow, "-Select -Focus")
LV_Modify(focusRow - 1,"+Select +Focus Vis")
} else {
LV_Modify(focusRow - 1,"+Select +Focus Vis")
}
} else {
numberOfRows:=LV_GetCount()
LV_Modify(numberOfRows,"+Select +Focus Vis")
}
return
$^up::
Gui, main:Default
Gui, ListView, vlistView%whichSide%
selectedRow:=LV_GetNext()
rowToSelect:=selectedRow-1

if (rowToSelect>0) {
LV_Modify(rowToSelect, "+Select +Focus Vis") ; select
}
return
$up::
Gui, main:Default
Gui, ListView, vlistView%whichSide%
selectedRow:=LV_GetNext()
numberOfRows:=LV_GetCount()
loop % numberOfRows
{
LV_Modify(A_Index, "-Select -Focus") ; select
}

if (selectedRow<2) {
LV_Modify(numberOfRows, "+Select +Focus Vis") ; select
}
else {
LV_Modify(selectedRow-1, "+Select +Focus Vis") ; select
}
return
$+home::
if (focused="changePath" or focused="searchCurrentDirEdit") {
send, +{home}
return
}
Gui, main:Default
Gui, ListView, vlistView%whichSide%
selectedRow:=LV_GetNext()
loop % selectedRow - 1 {
LV_Modify(A_Index, "+Select +Focus Vis") ; select
}

return
$+end::
if (focused="changePath" or focused="searchCurrentDirEdit") {
send, +{end}
return
}
Gui, main:Default
Gui, ListView, vlistView%whichSide%
selectedRow:=LV_GetNext()
numberOfRows:=LV_GetCount()
loop % numberOfRows - selectedRow
{
LV_Modify(A_Index + selectedRow, "+Select +Focus Vis") ; select
}

return
selectCurrent:
Gui, main:Default
Gui, ListView, vlistView%whichSide%
selectedRow:=LV_GetNext(,"F")
LV_Modify(selectedRow, "-Select -Focus") ; select
LV_Modify(selectedRow, "+Select +Focus Vis") ; select
return

$^+down::
gosub, shiftDown
gosub, shiftDown
return
shiftDown:
$+down::
Gui, main:Default
Gui, ListView, vlistView%whichSide%

focusRow:=LV_GetNext(0, "F")
after:=LV_GetNext(focusRow)
numberOfRows:=LV_GetCount()

if (focusRow < numberOfRows) {
if (after=focusRow + 1) {
LV_Modify(focusRow, "-Select -Focus")
LV_Modify(focusRow + 1,"+Select +Focus Vis")
} else {
LV_Modify(focusRow + 1,"+Select +Focus Vis")
}
} else {
LV_Modify(1,"+Select +Focus Vis")
}

return
$^down::
Gui, main:Default
Gui, ListView, vlistView%whichSide%

selectedRow:=0
index:=0
loop {
index:=LV_GetNext(index)
if (!index)
break
selectedRow:=index
}
LV_Modify(selectedRow+1, "+Select +Focus Vis") ; select
return

$down::
SetTimer, downLabel ,-0
return
downLabel:
Gui, main:Default
Gui, ListView, vlistView%whichSide%

selectedRows:=[]
selectedRow:=0
index:=0
loop {
index:=LV_GetNext(index)
if (!index)
break
selectedRow:=index
selectedRows.Push(index)
}
for k, v in selectedRows {
LV_Modify(v, "-Select -Focus") ; select
}

numberOfRows:=LV_GetCount()
if (selectedRow=0) {
LV_Modify(1, "+Select +Focus Vis") ; select
}
else if (selectedRow < numberOfRows) {
LV_Modify(selectedRow+1, "+Select +Focus Vis") ; select
}
else {
LV_Modify(1, "+Select +Focus Vis") ; select
}
return
;how to fix $enter not working ? why ?
;sign out and sign in fixed it
$enter::
Gui, main:Default
if (!canRename) {
if (focused="flistView" or focused="searchCurrentDirEdit" or focused="listViewInSearch") {
stopSizes:=false
gui, ListView, vlistView%whichSide%
for unused, fullPath in getSelectedPaths() {
doubleClickedFolderOrFile(fullPath)
}
; row:=LV_GetNext("")
; doubleClickedNormal(row)
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
} else if (focused="changePath" or focused="renaming") {
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%
}
} else {
send, {enter}
}

return

#if winactive("renamingWinTitle ahk_class AutoHotkeyGUI")

$esc::
if (focused="flistView") {
if (canRename) {
canRename:=false
; gui, renameSimple:Default
; gui, submit
gui, main:Default
ControlFocus,, % "ahk_id " ListviewHwnd%whichSide%

gui, renameSimple:Default
gui, destroy
}
return
}
send, {enter}
return

#if winactive("create_folder ahk_class AutoHotkeyGUI")

$enter::
Gosub, createLabel

return

$+enter::
$^+enter::
Gosub, createAndOpenLabel
return
