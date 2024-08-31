# Full v2 integration

This doc covers all the new features as a result of integrating with thqby's AHK v2 Language Support extension. See [known issues](#known-issues) at the bottom of this file

## The big changes

-   Formatting support
-   Snippets support
-   Better v2 IntelliSense support: rename, better hovers, and more

## package.json contributions

### New commands

-   Debug AHK and Attach (`ahk++.debugAttach`): Like Debug AHK Script, except attach to the debug session for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Debug AHK with Params (`ahk++.debugParams`): Like Debug AHK Script, except add user-provided command-line arguments to the debugger for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Run AHK++ Diagnostic (`ahk++.diagnostic.full`): Effectively restart the AHK v2 features of the app. Future work may do a full reset of the entire AHK++ extension.
-   Export AHK Symbols (`ahk++.exportSymbols`): Exports application functions and classes to a new file.
-   Stop AHK Script (`ahk++.stop`): Stop an AHK script of user choice ran via `Run AHK Script` or any of the `Debug AHK ...` commands. If only one script is running, stop that without asking for confirmation.
-   ahk2.generate.comment
-   ahk2.updateversioninfo
-   ahk2.switch
-   ahk2.selectSyntaxes
-   ahk2.setscriptdir

### Configuration

-   AutoHotkey2.AutoLibInclude
-   AutoHotkey2.CommentTags
-   AutoHotkey2.CompilerCMD
-   AutoHotkey2.CompleteFunctionParens
-   AutoHotkey2.DebugConfiguration
-   AutoHotkey2.Diagnostics.ClassNonDynamicMemberCheck
-   AutoHotkey2.Diagnostics.ParamsCheck
-   AutoHotkey2.Warn.VarUnset
-   AutoHotkey2.Warn.LocalSameAsGlobal
-   AutoHotkey2.Warn.CallWithoutParentheses
-   AutoHotkey2.ActionWhenV1IsDetected (now defaults to "Switch to v1" instead of "Warn")
-   AutoHotkey2.CompletionCommitCharacters
-   AutoHotkey2.Files.Exclude
-   AutoHotkey2.Files.ScanMaxDepth
-   AutoHotkey2.FormatOptions
-   AutoHotkey2.InterpreterPath
-   AutoHotkey2.SymbolFoldingFromOpenBrace
-   AutoHotkey2.WorkingDirs
-   AutoHotkey2.Syntaxes

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
-   ahk2.generate.comment
-   ahk2.updateversioninfo

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

-   Needs more tests!! Many features have not been tested at all, hence the pre-release!
-   [Release pipeline](../.github/workflows/deploy.yml) has been changed to push pre-releases. Definitely fix this for the final release 😉

### Low priority

These issues will be backlogged and resolved after a full release

-   No newline at end of file when formatting (inconsistent with v1 and industry standards)
-   No browser support (AHK++ did not have this before, we can add it later if users want it)
