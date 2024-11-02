//* Utilities not requiring the vscode API

import { isAbsolute, join, normalize } from 'path';

/**
 ** Returns the string representing the included path after the `#include`.
 ** Only works for actual `#include` directives, not comments or strings containing `#include`.
 ** Does not resolve or normalize the included path.
 * @example
 * getIncludedPath('#include , a b.ahk') === 'a b.ahk'
 * getIncludedPath('  #include path/to/file.ahk') === 'path/to/file.ahk'
 * getIncludedPath('include , a b.ahk') === undefined // no `#`
 * getIncludedPath('; #include , a b.ahk') === undefined
 * getIncludedPath('x := % "#include , a b.ahk"') === undefined
 * getIncludedPath('#include a') === 'a'
 * getIncludedPath('#include %A_ScriptDir%') === '%A_ScriptDir%'
 * getIncludedPath('#include <myLib>') === '<myLib>'
 * getIncludedPath('#include semi-colon ;and-more.ahk') === 'semi-colon'
 * getIncludedPath('#include semi-colon`;and-more.ahk') === 'semi-colon`;and-more.ahk'
 */
export const getIncludedPath = (ahkLine: string): string | undefined =>
    ahkLine.match(/^\s*#include\s*,?\s*(.+?)( ;.*)?$/i)?.[1];

const normalizeIncludedPath = (
    includedPath: string,
    basePath: string,
    parentGoodPath: string,
): string =>
    normalize(
        includedPath
            .trim()
            .replace(/`;/g, ';') // only semi-colons are escaped
            .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parentGoodPath)
            .replace(/(%A_LineFile%)/, basePath),
    );

/**
 * Returns the absolute, normalized path included by a #include directive.
 * Does not check if that path is a to a folder, or if that path exists.
 *
 * @param basePath
 * The path to include from, usually the script's path.
 *
 * This may be a different path if the including script has a preceding `#include dir`
 *
 * @param includedPath The path that's included in the `#include` directive
 */
export const resolveIncludedPath = (
    /**
     * The path of the current script, namely `vscode.document.uri.path`:
     * @example '/c:/path/to/file.ahk'
     */
    basePath: string,
    /** Line of text from the including script. */
    ahkLine: string,
): string | undefined => {
    const includedPath = getIncludedPath(ahkLine);
    /** @example 'c:/path/to' */
    const parentGoodPath = basePath.substring(1, basePath.lastIndexOf('/'));
    const normalizedPath = normalizeIncludedPath(
        includedPath,
        basePath,
        parentGoodPath,
    );
    const absolutePath = isAbsolute(includedPath)
        ? normalize(includedPath)
        : join(parentGoodPath, normalizedPath);
    return absolutePath;
};
