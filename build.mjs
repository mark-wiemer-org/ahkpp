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
    // logLevel: 'error',
    metafile: true,
    // sourceRoot: __dirname+"/src",
    minify: isProd,
    sourcemap: !isProd,
    plugins: [
        {
            name: 'build notice',
            setup(build) {
                build.onStart(() => {
                    console.log('Build start');
                });
                build.onEnd(() => {
                    console.log('Build success');
                });
            },
        },
    ],
});
