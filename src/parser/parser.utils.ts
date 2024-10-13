import { promises } from 'fs';
import { resolve } from 'path';

interface Exclude {
    file: RegExp[];
    folder: RegExp[];
}

export async function pathsToBuild(
    rootPath: string,
    paths: string[] = [],
    excludeConfig: string[],
    log?: (val: string) => void,
): Promise<string[]> {
    if (!rootPath) {
        return [];
    }
    const exclude = parseExcludeConfig(excludeConfig);
    log?.(`folder: ${exclude.folder.map((re) => re.toString()).join('\n')}`);
    log?.(`file: ${exclude.file.map((re) => re.toString()).join('\n')}`);

    const pathsToBuildInner = async (rootPath) => {
        const dir = await promises.opendir(rootPath);
        for await (const dirent of dir) {
            const path = resolve(rootPath, dirent.name);
            log?.('Checking ' + path);
            if (
                dirent.isDirectory() &&
                !exclude.folder.some((re) => re.test(path))
            ) {
                await pathsToBuildInner(path);
            } else if (
                dirent.isFile() &&
                dirent.name.match(/\.(ahk|ah1|ahk1|ext)$/i) &&
                !exclude.file.some((re) => re.test(path))
            ) {
                log?.('Adding ' + path);
                paths.push(path);
            } else {
                log?.('Ignoring ' + path);
            }
        }
        return paths;
    };

    return await pathsToBuildInner(rootPath);
}

function parseExcludeConfig(exclude: string[] = []): Exclude {
    const fileExclude: RegExp[] = [];
    const folderExclude: RegExp[] = [];
    for (const s of exclude)
        try {
            (/[\\/]$/.test(s) ? folderExclude : fileExclude).push(
                glob2regexp(s),
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            console.log(`[Error] Invalid glob pattern: ${s}`);
        }
    return { file: fileExclude, folder: folderExclude };
}

// Copied from AHK2
// todo add tests or replace with known library
function glob2regexp(glob: string) {
    let reStr = '',
        inGroup = false,
        isNot: boolean,
        c: string;
    if ((isNot = glob.startsWith('!'))) glob = glob.slice(1);
    for (let i = 0, j, len = glob.length; i < len; i++) {
        switch ((c = glob[i])) {
            case '/':
            case '\\':
                reStr += '[\\x5c/]';
                break;
            case '$':
            case '^':
            case '+':
            case '.':
            case '(':
            case ')':
            case '=':
            case '|':
                reStr += '\\' + c;
                break;
            case '?':
                reStr += '.';
                break;
            case '!':
                if (!i) isNot = true;
                else if (reStr.endsWith('[')) reStr += '^';
                else reStr += '\\' + c;
                break;
            case '{':
                inGroup = true;
                reStr += '(';
                break;
            case '}':
                inGroup = false;
                reStr += ')';
                break;
            case ',':
                reStr += inGroup ? '|' : ',';
                break;
            case '*':
                j = i;
                while (glob[i + 1] === '*') i++;
                if (
                    i > j &&
                    /^[\x5c/]?\*+[\x5c/]?$/.test(glob.substring(j - 1, i + 2))
                ) {
                    reStr += '((?:[^\\x5c/]*(?:[\\x5c/]|$))*)';
                    i++;
                } else {
                    reStr += '([^\\x5c/]*)';
                }
                break;
            default:
                reStr += c;
        }
    }
    if (/^([a-zA-Z]:|\*\*)/.test(glob)) reStr = '^' + reStr;
    else if (!/[\\/]/.test(glob[0])) reStr = '[\\x5c/]' + reStr;
    if (!/[\\/]$/.test(glob)) reStr += '$';
    if (isNot) reStr = reStr.startsWith('^') ? `^(?!${reStr})` : `(?!${reStr})`;
    return new RegExp(reStr, 'i');
}
