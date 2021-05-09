/**
 * Returns true if this line has more closing parens than opening parens (round brackets).
 */
export function hasMoreCloseParens(line: string): boolean {
    if (!line.includes(')')) return false;
    const openCount = line.match(/\(/g)?.length ?? 0;
    const closeCount = line.match(/\)/g).length;
    return closeCount > openCount;
}
