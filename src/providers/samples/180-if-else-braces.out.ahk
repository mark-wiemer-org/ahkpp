; [Issue #180](https://github.com/mark-wiemer-org/ahkpp/issues/180)
if (true) {
    foo()
} else {
    foo()
    bar()
}

if (true) {
    foo()
} else
    foo()
bar()

if (true)
    foo()
else {
    foo()
    bar()
}

{
    if (true) {
        return
    } else
        return
    ExitApp
}