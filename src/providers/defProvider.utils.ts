//* Utilities not requiring the vscode API

import { join, normalize } from 'path';

/**
 * Returns the string after the `#include`.
 * Only works for actual `#include` directives, not comments or strings containing `#include`
 * @example
 * getIncludedPath('#include , a b.ahk') === 'a b.ahk'
 * getIncludedPath('  #include path/to/file.ahk') === 'path/to/file.ahk'
 * getIncludedPath('include , a b.ahk') === undefined // no `#`
 * getIncludedPath('; #include , a b.ahk') === undefined
 * getIncludedPath('x := % "#include , a b.ahk"') === undefined
 */
export const getIncludedPath = (ahkLine: string): string | undefined =>
    ahkLine.match(/^\s*#include\s*,?\s*(.+)/i)?.[1];

/**
 * Resolves the path of a file included by a #include directive
 *
 * @param basePath
 * The path to include from, usually the script's path.
 *
 * This may be a different path if the including script has a preceding `#include dir`
 *
 * @param includedPath The path that's included in the `#include` directive
 *
 * @returns The path of the file to include
 */
export const resolvePath = (
    /**
     * The path of the current script, namely `vscode.document.uri.path`:
     * @example '/c:/path/to/file.ahk'
     */
    basePath: string,
    /** Extracted string from `getIncludedPath` */
    includedPath: string,
): string | undefined => {
    /** @example 'c:/path/to' */
    const parentGoodPath = basePath.substring(1, basePath.lastIndexOf('/'));
    const expandedPath = includedPath
        .trim()
        .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parentGoodPath)
        .replace(/(%A_LineFile%)/, basePath);

    if (includedPath.includes(':')) return normalize(includedPath);
    /** @example 'c:/path/to/included.ahk' */
    const resolvedPath = join(parentGoodPath, expandedPath);
    return resolvedPath;
};
