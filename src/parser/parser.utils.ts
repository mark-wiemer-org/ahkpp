import { promises } from 'fs';
import { resolve } from 'path';

export async function pathsToBuild(
    rootPath: string,
    paths: string[] = [],
    log?: (val: string) => void,
    err?: (val: string) => void,
): Promise<string[]> {
    if (!rootPath) {
        return;
    }
    log?.(`${rootPath}\n${paths.toString()}`);
    const dir = await promises.opendir(rootPath);
    for await (const dirent of dir) {
        const path = resolve(rootPath, dirent.name);
        log?.('Checking ' + path);
        if (dirent.isDirectory()) {
            await pathsToBuild(path, paths, log, err);
        } else if (
            dirent.isFile() &&
            dirent.name.match(/\.(ahk|ah1|ahk1|ext)$/i)
        ) {
            log?.('Adding ' + path);
            paths.push(path);
        } else {
            log?.('Ignoring ' + path);
        }
    }
    return paths;
}
