import * as vscode from 'vscode';
import { Selection } from 'vscode';

export class CodeUtil {
    /**
     * Trim non-formatted chars out of original lines of code
     * @param original Original line of code
     */
    public static purify(original: string): string {
        if (!original) {
            return '';
        }
        return original
            .replace(/;.+/, '')
            .replace(/".*?"/g, '""') // replace string literals with empty string literal
            .replace(/{.*}/g, '') // remove matching braces
            .replace(/ +/g, ' ')
            .replace(/\bgui\b.*/gi, '')
            .replace(/\b(msgbox)\b.+?%/gi, '$1');
    }

    /**
     * Concats an array and an item or array of items. Impure, @see array is modified
     * @param array The initial array
     * @param items Either an item to add to the end of the array,
     * or another array to concat to the end of @see array
     */
    public static join(array: unknown[], items: unknown) {
        if (!array || !items) {
            return;
        }
        if (Array.isArray(items)) {
            for (const item of items) {
                array.push(item);
            }
        } else {
            array.push(items);
        }
    }

    public static matchAll(regex: RegExp, text: string): RegExpExecArray[] {
        if (!regex.global) {
            throw new Error('Only support global regex!');
        }

        let regs = [];
        let temp: RegExpExecArray;
        while (!!(temp = regex.exec(text))) {
            regs.push(temp);
        }

        return regs;
    }

    /** Align variable assignment by = operator in selected text
     * @param selection Text selection in editor
     */
    public static alignTextAssignOperator(selection: Selection): string {
        const document = vscode.window.activeTextEditor.document;
        let maxPosition = 0; // Right-most = operator position in line from all assignments
        for (
            let lineIndex = selection.start.line;
            lineIndex <= selection.end.line;
            lineIndex++
        ) {
            const line = this.prepareLineAssignOperator(
                document.lineAt(lineIndex).text,
            );

            // Find right-most = operator position
            let position = line.search('='); // = operator position
            if (position > maxPosition) {
                maxPosition = position;
            }
        }

        let text = '';
        for (
            let lineIndex = selection.start.line;
            lineIndex <= selection.end.line;
            lineIndex++
        ) {
            let line = document.lineAt(lineIndex).text;
            text += this.alignLineAssignOperator(line, maxPosition);
            if (lineIndex !== selection.end.line) {
                text += '\n';
            }
        }

        return text;
    }

    /** Remove comment, extra spaces around = operator and
     * add spaces around = and := operators (if they missing).
     * @param original Original line of code
     */
    public static prepareLineAssignOperator(original: string): string {
        return (
            original // Clean up text with regex
                // Remove single line comment
                .replace(/;.+/, '')
                // Remove extra spaces before = and := operators,
                // add space before = and := operators (if it absent).
                .replace(/\s*(?=:?=)/, ' ')
                // Same process after = operator
                .replace(/(?<=:?=)\s*/, ' ')
        );
    }

    /** Add spaces before = and := operators to move it to target position
     * @param original Original line of code
     * @param targetPosition Target position of = operator
     */
    public static alignLineAssignOperator(
        original: string,
        targetPosition: number,
    ) {
        // The line comment. Empty string if no line comment exists
        const comment = /;.+/.exec(original)?.[0] ?? ''; // Save comment
        original = this.prepareLineAssignOperator(original);
        let position = original.search('='); // = operator position
        return original
            .replace(/\s(?=:?=)/, ' '.repeat(targetPosition - position + 1)) // Align assignment
            .concat(comment) // Restore comment
            .trimEnd();
    }
}
