; [Issue #28](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/28)
{
Switch SwitchValue {
Case CaseValue1:
Statements1
Return
Case CaseValue2a, CaseValue2b:
Statements2
Return
Default:
Statements3
Return
}
}

Switch SwitchValue
{
Case CaseValue1:
Statements1
Case CaseValue2a, CaseValue2b:
Statements2
Default:
Statements3
}

Switch SwitchValue
{
Case CaseValue1: Statements1
Case CaseValue1: Statements2
Default: Statements3
}
