export class CodeUtil {
    /**
     * Trim non-formatted chars out of original lines of code
     * @param original Original line of code
     */
    public static purify(original: string): string {
        if (!original) {
            return '';
        }
        let commandList = [
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
        // Create new variable for better visibility in debugger
        // Watch below three variables (set breakpoint on function exit)
        // original : purified : result
        let purified = original;
        // Command may have many text fields; they may have braces, words identical to commands, comment character, etc...
        // Remove all characters after command keyword by detecting first word in string that not followed by open brace '('
        // This will purify command but not function with same name
        //  IN: ControlSend, Control, Keys, WinTitle, WinText, ExcludeTitle, ExcludeText
        // OUT: ControlSend
        //  IN: ControlSend(params)
        // OUT: ControlSend(params)
        for (const command of commandList) {
            var reStr =
                '(' + // begin 1st capture group
                '^\\s*' + // \b will do this: foo(Gui) { => foo(Gui
                command +
                '\\b' +
                '(?!\\()' + // after command must not be open brace '(', otherwise it's function
                ')' + // end 1st capture group
                '.*'; // this will be removed from string
            var re = new RegExp(reStr, 'i');
            if (original.search(re) !== -1) {
                purified = original.replace(re, '$1');
                break;
            }
        }

        let result = purified
            .replace(/".*?"/g, '""') // replace string literals with empty string literal
            .replace(/{.*}/g, '') // remove matching braces
            .replace(/\s+/g, ' ') // collaps all spaces and tabs to single space
            .replace(/;.+/, '') // remove comments; must be last, semicolon may be inside string (expression) or 'MsgBox, { ; comment with close brace }'
            .trim();
        return result;
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
}
