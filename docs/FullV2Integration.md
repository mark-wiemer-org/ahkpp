# Full v2 integration

This doc covers all the new features as a result of integrating with thqby's AHK v2 Language Support extension.

## package.json contributions

### Commands

-   ahk2.debug (dupe of ahk++.debug)
-   ahk2.debug.attach
-   ahk2.debug.params
-   ahk2.diagnostic.full
-   ahk2.export.symbols
-   ahk2.run (dupe of ahk++.run)
-   ahk2.selection.run (dupe of ahk++.runSelection)
-   ahk2.stop
-   ahk2.compile (dupe of ahk++.compile)
-   ahk2.help (dupe of ahk++.openHelp)
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
-   AutoHotkey2.ActionWhenV1IsDetected
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

-   ahk2.run
-   ahk2.selection.run
-   ahk2.compile
-   ahk2.debug
-   ahk2.debug.params
-   ahk2.help
-   ahk2.stop

### Languages

-   ahk2.configuration.json

### Menus

See [commands](#commands) for duplicates

editor/context:

-   ahk2.debug
-   ahk2.debug.attach
-   ahk2.debug.params
-   ahk2.selection.run
-   ahk2.run
-   ahk2.compile
-   ahk2.help
-   ahk2.stop
-   ahk2.generate.comment
-   ahk2.updateversioninfo

editor/title:

-   ahk2.run
-   ahk2.stop
-   ahk2.debug

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
