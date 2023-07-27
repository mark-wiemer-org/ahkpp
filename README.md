# AutoHotkey Plus Plus (AHK++)

AutoHotkey Plus Plus (AHK++) provides AutoHotkey language support for VS Code. This includes:

-   IntelliSense
-   code highlighting
-   basic debug support
-   code formatting
-   ...and more!

AHK++ is a fork of [AutoHotkey Plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus) with the primary goal of fixing bugs and adding user-requested features.

> View this README on [GitHub](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus#readme)

> Currently, AHK++ officially supports only AHK v1. AHK v2 will likely work, but please open issues and be patient if complex workflows are not supported. See [issue 146: Support AHK v2](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/146)

## Contents

-   [Why AutoHotkey Plus Plus?](#why-autohotkey-plus-plus)
-   [Install](#install)
-   [Commands](#commands)
-   [Debug](#debug)
-   [Language features](#language-features)
    -   [IntelliSense](#intellisense)
    -   [Function symbol](#function-symbol)
    -   [Go to definition](#go-to-definition)
    -   [Find references](#find-symbol-references)
    -   [Hover tip](#hover-tip)
    -   [Outline](#outline)
    -   [Folding](#folding)
    -   [Code format](#code-format)
        -   [Formatter directives](#formatter-directives)
-   [Credits](#credits)

## Why AutoHotkey Plus Plus?

AutoHotkey Plus Plus is one of many extensions that offer VS Code language support. So why should you use this one?

-   **IntelliSense**: Smart code completion, syntax highlighting, code navigation, and more.
-   **Actively maintained**: Any issues encountered while using this extension can be reported and fixed. With other extensions, anything that's broken will stay broken forever. You can report any issues with AHK++ (and view all issues) through the [issue tracker](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues).
-   **Debug support**: Run and debug AHK scripts from VS Code.
-   **New features**: Another benefit to active maintenance is that AHK++ can add new features as users request them.

## Install

Install from VS Code or install from VS Code Marketplace: [Install AutoHotkey Plus Plus](https://marketplace.visualstudio.com/items?itemName=mark-wiemer.vscode-autohotkey-plus-plus).

## Commands

With AHK++, you can compile, debug, and run your scripts with keyboard shortcuts. You can also run a selection as a standalone script.

-   Compile: `Ctrl + Shift + F9`
-   Debug: `Ctrl + Alt + F9`
-   Open help: `Ctrl + F1`
-   Run: `Ctrl + F9`
-   Run selection: `Ctrl + F8`

## Debug

> There are some [known issues with the debugger](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues?q=is%3Aopen+is%3Aissue+label%3Adebugger). If you need an advanced setup, we recommend [zero-plusplus.vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

1. Click the debug button in the editor title menu (at the top right of the editor) or press `Ctrl + Alt + F9`.
2. The debugger supports breakpoints, stack tracing, and variable watching

    ![Debug](image/debug.gif)

### Debug features

1. **Output message**: You can use `OutputDebug` command instead of `MsgBox` to log values.

    ![Output](image/output.jpg)

2. **Evaluate**: Set and get variable values through the debug console.

    ![Evaluate](image/evalute.jpg)

This extension provides basic debugging functions. If you need more debugging functions (such as conditional breakpoints), you can add an additional extension: [Install vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

## Language Features

### IntelliSense

Supports IntelliSense for variables and functions.

### Function symbol

1. You can add a comment to the function using a semicolon on the line above the function declaration

### Go to definition

1. Supports navigation to symbol definition.
2. Usage: Ctrl-click on the symbol to navigate to its definition.

![Goto Definition](image/gotoDefinition.jpg)

### Find symbol references

Select a symbol, then:

-   Right-click and select `Find All References`.
-   Or press `Shift + F12`.

### Hover tip

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

### Code format

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

## Credits

Previous extensions:

-   [AutoHotkey Plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus)
-   [AutoHotkey by stef-levesque](https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-autohotkey)
