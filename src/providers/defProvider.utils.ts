import { join } from 'path';

/**
 * Returns the string after the #include
 * @example
 * getIncludedPath('#include , a b.ahk') === 'a b.ahk'
 * getIncludedPath('#include path/to/file.ahk') === 'path/to/file.ahk'
 * getIncludedPath('include , a b.ahk') === undefined
 */
export const getIncludedPath = (ahkLine: string): string | undefined =>
    ahkLine.match(/#include\s*,?\s*(.+?\.(ahk|ahk1|ah1|ext))\b/i)?.[1];

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
    /** @example 'c:/path/to/included.ahk' */
    const resolvedPath = join(parentGoodPath, expandedPath);
    return resolvedPath;
};
