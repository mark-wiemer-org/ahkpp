# Troubleshooting

If AHK++ isn't behaving as you expect, here are some things you can try.

## Restart extensions

Some settings take effect after restart. Other issues may arise that are mitigated with a restart.

To restart all extensions, press F1 to open the command palette and enter "Developer: Restart Extension Host". Extensions should restart within a few seconds.

If you're able to consistently reproduce the issue, please [open a bug](https://github.com/mark-wiemer-org/ahkpp/issues/new/choose)

## Install specific version

If a recent release is causing issues, you can revert to a previous version via your IDE's extensions view.

1. Select AHK++
1. Near "uninstall", click the small caret (down arrow)
1. Select "Install Specific Version..."
1. A quick pick will open with all versions, select whichever one you like.
    > Note that changing the major version (e.g. from 6.x to 5.x) will likely result in some issues. Refer to [changelog.md](../changelog.md) for details.

![IDE extensions view, showing uninstall alt > install specific version](../image/installSpecificVersion.png)

The current installed version of AHK++ is also shown to the right of the extension name for clarity, outlined above in red.

## Advanced troubleshooting

These steps shouldn't be necessary for most issues, and may be difficult to execute. Feel free to open an issue without trying these :)

### Debug logs

Using Ctrl+Shift+U to open the output view, you can select either of the AHK++ channels to see all debug logs. You're welcome to map these logs to `Output.debug` calls in the source code, and include your findings in any bug report.
