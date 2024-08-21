# Development

This document covers the development process, from writing code to publishing a new version.

> Throughout the document, `F1` is short for Show all commands / Open [command palette](https://code.visualstudio.com/api/ux-guidelines/command-palette)

## Writing

1. Write your change on any branch other than `main`
1. Merge each change to `main` via a squash-commit PR

## Testing

-   Test all added commands
-   If the readme was modified, confirm it appears as intended

### Launch Extension troubleshooting

In the Run and Debug viewlet, the "Launch Extension" config is best for manual testing. However, VS Code 1.92.2 doesn't work well with several launch configurations, and bugs are common but hard to reproduce. I recommend using VS Code Insiders for manual testing. As of the following version, things are working pretty smoothly:

```
Version: 1.93.0-insider (user setup)
Commit: e2b54301a5745870f6b95d81c91fb3e9557d4f08
Date: 2024-08-20T08:04:15.567Z
Electron: 30.3.1
ElectronBuildId: 9960165
Chromium: 124.0.6367.243
Node.js: 20.15.1
V8: 12.4.254.20-electron.0
OS: Windows_NT x64 10.0.22631
```

## Starting a release

Unless otherwise specified, commit messages don't matter.

1. Create a new branch with name e.g. `release-1.2.3` or similar. Don't use e.g. `v1.2.3`, that's used as a tag later.
1. Update the changelog.
1. Bump the version in `package.json`
1. Run `npm i` to update `package-lock.json`
1. Commit the changes.
1. Open a PR. For style, the title of the PR should be e.g. `v1.2.3`. The PR description should contain the changelog entry, including the heading for this version.
1. Fix any remaining issues with the PR.
1. Merge the PR. Commit message should be the changelog heading, e.g. `v1.2.3 - 2020-12-31 ❄️ (#456)`
1. `git checkout main && git pull && npm run package`
1. Install the new version:
    1. Select the newly-created `.vsix` file.
    1. Open the context menu (right-click).
    1. Select `Install Extension VSIX`.
    1. Reload the window. (`F1` -> Developer: Reload Window)
1. Ensure all tests pass, including manual ones on the new changes.

### Publishing

1. Tag the release
    1. e.g. `git checkout main && git pull && git tag v1.2.3 && git push origin v1.2.3`
    1. [Create a new GitHub release for this tag](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/tags)
        1. Release title: Same as in [Changelog.md](../Changelog.md)
        1. Description: Changelog entry, excluding the heading for this version
        1. Attach binary
        1. Publish release

When the tag is pushed, changes will automatically be published.

### Validating deployment

1. [Deploy workflow](https://github.com/mark-wiemer/ahkpp/actions/workflows/deploy.yml)
1. [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mark-wiemer.vscode-autohotkey-plus-plus)
    1. [Publisher view](https://marketplace.visualstudio.com/manage/publishers/mark-wiemer): validation takes about 5 minutes
1. [Open VSX Marketplace](https://open-vsx.org/extension/mark-wiemer/vscode-autohotkey-plus-plus)
