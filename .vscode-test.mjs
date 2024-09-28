// https://github.com/microsoft/vscode-test-cli
// todo move other tests to unit tests
import { defineConfig } from '@vscode/test-cli';
export default defineConfig({
    files: ['out/src/**/*.test.cjs'],
    // https://mochajs.org/#command-line-usage
    // https://github.com/mochajs/mocha/tree/main/example/config
    mocha: {
        timeout: 900_000,
    },
});
