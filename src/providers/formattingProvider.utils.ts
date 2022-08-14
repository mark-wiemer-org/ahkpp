/** @return true iff this line has more closing parens than opening parens (round brackets) */
export function hasMoreCloseParens(line: string): boolean {
    if (!line.includes(')')) {
        return false;
    }
    const openCount = line.match(/\(/g)?.length ?? 0;
    const closeCount = line.match(/\)/g).length;
    return closeCount > openCount;
}

/** @return true iff this line has more opening parens than closing parens (round brackets) */
export function hasMoreOpenParens(line: string): boolean {
    if (!line.includes('(')) {
        return false;
    }
    const openCount = line.match(/\(/g).length;
    const closeCount = line.match(/\)/g)?.length ?? 0;
    return openCount > closeCount;
}

/** Remove empty lines at start of document and empty lines,
 *  that exceed allowed number of empty lines. */
export function removeEmptyLines(
    document: string,
    allowedNumberOfEmptyLines: number,
): string {
    if (allowedNumberOfEmptyLines === -1) {
        return document;
    }
    const newLineCharacterNumber = allowedNumberOfEmptyLines + 1; // + 1 new line character from previous string with text
    const newLineCharacter = new RegExp(`\\n{${newLineCharacterNumber},}`, 'g');
    return (
        document
            // remove extra empty lines
            .replace(newLineCharacter, '\n'.repeat(newLineCharacterNumber))
            // remove empty lines at start of file
            .replace(/^\n*/, '')
    );
}

/** @return string with trimmed extra spaces between words*/
export function trimExtraSpaces(
    line: string,
    trimExtraSpaces: boolean,
): string {
    return trimExtraSpaces
        ? line.replace(/ {2,}/g, ' ') // Remove extra spaces between words
        : line;
}
