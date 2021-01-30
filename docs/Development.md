# Development

This document covers the development process, from writing code to publishing a new version.

1. Write the code on the `dev` branch, or offshoots of that branch. Merge the changes to the `dev` branch as they become stable.
    - Test all added commands
    - Perform the formatting tests
    - Confirm README appears as intended
    - Confirm links in README work
1. Once the `dev` branch has all the features for a new release, create a new release branch named `v<major>.<minor>.<patch>` (e.g. `v2.5.10`).
    1. Update package version
    1. Update changelog
    1. Save final changes in commit. The message of the commit should be the name of the release branch.
1. Push the changes, open a PR, review the changes, and merge to `master`.
1. Pull the new master branch
1. Package the new release using `vsce package`.
1. Install new release
1. Perform final round of tests
    1. If tests fail, there are two choices:
        1. Delay the release until the tests pass (preferred choice)
            > Changes can be made on the same release branch, same package version
        1. Create issues for the newly-introduced failures before releasing, then publish the release anyway
1. Create and push the version tag
    1. Delete the release branch
    1. `git tag v<major>.<minor>.<patch>`
    1. `git push`
    1. Update the metadata in the [Releases Entry](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/releases)
        1. Release title: Same as in [CHANGELOG.md](../CHANGELOG.md)
        1. Description: Same as in changelog
        1. Attach binary
1. Publish the release through [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/mark-wiemer)

    1. Select the ellipsis `Actions` icon and select `Update`.
    1. Upload the `.vsix` release file packaged in a previous step.

    > The release is usually available within 5 minutes of uploading.
