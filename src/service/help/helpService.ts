// openHelp adapted from thqby/vscode-autohotkey2-lsp, used under GNU LGPLv3, licensed here under GNU GPLv3
// https://github.com/thqby/vscode-autohotkey2-lsp/blob/fa0782e8a221e54e5755358eb594ae9cc872ca1a/client/src/extension.ts#L348
import { ConfigKey, Global } from '../../common/global';
import { existsSync } from 'fs';
import * as vscode from 'vscode';
import * as child_process from 'child_process';

/**
 * Returns the text to use as a search.
 * If no text selected, returns the word at selection position.
 */
const getSearchText = (
    document: Pick<vscode.TextDocument, 'getText' | 'getWordRangeAtPosition'>,
    selection: vscode.Selection,
) =>
    document.getText(selection) ||
    document.getText(document.getWordRangeAtPosition(selection.active));

export async function openHelp() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const helpPath = Global.getConfig<string>(ConfigKey.helpPath);
    const searchText = getSearchText(editor.document, editor.selection);
    const executePath = Global.getConfig<string>(ConfigKey.executePath);
    if (executePath && existsSync(executePath)) {
        const script = `
#NoTrayIcon
#DllLoad oleacc.dll
; Find existing help window if it exists and set it on top
chm_hwnd := 0, chm_path := '${helpPath}', DetectHiddenWindows(true), !(WinGetExStyle(top := WinExist('A')) & 8) && (top := 0)
for hwnd in WinGetList('AutoHotkey ahk_class HH Parent')
    for item in ComObjGet('winmgmts:').ExecQuery('SELECT CommandLine FROM Win32_Process WHERE ProcessID=' WinGetPID(hwnd))
        if InStr(item.CommandLine, chm_path) {
            chm_hwnd := WinExist(hwnd)
            break 2
        }
if top && top != chm_hwnd
    WinSetAlwaysOnTop(0, top)

; Create new help window if necessary
if !chm_hwnd
    Run(chm_path, , , &pid), chm_hwnd := WinWait('AutoHotkey ahk_class HH Parent ahk_pid' pid)

; Show the window and wait for control
WinShow(), WinActivate(), WinWaitActive(), ctl := 0, endt := A_TickCount + 3000
while (!ctl && A_TickCount < endt)
    try ctl := ControlGetHwnd('Internet Explorer_Server1')

; Assign magic value to a pointer
NumPut('int64', 0x11CF3C3D618736E0, 'int64', 0x719B3800AA000C81, IID_IAccessible := Buffer(16))

; Send the search if user has selected something
if ${!!searchText} && !DllCall('oleacc\\AccessibleObjectFromWindow', 'ptr', ctl, 'uint', 0, 'ptr', IID_IAccessible, 'ptr*', IAccessible := ComValue(13, 0)) {
    ; Get the HTML window of the opened help file
    IServiceProvider := ComObjQuery(IAccessible, IID_IServiceProvider := '{6D5140C1-7436-11CE-8034-00AA006009FA}')
    NumPut('int64', 0x11D026CB332C4427, 'int64', 0x1901D94FC00083B4, IID_IHTMLWindow2 := Buffer(16))
    ComCall(3, IServiceProvider, 'ptr', IID_IHTMLWindow2, 'ptr', IID_IHTMLWindow2, 'ptr*', IHTMLWindow2 := ComValue(9, 0))

    ; Execute the search
    IHTMLWindow2.execScript('
    (
        document.querySelector('#head > div > div.h-tabs > ul > li:nth-child(3) > button').click()
        searchinput = document.querySelector('#left > div.search > div.input > input[type=search]')
        keyevent = document.createEvent('KeyboardEvent')
        keyevent.initKeyboardEvent('keyup', false, true, document.defaultView, 13, null, false, false, false, false)
        searchinput.value = '${searchText}'
        searchinput.dispatchEvent(keyevent)
        Object.defineProperties(keyevent, { type: { get: function() { return 'keydown' } }, which: { get: function() { return 13 } } })
        searchinput.dispatchEvent(keyevent)
    )')
}`;
        child_process.execSync(`"${executePath}" /ErrorStdOut *`, {
            input: script,
        });
    }
}
