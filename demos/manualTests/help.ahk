#Requires AutoHotkey 1.1.33+
#SingleInstance force

; Select a word and use Ctrl+F1 to open help
; Click on a word (but don't select it), open help should still search that word
; Use open help when your cursor is on a blank line--no errors should occur

"potato" ; selecting that value (including quotes) should not cause an error

; Try 10 different words to ensure values load consistently
