# Full v2 integration

This doc covers all the new features as a result of integrating with thqby's AHK v2 Language Support extension. See [known issues](#known-issues) at the bottom of this file

## The big changes

-   Formatting support
-   Better v2 IntelliSense support: rename, hover, and more

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

## Known issues

### Blocking

These issues will be resolved before a full release

-   Several [commands](#commands) are duplicated. The plan is to retain the current visual style.
-   `common.ts#loadahk2` needs work
-   Needs more tests!! Many features have not been tested at all, hence the pre-release!

### Low priority

These issues will be backlogged and resolved after a full release

-   App is a bit bloated, including source map files that can be removed. See [ahk2/webpack.config.js](../ahk2/webpack.config.js)
