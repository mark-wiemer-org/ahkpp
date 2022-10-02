# Changelog

## 3.0.0 - 2022-10-01 👻

This is "The Kyklish Release" because Kyklish wrote most of this code. Thank you!

The `#nnn` values in this release are links to PRs, not to issues.

Breaking changes:

-   Update file template: Add `#NoEnv` and `SetBatchLines, -1` (#202)

> Formatter bugfixes may be considered breaking if you wanted the old behaviors. If you want the old behavior, please [open an issue](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/new?assignees=mark-wiemer&labels=bug%2C+formatter&template=formatting-bug.md&title=).

Features:

-   Add [formatter directive](./README.md#formatter-directives) for "Format Block Comment" (#164)
-   Add "allowed number of empty lines" setting to preserve any number of lines. Defaults to `1`, `-1` means "preserve all empty lines" (#194)
-   Add "preserve indent" setting to preserve spaces before a comment. Defaults to `false`. (#192)
-   Add "trim extra spaces" to trim spaces between words. Defaults to `true`. (#191)
-   Trim end of line when formatting (#190)

Fixes:

-   Fix some snippets (#138, #201, #210)
-   Fix formatting bugs with semi-colon as part of a string (#159)
-   Fix some formatting bugs with `if`, `else`, etc. without braces (#181)
-   Fix formatter issue with non-label colon at end of line (#162)
-   Even more formatter fixes (#164)
-   Use default debug icon (was yanked in 2.8.3, now it returns!) (#149)

## 2.8.4 - 2022-07-07

-   Revert to v2.8.2 due to unexpected breaking change in v2.8.3

## 2.8.3 (YANKED) - 2022-07-04 🦅

> This release has been yanked, meaning it's not supported. Use v2.8.2 instead.

-   Change to use default debug icon ([#100](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/100))

-   Unexpected change: Break "step into" function of debugger. :(

## 2.8.2 - 2022-06-11 🎂

-   No user-facing changes
-   Security fixes in dependencies
-   Update internal dependencies: Node v16, npm v8
-   Close #126

## 2.8.1 - 2021-05-09

-   Fix indentation with `(::` ([#72](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/72))

## 2.8.0 - 2021-03-14

-   Add setting to toggle debug button in editor title menu ([#10](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/10))

## 2.7.2 - 2021-03-02

-   Fix indentation with parentheses again (sorry!) ([#58](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/58))

## 2.7.1 - 2021-02-28

-   Fix indentation with parentheses ([#25](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/25))

## 2.7.0 - 2021-02-21

-   Respect user choice to indent with either tabs or spaces ([#49](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/49))

## 2.6.3 - 2021-02-20

-   Fix IntelliSense ([#48](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/48))
-   Move `Run Selection` command to same category as all other commands (Thanks [@fade2gray](https://github.com/fade2gray)!)

## 2.6.2 - 2021-01-30

-   Fix formatting after ternary operator ([#18](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/18))
-   Fix formatting after multiple close braces on one line ([#26](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/26))

## 2.6.1 - 2021-01-23

-   Fix hover provider ([#16](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/16))

## 2.6.0 - 2021-01-18

### Features

-   Add `Open Help` command
-   Add `Run Selection` command
-   Add foldable region comments

### Fixes

-   Improve formatting for using `ExitApp` to end subroutines
-   Fix function coloring for functions whose names were also keywords ([#11](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/11))
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

## 2.5.6 - 2020/10/6

-   Fix syntax error.
-   Fix variable detect error.

## 2.5.5 - 2020/9/29

-   Fix rename bug.
-   Bind key to context menu command.

## 2.5.4 - 2020/9/27

-   Enable IntelliSense as default.
-   Fix switch format error.
-   fix variable detech fail.

## 2.5.3 - 2020/9/22

-   Fix rename fail when unsave.
-   Simple support variable detect.
-   Simple implement intellisence.

## 2.5.0 - 2020/9/21

-   Adaptation zeroplus debuger extension.
-   Support rename method name.

## 2.4.5~2.4.16

-   Just fix bugs.

## 2.4.4 - 2020/6/27

-   Support find method references.
-   Fix syntax bug.

## 2.4.3 - 2020/6/25

-   Add command|method hover feature.
-   Add labels to outline.
-   More syntax support.

## 2.4.2 - 2020/6/24

-   Support restart current programe.
-   Support go to label.
-   Fix bugs.

## 2.4.1 - 2020/5/31

-   Support config compiler path.
-   Show variable detail in debug evalute

## 2.4.0 - 2020/5/30

-   Support get and modify variable in debug evalute
-   Support pause and continue run script.
-   Support OutputDebug command.
-   Support run unsave ahk script.

## 2.3.4 - 2020/4/15

-   Suport change variable value when debug, contribute by @zero-plusplus.

## 2.3.1 - 2020/4/12

-   Support view variable when change call stack.

## 2.3.0 - 2020/4/11

-   Variable view support complex variable value, contribute by @zero-plusplus.
-   Enhance method detecher.

## 2.2.2 - 2020/3/27

-   Fix path with space error.

## 2.2.0 - 2020/3/25

-   Support change defualt ahk execute path.
-   Support simple debug.

## 2.1.6 - 2020/3/23

-   Find definition in whole workspace.
-   Try go to include script in workspce.

## 2.1.2 - 2020/3/22

-   Update snippets.

## 2.1.0 - 2020/3/19

-   Support Run Script.

## 2.0.3 - 2020/3/10

-   Fix detecher if and while block as methods.
-   Support go to method definition in same file.

## 2.0.2 - 2019/11/27

-   Enhance method symbol detection.
