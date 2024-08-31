# Full v2 integration

This doc covers all the new features as a result of integrating with thqby's AHK v2 Language Support extension. See [known issues](#known-issues) at the bottom of this file

## The big changes

-   AHK v2 formatting support
-   AHK v2 snippets support
-   Better v2 IntelliSense support: rename, better hovers, and more

## package.json contributions

### New commands

-   Debug AHK and Attach (`ahk++.debugAttach`): Debug and attach to the debug session for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Debug AHK with Params (`ahk++.debugParams`): Debug and add user-provided command-line arguments to the debugger for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Run AHK++ Diagnostic (`ahk++.diagnostic.full`): Effectively restart the AHK v2 features of the app.
-   Export AHK Symbols (`ahk++.exportSymbols`): Export application functions and classes to a new file. Only for AHK v2.
-   Stop AHK Script (`ahk++.stop`): Stop an AHK script of user choice ran via `Run AHK Script` or any of the `Debug AHK ...` commands. If only one script is running, stop that without asking for confirmation.
-   Add Doc Comment (`ahk++.addDocComment`): Add a function header comment for the current function
-   Update File Version Info (`ahk++.updateVersionInfo`): Add or update a file header comment
-   Switch AHK Version (`ahk++.switchAhkVersion`): Change between v1 and v2 for the current file
-   Select AHK Syntaxes (`ahk++.selectSyntaxes`): Select custom syntax files for advanced use-cases. Only for AHK v2. PRs are welcomed if the default syntaxes aren't sufficient!
-   Set A_ScriptDir Here (`ahk++.setAScriptDir`): Set [`A_ScriptDir`](https://www.autohotkey.com/docs/v2/Variables.htm#ScriptDir) to the path of the current file. Only for AHK v2.
-   Set AHK v2 Interpreter (`ahk++.setV2Interpreter`): Open a quick pick to change the AHK v2 intepreter for all scripts.

### New settings

All new settings are in the `V2` settings category

-   Library Suggestions: Whether to suggest functions included in library files
-   Comment Tag Regex: The regular expression for custom symbols to appear in the breadcrumb and elsewhere. Default matches any line that starts with `;;`
-   Complete Function Calls: Whether to automatically add parenetheses when calling a function
-   Debug Configuration: The [launch configuration](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations) to use when debugging
-   Diagnostics
    -   Class Non Dynamic Member Check: Check whether non-dynamic members of a class exist when lexing
    -   Params Check: Check that the function call has the correct number of arguments
-   Formatter: Options for how to format a file. v1 and v2 formatters have their own settings.
-   Warn
    -   Var Unset: Display a warning when referencing an unassigned variable. Changes take effect after restart.
    -   Local Same As Global: Display warnings for each undeclared local variable that has the same name as a global variable. Changes take effect after restart.
    -   Call Without Parentheses: Display warnings for each function or method call without parentheses. Changes take effect after restart.

In progress:

-   ahk++.ActionWhenV1IsDetected (now defaults to "Switch to v1" instead of "Warn")
-   ahk++.CompletionCommitCharacters
-   ahk++.Files.Exclude
-   ahk++.Files.ScanMaxDepth
-   ahk++.InterpreterPath
-   ahk++.SymbolFoldingFromOpenBrace
-   ahk++.WorkingDirs
-   ahk++.Syntaxes

### Configuration defaults

```json
{
    "[ahk2]": {
        "editor.defaultFormatter": "mark-wiemer.vscode-autohotkey-plus-plus",
        "editor.quickSuggestions": {
            "other": true,
            "comments": false,
            "strings": true
        }
    }
}
```

### Grammars

-   Added `embeddedLanguages` to `ahk2`
-   Added `~ahk2-output` (debug output syntax)

### Keybindings

See [commands](#commands) for duplicates

-   ahk++.debugParams
-   ahk++.stop

### Languages

-   ahk2.configuration.json

### Menus

See [commands](#commands) for duplicates

editor/context:

-   ahk++.debugAttach
-   ahk++.debugParams
-   ahk++.stop
-   ahk++.addDocComment
-   ahk++.updateVersionInfo

editor/title:

-   ahk++.stop

### Semantic token scopes

New, added:

```json
[
    {
        "language": "ahk2",
        "scopes": {
            "operator": ["keyword.operator.wordlike.ahk2"]
        }
    }
]
```

## Known issues

### Blocking

These issues will be resolved before a full release

-   [#486](https://github.com/mark-wiemer-org/ahkpp/issues/486)
-   Ensure commands work with both v1 and v2 as intended
-   Cleanup and organize settings names and IDs
-   Dedupe configuration values
-   [Release pipeline](../.github/workflows/deploy.yml) has been changed to push pre-releases. Definitely fix this for the final release 😉

### Low priority

These issues will be backlogged and resolved after a full release

-   No newline at end of file when formatting (inconsistent with v1 and industry standards)
-   No browser support (AHK++ did not have this before, we can add it later if users want it)
-   Hardlink config files shared between ahk2 submodule and global package (e.g. `*.nls*.json`)
-   Explain formatter options
