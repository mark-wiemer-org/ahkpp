# Contributing

I welcome any issues or PRs :)

## Running locally

1. Clone the repo
1. Install the relevant dependencies
    - VS Code Insiders (needed to run the tests from CLI, see [using Insiders version for extension development](https://code.visualstudio.com/api/working-with-extensions/testing-extension#using-insiders-version-for-extension-development))
    - [Node 16](https://nodejs.org/en/), which comes automatically bundled with npm 8.
1. `npm i`

## Validate the build

1. `npm run validate`
1. Go to `Run and Debug` viewlet (`Ctrl+Shift+D`) and click "Run Extension"

## Automated checks

All checks are found in `package.json`.

    -   Test
        -   Pretest (compile): tsc, js-yaml
        -   Automated tests: Mocha
