#Requires AutoHotkey 1.1.33+
#SingleInstance force

; Completion provider manual tests
; Use Ctrl+Space to trigger suggestions

; compTest comment
compTest(p1, p2) {
    p3 := 1
    ; Suggestions within method include locals
    p
}

; Suggestions outside of method exclude locals
p

; Default settings (enabled IntelliSense, enabled parsing) shows suggestions
c

; Disabled IntelliSense with enabled parsing shows no suggestions
c

; Enabled IntelliSense with disabled parsing shows no suggestions
c

; Disabled IntelliSense with disabled parsing shows no suggestions
c
