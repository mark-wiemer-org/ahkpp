#Requires AutoHotkey 1.1.33+
#SingleInstance force

; Basic debugger test
; Ensure you've run `npm i` before running this test
; 1. Stop on breakpoint
; 2. Step forward works -- Global variables updates
; 3. No errors in Debug Console

x := 1
y := 2 ; Breakpoint here
z := 3
