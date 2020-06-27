export class CodeUtil {
    /**
     * trim unfoucs code.
     * @param origin any string
     */
    public static purity(origin: string): string {
        if (!origin) return "";
        // TODO: untest 
        return origin.replace(/;.+/, "")
            .replace(/".+?"/, "")
            .replace(/ +/, " ")
            .replace(/\bgui\b.*/ig, "")
            .replace(/\b(msgbox)\b.+?%/ig, "$1");
    }
}