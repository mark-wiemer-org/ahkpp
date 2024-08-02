# AutoHotkey Plus Plus (AHK++)

AutoHotkey Plus Plus (AHK++) provides AutoHotkey v1 and v2 language support for VS Code. This includes:

-   IntelliSense
-   code highlighting
-   debug support
-   code formatting
-   ...and more!

## 5.0.0 - AutoHotkey v2 support now in preview!

AutoHotkey v2 support has been a [long-requested feature](https://github.com/mark-wiemer-org/ahkpp/issues/96), and this release now supports nearly all functionality!

Supported features include:

-   Running and debugging v1 and v2 scripts without changing settings
-   "Open help" (Ctrl + F1) opens language-specific help (and includes your text selection!)
-   Full syntax highlighting for v2 scripts
-   Unique icons for v1 (blue) and v2 (green)

See the full changes at the [changelog](https://github.com/mark-wiemer-org/ahkpp/blob/main/Changelog.md).

For issues with the extension recognizing v1 files as v2, or vice-versa, refer to (issue 396)[https://github.com/mark-wiemer-org/ahkpp/issues/396]. Please [report any other issues](https://github.com/mark-wiemer-org/ahkpp/issues/new/choose) as well!

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
-   [Links](#links)

## Why AutoHotkey Plus Plus?

AutoHotkey Plus Plus is one of many extensions that offer VS Code language support. So why should you use this one?

-   **Supports both v1 and v2**: AHK++ now has support for AutoHotkey v2 (in preview), making it the only extension to support both major versions of AutoHotkey!
-   **Actively maintained**: Any issues encountered while using this extension can be reported and fixed. With other extensions, anything that's broken will stay broken forever. You can report any issues with AHK++ (and view all issues) through the [issue tracker](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues).
-   **IntelliSense**: Smart code completion, syntax highlighting, code navigation, and more.
-   **Debug support**: Run and debug AHK scripts from VS Code.
-   **New features**: Another benefit to active maintenance is that AHK++ can add new features as users request them. For example, quick help, formatter directives, and custom new file templates were all added based on user feedback!

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

This extension relies heavily on open-source code. A huge thank you to all these open-source participants who made the extension what it is today!

-   [AutoHotkey Plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus): AHK++ is a fork of AutoHotkey Plus by cweijan (Weijan Chen)
-   [Contributions to AHK++ by kyklish](https://github.com/mark-wiemer-org/ahkpp/commits/main?author=kyklish): Greatly improved formatting and snippets by both fixing bugs and adding features
-   [AutoHotkey v2 Language Support by thqby](https://marketplace.visualstudio.com/items?itemName=thqby.vscode-autohotkey2-lsp): The source of the v2 grammar and other great contributions
-   [Lexikos/vscode-auto-select](https://github.com/Lexikos/vscode-auto-select): The core code for automatically switching AHK versions
-   [AutoHotkey by stef-levesque](https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-autohotkey): AutoHotkey Plus is a fork of stef-levesque's original AutoHotkey extension, which provided the original grammar and snippets for AHK

## Links

-   [GitHub](https://github.com/mark-wiemer-org/ahkpp): View code, file bugs, and join discussions
-   [Reviews](https://marketplace.visualstudio.com/items?itemName=mark-wiemer.vscode-autohotkey-plus-plus&ssr=false#review-details): Help others discover AHK++ by leaving a review
