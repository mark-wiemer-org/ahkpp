export class CodeUtil {
    /**
     * trim unfoucs code.
     * @param origin any string
     */
    public static purity(origin: string): string {
        if (!origin) return null;
        // TODO: untest 
        return origin.replace(/;.+/, "")
            .replace(/".+?"/, "")
            .replace(/gui.*/ig, "")
            .replace(/(msgbox).+?%/ig, "$1");
    }
}