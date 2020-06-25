# vscode-autohotkey-Plus

> Project site: [vscode-autohotkey-plus](https://github.com/cweijan/vscode-autohotkey)
>
> View the changes in the [changelog](/CHANGELOG.md)

AutoHotKey language support for VS Code
- [vscode-autohotkey-Plus](#vscode-autohotkey-plus)
  - [Debug](#debug)
  - [MethodSymbol](#methodsymbol)
  - [GotoDefinition](#gotodefinition)
  - [Script](#script)
  - [Setting](#setting)
  - [CodeSymbol](#codesymbol)
  - [CodeFormat](#codeformat)
  - [Credits](#credits)

## Debug
1. Click run button or press f9
2. Support breakpoint、stacktrace、variable
![debug](image/debug.gif)

**features:**
1. **Output Message**: you can using `OutputDebug` command instead MsgBox.
![output](image/output.jpg)
2. **Evalute**: Set and get variable in debug evaluter.![evalute](image/evalute.jpg)

## MethodSymbol
1. Detech source method as symbol
2. You can add a comment to the method using a semicolon on the previous line of the method

![methodSymbol](image/methodSymbol.jpg)

## GotoDefinition

1. Press ctrl and move the mouse coordinates to the calling code 
![gotoDefinition](image/gotoDefinition.jpg)

## Script
1. Right click.
- **Run**: run script without debug
- **Compile**: compile script in same directory.
![compile](image/compile.jpg)

## Setting

1. OpenSetting -> config
![settings](image/settings.jpg)

## CodeSymbol

1. You can add two semicolon to comment code block
![codeSymbole](image/codeSymbol.jpg)

## CodeFormat
1. Right click then click format document.
- **Formatter follows my coding habits, so it may not unsuited for you**.
![codeFormat](image/codeFormat.jpg)

## Credits
- [vscode-autohotkey](https://github.com/stef-levesque/vscode-autohotkey)