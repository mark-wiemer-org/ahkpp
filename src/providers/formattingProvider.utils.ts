import * as vscode from 'vscode';
import { FormatOptions } from './formattingProvider.types';

/** Stringify a document, using consistent `\n` line separators */
export const documentToString = (document: {
    lineCount: number;
    lineAt(i: number): Pick<vscode.TextLine, 'text'>;
}): string =>
    new Array(document.lineCount)
        .fill(0)
        .map((_v, i) => document.lineAt(i).text)
        .join('\n');

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
 * @param preserveIndentOnEmptyString Preserve indent on empty string
 */
export function buildIndentedString(
    indentationChars: string,
    formattedLine: string,
    preserveIndentOnEmptyString: boolean,
): string {
    if (preserveIndentOnEmptyString) {
        return indentationChars + formattedLine;
    }
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
    options: Pick<FormatOptions, 'insertSpaces' | 'tabSize' | 'preserveIndent'>,
) {
    const indentationChars = buildIndentationChars(depth, options);
    let indentedLine = buildIndentedString(
        indentationChars,
        formattedLine,
        options.preserveIndent,
    );
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

/**
 * Trim non-formatted chars out of original line of code
 * @param original Original line of code
 */
export function purify(original: string): string {
    if (!original) {
        return '';
    }
    // Generated list of commands from SciTE4AutoHotkey -> Options -> Open ahk.keywords.properties
    const commandList = [
        'autotrim',
        'blockinput',
        'click',
        'clipwait',
        'control',
        'controlclick',
        'controlfocus',
        'controlget',
        'controlgetfocus',
        'controlgetpos',
        'controlgettext',
        'controlmove',
        'controlsend',
        'controlsendraw',
        'controlsettext',
        'coordmode',
        'critical',
        'detecthiddentext',
        'detecthiddenwindows',
        'drive',
        'driveget',
        'drivespacefree',
        'edit',
        'envadd',
        'envdiv',
        'envget',
        'envmult',
        'envset',
        'envsub',
        'envupdate',
        'exit',
        'exitapp',
        'fileappend',
        'filecopy',
        'filecopydir',
        'filecreatedir',
        'filecreateshortcut',
        'filedelete',
        'fileencoding',
        'filegetattrib',
        'filegetshortcut',
        'filegetsize',
        'filegettime',
        'filegetversion',
        'fileinstall',
        'filemove',
        'filemovedir',
        'fileread',
        'filereadline',
        'filerecycle',
        'filerecycleempty',
        'fileremovedir',
        'fileselectfile',
        'fileselectfolder',
        'filesetattrib',
        'filesettime',
        'formattime',
        'getkeystate',
        'groupactivate',
        'groupadd',
        'groupclose',
        'groupdeactivate',
        'gui',
        'guicontrol',
        'guicontrolget',
        'hotkey',
        'imagesearch',
        'inidelete',
        'iniread',
        'iniwrite',
        'input',
        'inputbox',
        'keyhistory',
        'keywait',
        'listhotkeys',
        'listlines',
        'listvars',
        'menu',
        'mouseclick',
        'mouseclickdrag',
        'mousegetpos',
        'mousemove',
        'msgbox',
        'onexit',
        'outputdebug',
        'pause',
        'pixelgetcolor',
        'pixelsearch',
        'postmessage',
        'process',
        'progress',
        'random',
        'regdelete',
        'regread',
        'regwrite',
        'reload',
        'run',
        'runas',
        'runwait',
        'send',
        'sendevent',
        'sendinput',
        'sendlevel',
        'sendmessage',
        'sendmode',
        'sendplay',
        'sendraw',
        'setbatchlines',
        'setcapslockstate',
        'setcontroldelay',
        'setdefaultmousespeed',
        'setenv',
        'setformat',
        'setkeydelay',
        'setmousedelay',
        'setnumlockstate',
        'setregview',
        'setscrolllockstate',
        'setstorecapslockmode',
        'settimer',
        'settitlematchmode',
        'setwindelay',
        'setworkingdir',
        'shutdown',
        'sleep',
        'sort',
        'soundbeep',
        'soundget',
        'soundgetwavevolume',
        'soundplay',
        'soundset',
        'soundsetwavevolume',
        'splashimage',
        'splashtextoff',
        'splashtexton',
        'splitpath',
        'statusbargettext',
        'statusbarwait',
        'stringcasesense',
        'stringgetpos',
        'stringleft',
        'stringlen',
        'stringlower',
        'stringmid',
        'stringreplace',
        'stringright',
        'stringsplit',
        'stringtrimleft',
        'stringtrimright',
        'stringupper',
        'suspend',
        'sysget',
        'thread',
        'tooltip',
        'transform',
        'traytip',
        'urldownloadtofile',
        'winactivate',
        'winactivatebottom',
        'winclose',
        'winget',
        'wingetactivestats',
        'wingetactivetitle',
        'wingetclass',
        'wingetpos',
        'wingettext',
        'wingettitle',
        'winhide',
        'winkill',
        'winmaximize',
        'winmenuselectitem',
        'winminimize',
        'winminimizeall',
        'winminimizeallundo',
        'winmove',
        'winrestore',
        'winset',
        'winsettitle',
        'winshow',
        'winwait',
        'winwaitactive',
        'winwaitclose',
        'winwaitnotactive',
    ];
    // Create new variables for better visibility in debugger
    // Watch below three variables (set breakpoint on function exit)
    // original : cmdTrim : pure
    let cmdTrim = original;
    // Command may have many text fields, they may have braces, words identical to commands, comment character, etc...
    // Remove all characters after command keyword by detecting first word in string that not followed by open brace '('
    // This will purify command but not function with same name
    //  IN: ControlSend, Control, Keys, WinTitle, WinText, ExcludeTitle, ExcludeText
    // OUT: ControlSend
    //  IN: ControlSend(params)
    // OUT: ControlSend(params)
    for (const command of commandList) {
        /** String with regular expression pattern */
        let pattern =
            '(' + // begin 1st capture group
            '^\\s*' + // \b will do this: foo(Gui) { => foo(Gui
            command +
            '\\b' +
            '(?!\\()' + // after command must not be open brace '(', otherwise it's function
            ')' + // end 1st capture group
            '.*'; // this will be removed from string
        let regExp = new RegExp(pattern, 'i');
        if (original.search(regExp) !== -1) {
            cmdTrim = original.replace(regExp, '$1');
            break;
        }
    }
    //
    let pure = cmdTrim
        .replace(/".*?"/g, '""') // replace string literals with empty string literal
        .replace(/{.*}/g, '') // remove matching braces
        .replace(/\s+/g, ' ') // collapse all spaces and tabs to single space
        .replace(/;.+/, '') // remove comments; must be last, semicolon may be inside string (expression)
        .trim();
    return pure;
}

/**
 * Remove empty lines at the start of the string.
 * Replace sets of too many empty lines with the maximum allowed empty lines.
 * Uses end of line sequence from first empty line throughout all empty lines.
 * Nothing is changed if `allowedNumberOfEmptyLines === -1` or if there
 * are no sets of empty lines that meet or exceed the allowed number.
 */
export function removeEmptyLines(
    docString: string,
    allowedNumberOfEmptyLines: number,
): string {
    if (allowedNumberOfEmptyLines === -1) {
        return docString;
    }
    /** Match all sets of more than the allowed number of empty lines */
    const emptyLines = new RegExp(
        // We need not greedy quantifier for whitespaces (\s*?),
        // because (\s) matches [\r\n\t\f\v ],
        // it interfere with last \n in regex.
        `\\n(\\s*?\\n){${allowedNumberOfEmptyLines},}`,
        'g',
    );
    // Replace sets of too many empty lines with just the allowed number of newlines
    // `$1` => uses end of line sequence from first empty line across all lines
    return (
        docString
            // remove extra empty lines
            .replace(emptyLines, '\n' + '$1'.repeat(allowedNumberOfEmptyLines))
            // remove empty lines at start of file
            .replace(/^\s*\n+/, '')
    );
}

/** @return string with trimmed extra spaces between words */
export function trimExtraSpaces(
    line: string,
    trimExtraSpaces: boolean,
): string {
    return trimExtraSpaces
        ? line.replace(/ {2,}/g, ' ') // Remove extra spaces between words
        : line;
}

export type BraceChar = '{' | '}';

/**
 * Count open/close brace, that not match by corresponding close/open brace
 * @param line
 * @param braceChar Brace character to count: `{` or `}`
 * @return Number of not matched braces
 */
export function braceNumber(line: string, braceChar: BraceChar): number {
    let braceRegEx = new RegExp(braceChar, 'g');
    let braceNum = line.match(braceRegEx).length;
    /** Number of matched braces: `{...}` */
    const matchedBrace = line.match(/{[^{}]*}/g);
    braceNum -= matchedBrace?.length ?? 0;
    return braceNum;
}

/** Align variable assignment by = operator
 * @param text Text to align
 * @returns Aligned text
 */
export function alignTextAssignOperator(text: string[]): string[] {
    /** Right-most position of first `=` operator in line from all assignments */
    const maxPosition = Math.max(
        ...text.map((line) => normalizeLineAssignOperator(line).indexOf('=')),
    );
    const alignedText = text.map((line) =>
        alignLineAssignOperator(line, maxPosition),
    );
    return alignedText;
}

/** Remove comment, remove extra spaces around first = or := operator,
 * add spaces around first = or := operator (if they missing).
 * Remove extra spaces, but not touch leading and trailing spaces.
 * @param original Original line of code
 * @returns Normalized line of code
 */
export function normalizeLineAssignOperator(original: string): string {
    return (
        original // Clean up text with regex
            // Remove single line comment
            .replace(/(?<!`);.+/, '') // skip escaped semicolon '`;', it's text, not comment
            // Remove extra spaces, but not touch leading and trailing spaces.
            // Leading spaces - saves code indent.
            // Trailing spaces - saves comment indent. User can add new variable
            // assignment, align assignments and comments will stay in place
            // (manually aligned before).
            .replace(/(?<=\S) {2,}(?=\S)/g, ' ')
            // Add space before = and := operators (if it absent).
            .replace(/\s?(?=:?=)/, ' ')
            // Same process after = and := operators.
            .replace(/(?<=:?=)\s?/, ' ')
    );
}

/** Add spaces before = and := operators to move it to target position.
 * Remove extra spaces between symbol and operator,
 * remove spaces before comment (if present),
 * trim end spaces.
 * @param original Original line of code
 * @param targetPosition Target position of = operator
 * @returns Aligned line
 */
export function alignLineAssignOperator(
    original: string,
    targetPosition: number,
): string {
    /** The line comment. Empty string if no line comment exists */
    const comment = /;.+/.exec(original)?.[0] ?? ''; // Save comment
    original = normalizeLineAssignOperator(original);
    let position = original.indexOf('='); // = operator position
    return original
        .replace(/\s(?=:?=)/, ' '.repeat(targetPosition - position + 1)) // Align assignment
        .concat(comment) // Restore comment
        .trimEnd();
}
