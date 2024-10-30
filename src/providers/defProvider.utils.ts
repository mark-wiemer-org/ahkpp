/**
 * @example includedFilename('#include , a b.ahk') === 'a b.ahk'
 * @example includedFilename('#include path/to/file.ahk') === 'path/to/file.ahk'
 * @example includedFilename('include , a b.ahk') === undefined
 */
export const includedFilename = (line: string): string | undefined =>
    line.match(/#include\s*,?\s*(.+?\.(ahk|ahk1|ah1|ext))\b/i)?.[1];
