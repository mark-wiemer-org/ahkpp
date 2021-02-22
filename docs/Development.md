# Development

This document covers the development process, from writing code to publishing a new version.

## Writing

1. Write your change on an offshoot of `dev` (these are feature branches).

1. Merge each change to `dev` via a squash-commit PR.

    > `master` is still the default branch, but all PRs (aside from releases) should be merged to `dev`.

1. Each new feature or multi-commit bugfixes should be developed on its own feature branch, then merged into `dev`.

Trusted collaborators only: Bugfixes, lint fixes, and refactors can be done on `dev` directly if they are only one commit.

## Testing

-   Test all added commands
-   Perform the formatting tests
-   If the README was modified, confirm README appears as intended
-   Confirm links in README work (even if it wasn't modified: some of its targets be invalidated at any time)

### Automated Tests

1. Open the Debug console panel

1. Select `Test Extension` in the Debug side bar

1. Begin Debugging (`F5` or press the play button)

The tests should run automatically, and you should see passing output in the Debug console within a few seconds.

> Learn more about debugging at the [VS Code Debugging Guide](https://code.visualstudio.com/Docs/editor/debugging).

## Starting a Release

1.  Once the `dev` branch has all the features for a new release, create a new release branch named `v<major>.<minor>.<patch>` (e.g. `v1.2.3`).

1.  Update the changelog. Once updated, the changelog should not be changed. This is to prevent feature creep.

1.  Open a draft PR to merge to `master`. The title of the PR should be the name of the release branch, lowercase 'v'. The PR description should contain the changelog entry.

1.  Fix any remaining issues with the code (but only make changes already logged in the changelog). Use the draft PR to easily detect issues.

1.  Bump the version. The message of the commit should be the name of the release branch.

1.  Push the changes.

1.  Merge the PR. The body of the commit message should be the changelog entry.

1.  Pull `master`.

1.  Package the new version using `vsce package`.

1.  Install the new version:

    1. Select the newly-created `.vsix` file.

    1. Open the context menu (right-click).

    1. Select `Install Extension VSIX`.

    1. Reload the window.

1.  Perform final pre-release tests.

    -   If tests fail, there are two choices:

        1. Delay the release until the tests pass (preferred choice)

            > Changes can be made on the same release branch, same package version

        1. Create issues for the newly-introduced failures before releasing, then publish the release anyway

### Publishing

1. `git co dev`

1. `git merge v<major>.<minor>.<patch>`

1. Tag the release

    1. Delete the release branch in local

    1. `git tag v<major>.<minor>.<patch>`

    1. `git push origin v<major>.<minor>.<patch>`

    1. [Create a new release for this tag](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/tags)

<<<<<<< HEAD
        1. Release title: Same as in [CHANGELOG.md](../CHANGELOG.md)
=======
        1. Release title: Same as in [Changelog.md](../Changelog.md)
>>>>>>> master

        1. Description: Same as in changelog

        1. Attach binary

        1. Publish release

1. Publish the release through [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/mark-wiemer)

    1. Select the ellipsis `Actions` icon and select `Update`.

    1. Upload the `.vsix` release file packaged in a previous step.

    > The release is usually available within 5 minutes of uploading.
