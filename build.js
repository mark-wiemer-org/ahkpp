const { build } = require("esbuild")
const eslint = require('esbuild-plugin-eslint');
const isProd = process.argv.indexOf('--mode=production') >= 0;

build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outfile: "out/extension.js",
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    // logLevel: 'error',
    metafile: true,
    // sourceRoot: __dirname+"/src",
    minify: isProd,
    watch: !isProd,
    sourcemap: !isProd,
    plugins: [
        eslint(),
        {
            name: 'build notice',
            setup(build) {
                build.onStart(() => {
                    console.log('build start')
                })
                build.onEnd(() => {
                    console.log('build success')
                })
            }
        },
    ],
})