# AutoHotkey Plus Plus

AutoHotkey language support for VS Code, based off [AutoHotkey Plus by cweijan](https://github.com/cweijan/vscode-autohotkey).

> Visit the [project site](https://github.com/mark-wiemer/vscode-autohotkey)

## Contents

-   [Coffee](#coffee)
-   [Install](#install)
-   [Debug](#debug)
-   [Language Features](#language-features)
    -   [IntelliSense](#intellisense)
    -   [Function Symbol](#function-symbol)
    -   [Goto Definition](#goto-definition)
    -   [Find References](#find-references)
    -   [Code Symbol](#code-symbol)
    -   [Hover Tip](#hover-tip)
    -   [Code Format](#code-format)
-   [Context Menu](#context-menu)
-   [Setting](#setting)
-   [Credits](#credits)

## Coffee

If you like this this extension, consider [buying the orignal author a coffee](https://www.buymeacoffee.com/cweijan). Thank you!

## Install

Install from VS Code Marketplace: [Install AutoHotkey Plus Plus](https://marketplace.visualstudio.com/items?itemName=mark-wiemer.vscode-autohotkey-plus-plus).

## Debug

1. Click Run or press F9.
2. Debugger supports breakpoints, stack tracing, and variable watching
   ![Debug](image/debug.gif)

### Debug Features

1. **Output Message**: You can use `OutputDebug` command instead of `MsgBox` to log values.
   ![Output](image/output.jpg)
2. **Evaluate**: Set and get variable values through the debug console.
   ![Evaluate](image/evalute.jpg)

This extension provides basic debugging functions. If you need more debugging functions (such as conditional breakpoints), you can add an additional extension: [Install vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

## Language Features

### IntelliSense

Supports IntelliSense for variables and functions.

### Function Symbol

1. Detach source function as symbol
2. You can add a comment to the function using a semicolon on the line above the function declaration

![Function Symbol](image/functionSymbol.jpg)

### Goto Definition

1. Support goto function and variable definition.
2. Usage: Ctrl-click on the symbol to navigate to its definition.

![Goto Definition](image/gotoDefinition.jpg)

### Find Symbol References

Usage: Move coordinates to symbol, then:

-   Right-click on a symbol, then select `Find All References`.
-   Or press `Shift + F12`.

### Code Symbol

Usage: Add two semicolon to comment code block
![Code Symbol](image/codeSymbol.jpg)

### Hover Tip

Usage: Move mouse to function call or command.
![Hover](image/hover.png)

### Code Format

Supports standard VS Code formatting.

> Formatter is not currently customizable.

![Code Format](image/codeFormat.jpg)

## Context Menu

Run and compile code from the context menu.

Right-click to open the context menu, then:

-   **Run**: Run script without debug (`Ctrl + F9`).
-   **Compile**: Compile script in same directory (`Ctrl + Shift + F9`).
    ![compile](image/compile.jpg)

## Setting

Find more info in VS Code settings for `AutoHotkey Plus Plus`.

## Credits

Previous extensions:

-   [AutoHotkey Plus](https://github.com/cweijan/vscode-autohotkey)
-   [AutoHotkey](https://github.com/stef-levesque/vscode-autohotkey)
