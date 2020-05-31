export class Util {
    public static toArray<T>(obj: T | T[]): T[] {
        if (!obj) return []
        return Array.isArray(obj) ? obj : [obj];
    }

    /**
     * base64 to string
     */
    public static atob(base64: string) {
        return Buffer.from(base64, 'base64').toString()
    }

    /**
     * string to base64
     */
    public static btoa(data: string) {
        return Buffer.from(data).toString('base64')
    }

}