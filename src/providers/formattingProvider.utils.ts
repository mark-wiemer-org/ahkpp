import * as vscode from 'vscode';

/**
 * Build indentation chars
 * @param depth Depth of indent
 * @param options VS Code formatting options
 */
export function buildIndentationChars(
    depth: number,
    options: Pick<vscode.FormattingOptions, 'insertSpaces' | 'tabSize'>,
): string {
    return options.insertSpaces
        ? ' '.repeat(depth * options.tabSize)
        : '\t'.repeat(depth);
}

/**
 * Build indented line of code (not ready for saving)
 * @param indentationChars Indentation chars
 * @param formattedLine Formatted line of code
 */
export function buildIndentedString(
    indentationChars: string,
    formattedLine: string,
): string {
    return !formattedLine?.trim()
        ? formattedLine
        : indentationChars + formattedLine;
}

/**
 * Build indented line of code (ready for saving)
 * @param lineIndex Line index of passed formattedLine
 * @param lastLineIndex Index of last line of document
 * @param formattedLine Formatted line of code
 * @param depth Depth of indent
 * @param options VS Code formatting options
 */
export function buildIndentedLine(
    lineIndex: number,
    lastLineIndex: number,
    formattedLine: string,
    depth: number,
    options: Pick<vscode.FormattingOptions, 'insertSpaces' | 'tabSize'>,
) {
    const indentationChars = buildIndentationChars(depth, options);
    let indentedLine = buildIndentedString(indentationChars, formattedLine);
    // If not last line, add newline
    if (lineIndex !== lastLineIndex - 1) {
        indentedLine += '\n';
    }
    return indentedLine;
}

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

/**
 * Count open/close brace, that not match by corresponding close/open brace
 * @param line
 * @param braceChar Brace character to count: `{` or `}`
 * @return Number of not matched braces
 */
export function braceNumber(line: string, braceChar: string): number {
    let braceRegEx = new RegExp(braceChar, 'g');
    let braceNum = line.match(braceRegEx).length;
    /** Number of matched braces: `{...}` */
    const matchedBrace = line.match(/{[^{}]*}/g);
    if (matchedBrace) {
        // Remove number of matched braces from overall number of braceChar
        // to get only unique not matched braceChar
        braceNum = braceNum - matchedBrace.length;
    }
    return braceNum;
}
