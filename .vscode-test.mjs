// https://github.com/microsoft/vscode-test-cli
import { defineConfig } from '@vscode/test-cli';
export default defineConfig({
    files: ['out/src/**/*.test.js'],
    mocha: {
        timeout: 900_000,
    },
});
