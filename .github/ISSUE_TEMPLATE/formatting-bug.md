---
name: Formatting bug
about: Report issues with code formatting
title: ''
labels: bug, formatter
assignees: mark-wiemer

---

### Description

Describe the issue. For example, "Statements in functions are indented one level more than expected."

### Unformatted input snippet

```autohotkey
; Insert the code you would write before you format it
; Keep the snippet small and simple so it's easier to analyze
foo() {
x := 1
}
```

### Expected formatted output snippet

```autohotkey
; Insert what you expect to see when you format the input snippet
; For consistency, use four spaces to indicate one level of indentation
foo() {
    x := 1
}
```

### Actual formatted output snippet

```autohotkey
; Insert the snippet you see when you format the code using the extension
; Keep it exactly as you see it so others can reproduce it
; This may be the same as the input snippet, but it is still helpful
foo() {
        x := 1
}
```

### Additional context

Optionally, you may provide similar snippets with similar behavior.
