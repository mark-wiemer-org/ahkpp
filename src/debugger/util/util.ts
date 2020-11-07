export class Util {
    public static toArray<T>(obj: T | T[]): T[] {
        if (!obj) return [];
        return Array.isArray(obj) ? obj : [obj];
    }

    /**
     * base64 to string
     */
    public static atob(base64: string) {
        if (!base64) return null;
        return Buffer.from(base64, 'base64').toString();
    }

    /**
     * string to base64
     */
    public static btoa(data: string) {
        if (!data) return null;
        return Buffer.from(data).toString('base64');
    }
}
