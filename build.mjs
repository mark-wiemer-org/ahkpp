/* eslint-disable no-undef */
import { build } from 'esbuild';
const isProd = process.argv.indexOf('--mode=production') >= 0;

build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    metafile: true,
    minify: isProd,
    sourcemap: !isProd,
    plugins: [
        {
            name: 'build notice',
            setup(build) {
                build.onStart(() => {
                    // used in `tasks.json`
                    console.log('Build start');
                });
                build.onEnd(() => {
                    // used in `tasks.json`
                    console.log('Build success');
                });
            },
        },
    ],
});
