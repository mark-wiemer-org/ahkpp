# Template snippet

The template snippet is applied to the top of each new AHK file. Here is a sample:

```ahk
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%
```

You can customize the template snippet to fit your needs:

1. In VS Code, open the command palette (F1) and go to "Snippets: Configure User Snippets".

1. Choose a global snippets file or create a new one.

1. Create a new snippet with a unique name, for example:

    ```json
    "CustomAhkTemplate": {
        "body": [
            "; My new script with no directives",
            "; Here is a second comment line",
            ""
        ]
    }
    ```

1. Update your VS Code settings for AHK > File > "Template snippet name" to the name of your snippet (`CustomAhkTemplate`)

To test, just create a new file! If you have any issues, please [open a discussion](https://github.com/vscode-autohotkey/ahkpp/discussions).

## Troubleshooting

The name of the snippet must be unique, not used by any other extension. This extension uses the names `AhkTemplateV1` and `AhkTemplateV2`. Other extensions may use similar names.

## Reference

The default templates are as follows:

v1:

```ahk
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%
```

v2:

```ahk
#Requires AutoHotkey v2.0
```
