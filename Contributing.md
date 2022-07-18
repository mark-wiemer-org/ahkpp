# Contributing

I welcome any issues or PRs :)

## Running locally

1. Clone the repo
1. Install the relevant dependencies
    - VS Code Insiders (needed to run the tests from CLI, see [using Insiders version for extension development](https://code.visualstudio.com/api/working-with-extensions/testing-extension#using-insiders-version-for-extension-development))
    - [Node 16](https://nodejs.org/en/), which comes automatically bundled with npm 8.
1. `npm i`

### Validate the build

1. `npm run validate`
1. Go to `Run and Debug` viewlet (`Ctrl+Shift+D`) and click "Run Extension"

### Automated checks

All checks are found in [📄 `package.json`](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/blob/main/package.json).

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

The syntax in [📄 `syntaxes/ahk.tmLanguage.yaml`](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/blob/main/syntaxes/ahk.tmLanguage.yaml) determines how the code is colorized.

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
