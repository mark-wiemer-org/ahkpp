export class Util {
    public static toArray<T>(obj: T | T[]): T[] {
        if (!obj) return []
        return Array.isArray(obj) ? obj : [obj];
    }
}