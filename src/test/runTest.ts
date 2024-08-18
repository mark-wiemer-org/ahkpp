import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        /**
         * The folder containing the Extension Manifest package.json
         * Passed to `--extensionDevelopmentPath`
         */
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        /** The path to test runners. Passed to --extensionTestsPath */
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Download VS Code, unzip it and run the integration test
        await runTests({
            launchArgs: ['--disable-extensions'],
            extensionDevelopmentPath,
            extensionTestsPath,
        });
    } catch (e) {
        console.error('Failed to run tests');
        console.error(e);
        process.exit(1);
    }
}

main();
