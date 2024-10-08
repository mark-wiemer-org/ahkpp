import { build } from 'esbuild';

/* eslint-disable-next-line no-undef */
const isProd = process.argv.indexOf('--mode=production') >= 0;

/* eslint-disable-next-line no-undef */
console.log('Building AHK++ in', isProd ? 'production' : 'development', 'mode');

// https://esbuild.github.io/api
build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    minify: isProd,
    sourcemap: !isProd,
});
