# AutoHotkey Plus Plus (AHK++)

AutoHotkey Plus Plus (AHK++) provides AutoHotkey language support for VS Code. This includes:

-   IntelliSense
-   code highlighting
-   basic debug support
-   code formatting
-   ...and more!

> Currently, AHK++ officially supports only AHK v1. AHK v2 will likely work, but please open issues and be patient if complex workflows are not supported. See [issue 146: Support AHK v2](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/146)

AHK++ is a fork of [AutoHotkey Plus by cweijan](https://github.com/AutoHotkey-Plus/vscode-autohotkey), with the primary goal of fixing bugs and adding user-requested features.

> View this README on the [project site](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus#readme)

## Contents

-   [Why AutoHotkey Plus Plus?](#why-autohotkey-plus-plus)
-   [Install](#install)
-   [Commands](#commands)
-   [Debug](#debug)
-   [Language Features](#language-features)
    -   [IntelliSense](#intellisense)
    -   [Function Symbol](#function-symbol)
    -   [Go To Definition](#go-to-definition)
    -   [Find References](#find-symbol-references)
    -   [Hover Tip](#hover-tip)
    -   [Outline](#outline)
    -   [Folding](#folding)
    -   [Code Format](#code-format)
        -   [Formatter Directives](#formatter-directives)
        -   [Align Selected Assignments](#align-selected-assignments)
-   [Credits](#credits)

## Why AutoHotkey Plus Plus?

AutoHotkey Plus Plus is one of many extensions that offer VS Code language support. So why should you use this one?

-   **IntelliSense**: Smart code completion, syntax highlighting, code navigation, and more.
-   **Actively Maintained**: Any issues encountered while using this extension can be reported and fixed. With other extensions, anything that's broken will stay broken forever. You can report any issues with AHK++ (and view all issues) through the [issue tracker](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues).
-   **Debug Support**: Run and debug AHK scripts from VS Code.
-   **New Features**: Another benefit to active maintenance is that AHK++ can add new features as users request them.

## Install

Install from VS Code or install from VS Code Marketplace: [Install AutoHotkey Plus Plus](https://marketplace.visualstudio.com/items?itemName=mark-wiemer.vscode-autohotkey-plus-plus).

## Commands

With AHK++, you can compile, debug, and run your scripts with keyboard shortcuts. You can also run a selection as a standalone script. Additionally, you can `Open Help` with `Ctrl + F1`.

-   Compile: `Ctrl + Shift + F9`
-   Debug: `F9`
-   Open Help: `Ctrl + F1`
-   Run: `Ctrl + F9`
-   Run Selection: `Ctrl + F8`
-   Align Selected Assignments: `Shift + Win + F`

## Debug

> There are some [known issues with the debugger](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues?q=is%3Aopen+is%3Aissue+label%3Adebugger). If you need an advanced setup, we recommend [zero-plusplus.vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

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

1. You can add a comment to the function using a semicolon on the line above the function declaration

### Go to Definition

1. Supports navigation to symbol definition.
2. Usage: Ctrl-click on the symbol to navigate to its definition.

![Goto Definition](image/gotoDefinition.jpg)

### Find Symbol References

Select a symbol, then:

-   Right-click and select `Find All References`.
-   Or press `Shift + F12`.

### Hover Tip

Usage: Hover over symbol to see IntelliSense documentation.

![Hover](image/hover.png)

### Outline

Assign name to block of code via double semicolon comment `;;Name` and go to it from outline.

![Block Name](image/blockName.png)

### Folding

Custom folding regions:

```autohotkey
;region
MsgBox % "Collapse me!"
;endregion

; Block comments with regions
/* ;region
Collapse me!
*/ ;endregion
```

### Code Format

Supports standard VS Code formatting with a few options.

![Code Format](image/codeFormat.jpg)

#### Formatter Directives

Formatter directives instruct the formatter to behave a certain way on sections of code.

1. `FormatBlockComment`:

    ```autohotkey
    ;@AHK++FormatBlockCommentOn
    /*
    ;All text inside block comment will be formatted like regular code.
    */
    ;@AHK++FormatBlockCommentOff
    ```

2. `AlignAssignment`:

    ```autohotkey
    ;@AHK++AlignAssignmentOn
    a          = 5 ; number five
    str        = legacy text = with equal symbol
    inputFile := "movie.mkv"
    abc       := "abc" ; string
    abc       := a + b
    ;@AHK++AlignAssignmentOff
    ```

#### Align Selected Assignments

Select assignments:

-   Right-click and select `Align Selected Assignments` from the context menu.
-   Or press `Shift + Win + F`.

![](image/align.gif)

Comments' indentations are preserved during alignment. You can add new variable assignment and re-align all assignments. Your manually aligned comments will stay in their original place.

![](image/alignAddVar.gif)

## Credits

Previous extensions:

-   [AutoHotkey Plus by cweijan](https://github.com/cweijan/vscode-autohotkey)
-   [AutoHotkey by stef-levesque](https://github.com/stef-levesque/vscode-autohotkey)
