# vscode-autohotkey-Plus

> Project site: [vscode-autohotkey-plus](https://github.com/cweijan/vscode-autohotkey)

AutoHotKey language support for VS Code
- [vscode-autohotkey-Plus](#vscode-autohotkey-plus)
  - [Before all](#before-all)
  - [Coffee](#coffee)
  - [Install](#install)
  - [Debug](#debug)
  - [Language Features](#language-features)
    - [IntelliSense](#intellisense)
    - [Method Symbol](#method-symbol)
    - [Goto Definition](#goto-definition)
    - [Find References](#find-references)
    - [Code Symbol](#code-symbol)
    - [Hover Tip](#hover-tip)
    - [Code Format](#code-format)
  - [Context Menu](#context-menu)
  - [Setting](#setting)
  - [Credits](#credits)

## Before all

Parser is using regex, so it is not perfect, please understand this.

## Coffee

If you like this this extension, consider [buying me a coffee](https://www.buymeacoffee.com/cweijan). Thank you!

## Install

Install from vscode marketplace [vscode-autohotkey-plus](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus).

## Debug
1. Click run button or press F9.
2. Support breakpoint、stacktrace、variable
![debug](image/debug.gif)

**Features:**
1. **Output Message**: you can using `OutputDebug` command instead MsgBox.
![output](image/output.jpg)
2. **Evalute**: Set and get variable in debug evaluter.![evalute](image/evalute.jpg)

This extension provides basic debugging functions. If you need more debugging functions(Like **conditional breakpoint**), you can to add additional extension [vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

## Language Features

### IntelliSense

Supports intelliSense for variables and methods.

### Method Symbol
1. Detech source method as symbol
2. You can add a comment to the method using a semicolon on the previous line of the method

![methodSymbol](image/methodSymbol.jpg)

### Goto Definition

1. Support goto method and variable definition.
2. Usage: Press ctrl and move the mouse coordinates to the calling code.

![gotoDefinition](image/gotoDefinition.jpg)

### Find References

Usage: Move coordinates to method, then:
- Right click then click find all references.
- Or press `shift+f12`.

### Code Symbol

Usage: Add two semicolon to comment code block
![codeSymbole](image/codeSymbol.jpg)

### Hover Tip

Usage: Move mouse to method call or command.
![hover](image/hover.png)

### Code Format
Usage:
- Right click then click format document.
- Or press `Shift+Alt+F`.

- **Formatter follows my coding habits, so it may not unsuited for you**.
![codeFormat](image/codeFormat.jpg)

## Context Menu
Usage: Right click, then:
- **Run**: Run script without debug(Shortcut: Ctrl+F9).
- **Compile**: Compile script in same directory(Shortcut: Ctrl+Shift+F9).
![compile](image/compile.jpg)

## Setting

OpenSetting -> extensions -> Ahk Plus
![settings](image/settings.jpg)

## Credits
- [vscode-autohotkey](https://github.com/stef-levesque/vscode-autohotkey)
