// https://github.com/microsoft/vscode-test-cli
import { defineConfig } from '@vscode/test-cli';
export default defineConfig({
    files: ['out/src/**/*.e2e.js'],
    // https://mochajs.org/#command-line-usage
    // https://github.com/mochajs/mocha/tree/main/example/config
    mocha: {
        timeout: 900_000,
    },
});
