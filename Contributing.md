# Contributing

I welcome any issues or PRs :)

## Writing code

### Running locally

1. Clone the repo
1. Install the relevant dependencies
    - VS Code Insiders (needed to run the tests from CLI, see [using Insiders version for extension development](https://code.visualstudio.com/api/working-with-extensions/testing-extension#using-insiders-version-for-extension-development))
    - [Node 16](https://nodejs.org/en/), which comes automatically bundled with npm 8, another dependency.
1. `npm i`
1. Use `bash` to run the npm scripts. They use commands that are not compatible with PowerShell. Use this setting: `"terminal.integrated.defaultProfile.windows": "Git Bash"`
    > If you use Command Prompt or PowerShell, you may see errors like
    >
    > ```
    > 'rm' is not recognized as an internal or external command, operable program or batch file.
    > ```

### Recommended VS Code settings

This repo enforces formatting, so it's recommended to format on save:

See [language-specific editor settings](https://code.visualstudio.com/docs/getstarted/settings#_languagespecific-editor-settings)

```jsonc
// settings.json - https://code.visualstudio.com/docs/getstarted/settings#_settingsjson
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "terminal.integrated.defaultProfile.windows": "Git Bash",
    "[ahk]": {
        "editor.defaultFormatter": "mark-wiemer.vscode-autohotkey-plus-plus"
    }
}
```

### Test-driven development

To verify your fix worked as expected, we recommend following [test-driven development](https://en.wikipedia.org/wiki/Test-driven_development)

1. Identify a bug you'd like to fix
1. Write a test that fails with the current code due to that bug
1. Update the code to pass the test
1. Repeat the above process with more and more complex test cases
1. Clean up the code
1. Commit the code

This way, we'll alway have a test to ensure we don't [re-introduce a bug](https://en.wikipedia.org/wiki/Software_regression)

### Writing Code FAQ

#### Tests aren't working properly

Question: Sometimes, when running tests via VS Code's Debug viewlet, I see results for tests that don't match the TypeScript tests.

Answer: Try running `npm run pretest` before running tests.

Explanation: The tests are written in TypeScript, but must be transpiled to JavaScript before executing. When switching branches, the TS may change while the JS stays the same. This can result in running stale tests via VS Code. Running `npm run test` in the console will always run fresh tests.

### Validate the build

Please validate the build before opening a PR. Automated checks will have to pass before the PR can be merged.

1. `npm run validate` for automated checks
1. Go to `Run and Debug` viewlet (`Ctrl+Shift+D`) and click "Run Extension" for manual checks

### Automated checks

All checks are found in [📄 `package.json#scripts`](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/blob/main/package.json).

-   Validate: Make sure everything is working correctly
    -   Lint
        -   TSC: [TypeScript compiler](https://code.visualstudio.com/docs/typescript/typescript-compiling) checks for compile-time issues
        -   ESLint: [ESLint](https://eslint.org/) checks code quality
        -   Format: [Prettier](https://prettier.io/) checks code formatting
        -   PackageJSON: [`sort-package-json`](https://www.npmjs.com/package/sort-package-json) checks `package.json` property order
    -   Test
        -   Pretest (compile)
            -   TS: [TypeScript compiler](https://code.visualstudio.com/docs/typescript/typescript-compiling) ["upserts"](https://www.wordnik.com/words/upsert) `.js` files that are executed
            -   Grammar: [js-yaml](https://www.npmjs.com/package/js-yaml) converts [language syntax](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#:~:text=USING%20YAML%20TO%20WRITE%20A%20GRAMMAR) from YAML to JSON
        -   Automated tests: [Mocha](https://mochajs.org/) checks functionality

## Syntax / code color contributions

The syntax in [📄 `language/ahk.tmLanguage.yaml`](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/blob/main/language/ahk.tmLanguage.yaml) determines how the code is colorized.

```
; No colorization for me 😞
```

```ahk
; 🌈 I'm colorized! 🌈
```

Some resources:

-   See the [official syntax highlight guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide) for more details about how this works.
-   We use [`PanAeon/vscode-tmgrammar-test`](https://github.com/PanAeon/vscode-tmgrammar-test) for testing the grammar.
-   If you're curious, [`microsoft/vscode-textmate`](https://github.com/microsoft/vscode-textmate) hosts the tokenization grammar.

To update the syntax, we recommend following this flow:

1. 🤔 Take some time to reproduce a colorizing issue with as little AHK code as possible
1. ➕ Add a new file in [📁 `src/test/suite/grammar/samples`](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/tree/main/src/test/suite/grammar/samples) that demonstrates the issue
1. 🏃 Run `npm run test_grammar` to generate a `.snap` snapshot for the file you added
1. ✏️ Edit the YAML grammar
1. 🧪 Repeat the last two steps until everything is working as you want
    > [`PanAeon/vscode-tmgrammar-test`](https://github.com/PanAeon/vscode-tmgrammar-test#readme) has great documentation on how to test the syntax
