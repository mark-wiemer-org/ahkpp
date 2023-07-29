# Changelog

<!-- PRs -- Find: `#([0-9]+)`, Replace `[PR #$1](https://github.com/vscode-autohotkey/ahkpp/pull/$1)` -->
<!-- Issues -- Find: `#([0-9]+)`, Replace `[#$1](https://github.com/vscode-autohotkey/ahkpp/issues/$1)` -->

## 4.0.0 - 2023-07-29 🍀

Minimal changes here, just following [semantic versioning](https://semver.org) since there are breaking changes.

Breaking changes:

-   Rename some settings. Users will have to manually adjust these new settings from the defaults to match their old settings:
    -   `ahk++.formatter.indentCodeAfterSharpDirective` is now `ahk++.formatter.indentCodeAfterIfDirective`
    -   `ahk++.language.enableIntellisense` is now `ahk++.intellisense.enableIntellisense`
    -   `ahk++.file.maximumParseLength` is now `ahk++.intellisense.maximumParseLength`

Other changes:

-   IntelliSense now suggests `foo(p1, p2)` instead of `foo (p1,p2)`
-   Improved descriptions of settings

## 3.3.3 - 2023-07-27 🏖️

-   Restore changes from 3.3.1. This release is the same as 3.3.1, except the debugger works.

## 3.3.2 - 2023-06-21 🪲

-   Revert changes in 3.3.1. This release is the same as 3.3.0. Ref [Issue #369](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/369)

## 3.3.1 (yanked) - 2023-06-20 🌞

> This release has been yanked, meaning it's not supported. Use v3.3.3 instead.

-   Various syntax highlighting improvements ([PR #354](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/pull/354), [PR #358](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/pull/358))
-   Running `Open help` while `tutorial` text is selected now opens the Tutorial page ([PR #348](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/pull/348))
-   Unexpected change: Break debugger.

## 3.3.0 - 2023-03-11 🪴

-   Add `ahk++.file.maximumParseLength` setting to support unlimited file size ([Issue #117](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/117))

Fixes:

-   Fix several syntax highlighting issues ([#85](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/85), [#318](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/318))
-   Fix minor debugger issues introduced in 3.1.0 ([#279](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/279))
-   Fix debugging a file with a space in its name ([#134](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/134))
-   Fix formatting for some bad labels (two colons) ([PR #325](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/pull/325))

## 3.2.0 - 2023-01-29 ❄️

-   Debug keyboard shortcut is now `Ctrl + Alt + F9` (was `F9`) to avoid conflicts with VS Code default shortcuts.
-   New setting: Snippet template name. Create your own template for new AHK files, including no template at all.
-   [Moving lines of code via commands](https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing) now (almost) correctly indents ([PR #306](https://github.com/vscode-autohotkey/ahkpp/pull/306), issue [#319](https://github.com/vscode-autohotkey/ahkpp/issues/319))
-   Snippets and keywords updated to AutoHotkey v1.1.36.0 ([PR #288](https://github.com/vscode-autohotkey/ahkpp/pull/288), [PR #298](https://github.com/vscode-autohotkey/ahkpp/pull/298))

Fixes:

-   Fix syntax highlighting for:

    -   strings with double colons in them ([PR #278](https://github.com/vscode-autohotkey/ahkpp/pull/278))
    -   conditional directives ([#69](https://github.com/vscode-autohotkey/ahkpp/issues/69))
    -   #Include and #IncludeAgain ([#86](https://github.com/vscode-autohotkey/ahkpp/issues/86))
    -   semi-colons without a preceding space (usually meant to be comments) ([#295](https://github.com/vscode-autohotkey/ahkpp/issues/295))

-   Fix formatting for:

    -   comments at the beginning of a code block ([#291](https://github.com/vscode-autohotkey/ahkpp/issues/291))
    -   `IfMsgBox` ([#290](https://github.com/vscode-autohotkey/ahkpp/issues/290))
    -   complex hotkeys ([#303](https://github.com/vscode-autohotkey/ahkpp/issues/303))
    -   object assignment within unbraced code blocks ([#316](https://github.com/vscode-autohotkey/ahkpp/issues/316))
    -   nested, unbraced code blocks ([PR #287](https://github.com/vscode-autohotkey/ahkpp/pull/287))

-   Fix hover message for doc comments to always be trimmed ([PR #308](https://github.com/vscode-autohotkey/ahkpp/pull/308))

## 3.1.0 - 2022-11-21 🦃

**Compiler**:

-   New compiler options in settings: Choose base file, file icon, and "use [MPRESS](https://www.autohotkey.com/mpress/mpress_web.htm)"
-   Add "Compiler GUI" command in context menu to use the AHK GUI when compiling

**Snippets**: Update snippets for AHK 1.1.35.00 and fix broken `InStr()` snippet ([#263](https://github.com/vscode-autohotkey/ahkpp/issues/263))

**Grammar**: Fix `#Requires` not being recognized ([#268](https://github.com/vscode-autohotkey/ahkpp/issues/268))

**Editor**: New AHK file icon (green square with white H)

**Debugger**: Minor debugger improvements

**Formatter**: Close the following bugs:

-   Formatter incorrectly indents object literals ([#184](https://github.com/vscode-autohotkey/ahkpp/issues/184), [#222](https://github.com/vscode-autohotkey/ahkpp/issues/222))
-   Nested one command code flow control ([#255](https://github.com/vscode-autohotkey/ahkpp/issues/255))

**Miscellaneous**: Extension should start up faster

## 3.0.0 - 2022-10-01 👻

This is "The Kyklish Release" because Kyklish wrote most of this code. Thank you!

Breaking changes:

-   Update file template: Add `#NoEnv` and `SetBatchLines, -1` ([PR #202](https://github.com/vscode-autohotkey/ahkpp/pull/202))

> Formatter bugfixes may be considered breaking if you wanted the old behaviors. If you want the old behavior, please [open an issue](https://github.com/vscode-autohotkey/ahkpp/issues/new?assignees=mark-wiemer&labels=bug%2C+formatter&template=formatting-bug.md&title=).

Features:

-   Add [formatter directive](./README.md#formatter-directives) for "Format Block Comment" ([PR #164](https://github.com/vscode-autohotkey/ahkpp/pull/164))
-   Add "allowed number of empty lines" setting to preserve any number of lines. Defaults to `1`, `-1` means "preserve all empty lines" ([PR #194](https://github.com/vscode-autohotkey/ahkpp/pull/194))
-   Add "preserve indent" setting to preserve spaces before a comment. Defaults to `false`. ([PR #192](https://github.com/vscode-autohotkey/ahkpp/pull/192))
-   Add "trim extra spaces" to trim spaces between words. Defaults to `true`. ([PR #191](https://github.com/vscode-autohotkey/ahkpp/pull/191))
-   Trim end of line when formatting ([PR #190](https://github.com/vscode-autohotkey/ahkpp/pull/190))

Fixes:

-   Fix some snippets ([PR #138](https://github.com/vscode-autohotkey/ahkpp/pull/138), [PR #201](https://github.com/vscode-autohotkey/ahkpp/pull/201), [PR #210](https://github.com/vscode-autohotkey/ahkpp/pull/210))
-   Fix formatting bugs with semi-colon as part of a string ([PR #159](https://github.com/vscode-autohotkey/ahkpp/pull/159))
-   Fix some formatting bugs with `if`, `else`, etc. without braces ([PR #181](https://github.com/vscode-autohotkey/ahkpp/pull/181))
-   Fix formatter issue with non-label colon at end of line ([PR #162](https://github.com/vscode-autohotkey/ahkpp/pull/162))
-   Even more formatter fixes ([PR #164](https://github.com/vscode-autohotkey/ahkpp/pull/164))
-   Use default debug icon (was yanked in 2.8.3, now it returns!) ([PR #149](https://github.com/vscode-autohotkey/ahkpp/pull/149))

## 2.8.4 - 2022-07-07

-   Revert to v2.8.2 due to unexpected breaking change in v2.8.3

## 2.8.3 (yanked) - 2022-07-04 🦅

> This release has been yanked, meaning it's not supported. Use v2.8.4 instead.

-   Change to use default debug icon ([#100](https://github.com/vscode-autohotkey/ahkpp/issues/100))

-   Unexpected change: Break "step into" function of debugger.

## 2.8.2 - 2022-06-11 🎂

-   No user-facing changes
-   Security fixes in dependencies
-   Update internal dependencies: Node v16, npm v8
-   Close #126

## 2.8.1 - 2021-05-09

-   Fix indentation with `(::` ([#72](https://github.com/vscode-autohotkey/ahkpp/issues/72))

## 2.8.0 - 2021-03-14

-   Add setting to toggle debug button in editor title menu ([#10](https://github.com/vscode-autohotkey/ahkpp/issues/10))

## 2.7.2 - 2021-03-02

-   Fix indentation with parentheses again (sorry!) ([#58](https://github.com/vscode-autohotkey/ahkpp/issues/58))

## 2.7.1 - 2021-02-28

-   Fix indentation with parentheses ([#25](https://github.com/vscode-autohotkey/ahkpp/issues/25))

## 2.7.0 - 2021-02-21

-   Respect user choice to indent with either tabs or spaces ([#49](https://github.com/vscode-autohotkey/ahkpp/issues/49))

## 2.6.3 - 2021-02-20

-   Fix IntelliSense ([#48](https://github.com/vscode-autohotkey/ahkpp/issues/48))
-   Move `Run Selection` command to same category as all other commands (Thanks [@fade2gray](https://github.com/fade2gray)!)

## 2.6.2 - 2021-01-30

-   Fix formatting after ternary operator ([#18](https://github.com/vscode-autohotkey/ahkpp/issues/18))
-   Fix formatting after multiple close braces on one line ([#26](https://github.com/vscode-autohotkey/ahkpp/issues/26))

## 2.6.1 - 2021-01-23

-   Fix hover provider ([#16](https://github.com/vscode-autohotkey/ahkpp/issues/16))

## 2.6.0 - 2021-01-18

### Features

-   Add `Open Help` command
-   Add `Run Selection` command
-   Add foldable region comments

### Fixes

-   Improve formatting for using `ExitApp` to end subroutines
-   Fix function coloring for functions whose names were also keywords ([#11](https://github.com/vscode-autohotkey/ahkpp/issues/11))
-   Fix function coloring for calls with a space before the parentheses (e.g. `foo ()`)
-   Fix detection of labels indented with a tab
-   Remove confusing deprecation warning from `StrSplit` function
-   Remove variables from outline

## 2.5.12 - 2020-11-08

-   Improve settings readability
-   Fix bogus snippets
-   Improve Marketplace presence

## 2.5.11 - 2020-11-07

-   Update icon
-   Change marketplace banner color
-   Add development documentation

## 2.5.10 - 2020-11-07

-   Change ownership (from `cweijan` to `mark-wiemer`)
-   Change configuration title to 'AutoHotkey Plus Plus'
-   Update README
-   Increase icon resolution

## 2.5.6 - 2020-10-06

-   Fix syntax error.
-   Fix variable detect error.

## 2.5.5 - 2020-09-29

-   Fix rename bug.
-   Bind key to context menu command.

## 2.5.4 - 2020-09-27

-   Enable IntelliSense as default.
-   Fix switch format error.
-   fix variable detech fail.

## 2.5.3 - 2020-09-22

-   Fix rename fail when unsave.
-   Simple support variable detect.
-   Simple implement intellisence.

## 2.5.0 - 2020-09-21

-   Adaptation zeroplus debuger extension.
-   Support rename method name.

## 2.4.5~2.4.16

-   Just fix bugs.

## 2.4.4 - 2020-06-27

-   Support find method references.
-   Fix syntax bug.

## 2.4.3 - 2020-06-25

-   Add command|method hover feature.
-   Add labels to outline.
-   More syntax support.

## 2.4.2 - 2020-06-24

-   Support restart current programe.
-   Support go to label.
-   Fix bugs.

## 2.4.1 - 2020-05-31

-   Support config compiler path.
-   Show variable detail in debug evalute

## 2.4.0 - 2020-05-30

-   Support get and modify variable in debug evalute
-   Support pause and continue run script.
-   Support OutputDebug command.
-   Support run unsave ahk script.

## 2.3.4 - 2020-04-15

-   Suport change variable value when debug, contribute by @zero-plusplus.

## 2.3.1 - 2020-04-12

-   Support view variable when change call stack.

## 2.3.0 - 2020-04-11

-   Variable view support complex variable value, contribute by @zero-plusplus.
-   Enhance method detecher.

## 2.2.2 - 2020-03-27

-   Fix path with space error.

## 2.2.0 - 2020-03-25

-   Support change defualt ahk execute path.
-   Support simple debug.

## 2.1.6 - 2020-03-23

-   Find definition in whole workspace.
-   Try go to include script in workspce.

## 2.1.2 - 2020-03-22

-   Update snippets.

## 2.1.0 - 2020-03-19

-   Support Run Script.

## 2.0.3 - 2020-03-10

-   Fix detecher if and while block as methods.
-   Support go to method definition in same file.

## 2.0.2 - 2019-11-27

-   Enhance method symbol detection.
