---
name: Highlighter / code coloring bug
about: Report a bug with the code coloring.
title: ''
labels: bug
assignees: mark-wiemer
---

## Code snippet

<!-- Insert a small code snippet here that shows your issue -->

```
; Hello world
```

## Expected behavior

Comment should be green in Dark+ theme <!-- (F1 > Preferences: Color Theme) -->

## Editor tokens and scopes

<!-- F1 > Developer: Inspect Editor Tokens and Scopes, copy-paste plaintext -->

·Hello·world12 chars
language ahk
standard token type Comment
foreground #6A9955
background #1E1E1E
contrast ratio 5.00
textmate scopes comment.line.semicolon.ahk
source.ahk
foreground comment
{ "foreground": "#6A9955" }

## Additional context

See [Comments - Official AHK docs](https://www.autohotkey.com/docs/Language.htm#comments)

<!-- you can add screenshots here too to compare the colors against what they should be -->
