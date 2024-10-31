/**
 * Returns the string after the #include
 * @example
 * includedPath('#include , a b.ahk') === 'a b.ahk'
 * includedPath('#include path/to/file.ahk') === 'path/to/file.ahk'
 * includedPath('include , a b.ahk') === undefined
 */
export const includedPath = (line: string): string | undefined =>
    line.match(/#include\s*,?\s*(.+?\.(ahk|ahk1|ah1|ext))\b/i)?.[1];
