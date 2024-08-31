; [Issue #58](https://github.com/mark-wiemer-org/ahkpp/issues/58)
foo(bar
    , (baz))
x := 1

TaskName := "[RunAsTask] " A_ScriptName " @" SubStr("000000000" DllCall("NTDLL\RtlComputeCrc32"
    , "Int", 0, "WStr", CmdLine, "UInt", StrLen(CmdLine) * 2, "UInt"), -9)

x := 1