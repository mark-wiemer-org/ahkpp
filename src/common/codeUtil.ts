export class CodeUtil {
    /**
     * Trim non-formatted chars out of original lines of code
     * @param original Original line of code
     */
    public static purify(original: string): string {
        if (!original) return '';
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
        if (array == undefined || items == undefined) {
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
        while ((temp = regex.exec(text)) != null) {
            regs.push(temp);
        }

        return regs;
    }
}
