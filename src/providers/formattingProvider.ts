import { isDeepStrictEqual } from 'util';
import * as vscode from 'vscode';
import { ConfigKey, Global } from '../common/global';
import { FormatOptions } from './formattingProvider.types';
import {
    alignTextAssignOperator,
    braceNumber,
    buildIndentedLine,
    documentToString,
    FlowOfControlNestDepth,
    purify,
    removeEmptyLines,
    trimExtraSpaces,
} from './formattingProvider.utils';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    );
}

export const internalFormat = (
    stringToFormat: string,
    options: FormatOptions,
): string => {
    let formattedString = '';

    // INDENTATION
    /** Current level of indentation. 0 = top-level, no indentation */
    let depth = 0;
    /**
     * It's marker for `Return`, `ExitApp`, `#Directive` commands, which
     * allow/disallow for them to be un-indented.
     *
     * -------------------------------------------------------------------------
     * `tagDepth === 0`:
     *
     *    Indentation level was decreased by `Return` or `ExitApp` command,
     *    so they placed on same indentation level as `Label`.
     *
     *    Decrement of indentation level by `Label` is disallowed (previous
     *    `Label` finished with `Return` or `ExitApp` command and un-indent for
     *    fall-through scenario not needed).
     *
     *    Decrement indentation by one level for `#Directive` is allowed.
     *
     * -------------------------------------------------------------------------
     * `tagDepth === depth`:
     *
     *    Current indentation level is in sync with `Label` indentation level
     *    (no additional indent added by block `{}`, `oneCommandCode`, etc...).
     *
     *    `Return` or `ExitApp` commands allowed to be un-indented, so they will
     *    be placed on same indentation level as `Label`.
     *
     *    `Label` allowed to be un-indented for fall-through scenario.
     *
     * -------------------------------------------------------------------------
     * `tagDepth !== depth`:
     *
     *    `Return` or `ExitApp` commands disallowed to be un-indented, so they
     *    will obey indentation rules as code above them (`Return` inside
     *    function, block `{}`, `oneCommandCode`, etc... stay on same
     *    indentation level as code above them).
     *
     * -------------------------------------------------------------------------
     * `tagDepth > 0` :
     *
     *    `#Directive` allowed to be un-indented by `tagDepth` value (jump
     *    several indentation levels).
     *
     * -------------------------------------------------------------------------
     * `tagDepth = depth`:
     *
     *    Only `Label` makes syncing `tagDepth` with `depth`.
     *
     *    `Case:` and `Default:` must not make syncing to disallow `Return` and
     *    `ExitApp` un-indent inside `Switch-Case` block.
     */
    let tagDepth = 0;

    // FLOW OF CONTROL and IF-ELSE nesting
    /**
     * `True` if this line is an one-statement block. Example:
     * ```ahk
     * if (var)   ; false
     *     MsgBox ; true
     * SoundBeep  ; false
     * ```
     */
    let oneCommandCode = false;
    /**
     * Detect or not detect `oneCommandCode`.
     * Every iteration it's `true`, but becomes `false` when formatter increase
     * indent for next line by open brace `{`.
     * It's prevent wrong extra indent, when `{` present after flow of control
     * statement: one indent for `{` and additional indent for `oneCommandCode`.
     */
    /** Previous line is one command code */
    let prevLineIsOneCommandCode = false;
    let detectOneCommandCode = true;
    /**
     * Object with array of indent level of `if` not completed by `else`.
     *
     * Allow us to de-indent (jump several indentation levels) `else` to last
     * not complete `if` and de-indent (jump several indentation levels) code
     * that exit nested flow of control statements inside block of code `{}`.
     *
     * Every time we meet `{` we `push` delimiter `-1` to array.
     *
     * Every time we meet `}` we delete last delimiter `-1` from array and all
     * elements after it.
     *
     * Every time we meet `if` we `push` current `depth` to array.
     *
     * Every time we meet `else` we `pop` element from array.
     *
     * When code leaves `if` nesting we `splice` (delete) element(s) in array
     * after last delimiter.
     *
     * Example:
     * ```ahk
     *                  ; [-1]
     * if (var)         ; [-1, 0]
     * {                ; [-1, 0, -1]
     *     if (var)     ; [-1, 0, -1, 1]
     *         if (var) ; [-1, 0, -1, 1, 2]
     *             code
     *         else     ; [-1, 0, -1, 1], de-indent to last not complete IF,
     *             code ;                  complete it by deleting last element
     *     code         ; [-1, 0, -1] de-indent to first not complete IF inside
     * }                ; [-1, 0]                                    code block
     * code             ; [-1]
     * ```
     */
    let ifDepth = new FlowOfControlNestDepth();
    /**
     * Object with array of indent level of first flow of control statement
     * without open brace `{` with nested code inside it.
     *
     * Allow us to de-indent (jump several indentation levels) code
     * that exit nested flow of control statements inside block of code `{}`.
     *
     * Every time we meet `{` we check did we add by mistake `depth` of last
     * flow of control, if yes - revert changes, `push` delimiter `-1` to array.
     *
     * Every time we meet `}` we delete last delimiter `-1` and all elements
     * after it.
     *
     * Every time we meet flow of control statement without `{` we `push`
     * current `depth` to array (only if last element is delimiter).
     *
     * When code leaves flow of control nesting we `splice` (delete) element(s)
     * in array after last delimiter.
     *
     * Example:
     * ```ahk
     *                  ; [-1]
     * loop             ; [-1, 0] added by mistake
     * {                ; [-1, -1] revert changes and add delimiter
     *     loop         ; [-1, -1, 1]
     *         loop     ; [-1, -1, 1] not added
     *             code
     *     code         ; [-1, -1] de-indent to first flow of control inside
     * }                ; [-1]                                       code block
     * code             ; [-1]
     * ```
     */
    let focDepth = new FlowOfControlNestDepth();
    /** Array of indent level of open brace `{` that belongs to `if` statement. */
    let waitCloseBraceIf: number[] = [];
    /**
     * Formatter waits `else` statement right after close brace `}`, that
     * belongs to corresponding `if`'s open brace `{`.
     *
     * If formatter not meet `else`, it will remove last not complete `if` from
     * `ifDepth` object.
     *
     * If formatter meet `else`, it will not remove not complete `if` from
     * `ifDepth` object, because `else` statement will do it later.
     */
    let waitElse = false;
    /** Previous line is `if` statement */
    let prevLineIsIf = false;

    // ALIGN ASSIGNMENT
    /**
     * Formatter's directive:
     * ```ahk
     * ;@AHK++AlignAssignmentOn
     * ;@AHK++AlignAssignmentOff
     * ```
     * Align assignment between this directives
     */
    let alignAssignment = false;
    /** Code block with assignment to be aligned */
    let assignmentBlock: string[] = [];

    // CONTINUATION SECTION
    /**
     * Continuation section: Expression, Object
     * ```ahk
     * obj := { a: 1 ; false
     *     , b: 2 }  ; true
     * if a = 1      ; false
     *     and b = 2 ; true
     * ```
     */
    let continuationSectionExpression = false;
    /**
     * Continuation section: Text [Formatted]
     * ```ahk
     * ( LTrim
     *     Indented line of text
     * )
     * ```
     */
    let continuationSectionTextFormat = false;
    /**
     * Continuation section: Text [Not Formatted]
     * ```ahk
     * ( [NO LTrim option!]
     * Line of text with preserved user formatting
     * )
     * ```
     */
    let continuationSectionTextNotFormat = false;
    /**
     * Indent was increased by brace `{`, but not inside expression
     * continuation section
     */
    let braceIndent = false;
    /**
     * The indentation of `oneCommandCode` is delayed, because the current line
     * is an expression continuation section. The indentation is delayed by
     * temporarily disabling `oneCommandCode`.
     */
    let deferredOneCommandCode = false;
    /**
     * Array of indent level of open brace `{` that belongs to object
     * initialization with continuation section.
     */
    let waitCloseBraceObject: number[] = [];

    // OTHER
    /**
     * This line is `#Directive`, that will create context-sensitive hotkeys
     * and hotstrings.
     * Example of `#Directives`:
     * ```ahk
     * #IfWinActive WinTitle
     * #IfWinNotActive WinTitle
     * #IfWinExist WinTitle
     * #IfWinNotExist WinTitle
     * #If Expression
     * ```
     */
    let sharpDirectiveLine = false;

    // BLOCK COMMENT
    /** This line is block comment */
    let blockComment = false;
    /** Base indent, that block comment had in original code */
    let blockCommentIndent = '';
    /**
     * Formatter's directive:
     * ```ahk
     * ;@AHK++FormatBlockCommentOn
     * ;@AHK++FormatBlockCommentOff
     * ```
     * Format text inside block comment like regular code
     */
    let formatBlockComment = false;
    // Save formatter state to this variables on enter of block comment and
    // restore them on exit of block comment
    let preBlockCommentDepth = 0;
    let preBlockCommentTagDepth = 0;
    let preBlockCommentOneCommandCode = false;
    let preBlockCommentIfDepth = new FlowOfControlNestDepth();
    let preBlockCommentFocDepth = new FlowOfControlNestDepth();
    let preBlockCommentWaitCloseBraceIf: number[] = [];
    let preBlockCommentWaitElse = false;

    // SETTINGS' ALIASES
    const indentCodeAfterLabel = options.indentCodeAfterLabel;
    const indentCodeAfterSharpDirective = options.indentCodeAfterSharpDirective;
    const trimSpaces = options.trimExtraSpaces;

    // REGULAR EXPRESSION
    /**
     * Label name may consist of any characters other than `space`, `tab`,
     * `comma` and the escape character (`).
     *
     * Generally, aside from whitespace and comments,
     * no other code can be written on the same line as a label.
     *
     * Example: `Label:`
     */
    const label = /^[^\s\t,`]+:$/;
    /**
     * `#Directive`, that will create context-sensitive hotkeys and hotstrings.
     * Example of `#Directives`:
     * ```ahk
     * #IfWinActive WinTitle
     * #IfWinNotActive WinTitle
     * #IfWinExist WinTitle
     * #IfWinNotExist WinTitle
     * #If Expression
     * ```
     */
    const sharpDirective =
        '#(ifwinactive|ifwinnotactive|ifwinexist|ifwinnotexist|if)';
    /**
     * Special labels in `Switch` construction.
     *
     * Example: `Case valA[, valB]: [Statement]` or `Default: [Statement]`
     */
    const switchCaseDefault = /^(case\s*.+?:|default:)\s*.*/;

    const lines = stringToFormat.split('\n');

    lines.forEach((originalLine, lineIndex) => {
        const purifiedLine = purify(originalLine).toLowerCase();
        /** The line comment. Empty string if no line comment exists */
        const comment = /;.+/.exec(originalLine)?.[0] ?? '';
        let formattedLine = originalLine.replace(/;.+/, ''); // Remove single line comment
        formattedLine = trimExtraSpaces(formattedLine, trimSpaces) // Remove extra spaces between words
            .concat(comment) // Add removed single line comment back
            .trim();
        /** Line is empty or this is a single comment line */
        const emptyLine = purifiedLine === '';

        continuationSectionExpression = false;
        detectOneCommandCode = true;
        sharpDirectiveLine = false;

        const openBraceNum = braceNumber(purifiedLine, '{');
        const closeBraceNum = braceNumber(purifiedLine, '}');

        // =====================================================================
        // |                            THIS LINE                              |
        // =====================================================================

        // STOP DIRECTIVE for formatter
        if (emptyLine) {
            if (
                alignAssignment &&
                comment.match(/;\s*@AHK\+\+AlignAssignmentOff/i)
            ) {
                alignAssignment = false;
                assignmentBlock = alignTextAssignOperator(assignmentBlock);
                // Save aligned block
                assignmentBlock.forEach((alignedFormattedLine, index) => {
                    formattedString += buildIndentedLine(
                        // restore 'lineIndex' before 'assignmentBlock' and add
                        // 'index + 1'
                        lineIndex - assignmentBlock.length + index + 1,
                        lines.length,
                        alignedFormattedLine,
                        depth,
                        options,
                    );
                });
                assignmentBlock = [];
            }
            if (
                formatBlockComment &&
                comment.match(/;\s*@AHK\+\+FormatBlockCommentOff/i)
            ) {
                formatBlockComment = false;
            }
        }

        // ALIGN ASSIGNMENT
        if (alignAssignment) {
            assignmentBlock.push(formattedLine);
            if (lineIndex !== lines.length - 1) {
                // skip to the next iteration
                return;
            }
            // Save aligned block if we reach end of text, but didn't find stop
            // directive ';@AHK++AlignAssignmentOff'
            assignmentBlock.forEach((alignedFormattedLine, index) => {
                formattedString += buildIndentedLine(
                    // restore 'lineIndex' before 'assignmentBlock' and add
                    // 'index + 1'
                    lineIndex - assignmentBlock.length + index + 1,
                    lines.length,
                    alignedFormattedLine,
                    depth,
                    options,
                );
            });
            assignmentBlock = [];
        }

        // BLOCK COMMENT
        // The /* and */ symbols can be used to comment out an entire section,
        // but only if the symbols appear at the beginning of a line (excluding
        // whitespace), like in this example:
        // /*
        // MsgBox, This line is commented out (disabled).
        // MsgBox, Common mistake: */ this does not end the comment.
        // MsgBox, This line is commented out.
        // */
        if (!blockComment && originalLine.match(/^\s*\/\*/)) {
            // found start '/*' pattern
            blockComment = true;
            // Save first capture group (original indent)
            blockCommentIndent = originalLine.match(/(^\s*)\/\*/)?.[1];
            if (formatBlockComment) {
                // save indent values on block comment enter
                preBlockCommentDepth = depth;
                preBlockCommentTagDepth = tagDepth;
                preBlockCommentOneCommandCode = oneCommandCode;
                preBlockCommentIfDepth = ifDepth;
                preBlockCommentFocDepth = focDepth;
                preBlockCommentWaitCloseBraceIf = waitCloseBraceIf;
                preBlockCommentWaitElse = waitElse;
                // reset indent values to default values
                tagDepth = depth;
                oneCommandCode = false;
                ifDepth = new FlowOfControlNestDepth();
                focDepth = new FlowOfControlNestDepth();
                waitCloseBraceIf = [];
                waitElse = false;
            }
        }

        // BLOCK COMMENT
        if (blockComment) {
            // Save block comment line only if user don't want format it content
            if (!formatBlockComment) {
                let blockCommentLine = '';
                if (originalLine.startsWith(blockCommentIndent)) {
                    blockCommentLine = originalLine.substring(
                        blockCommentIndent.length,
                    );
                } else {
                    blockCommentLine = originalLine;
                }
                formattedString += buildIndentedLine(
                    lineIndex,
                    lines.length,
                    blockCommentLine.trimEnd(),
                    depth,
                    options,
                );
            }
            if (originalLine.match(/^\s*\*\//)) {
                // found end '*/' pattern
                blockComment = false;
                if (formatBlockComment) {
                    // restore indent values on block comment exit
                    depth = preBlockCommentDepth;
                    tagDepth = preBlockCommentTagDepth;
                    oneCommandCode = preBlockCommentOneCommandCode;
                    ifDepth = preBlockCommentIfDepth;
                    focDepth = preBlockCommentFocDepth;
                    waitCloseBraceIf = preBlockCommentWaitCloseBraceIf;
                    waitElse = preBlockCommentWaitElse;
                }
            }
            if (!formatBlockComment) {
                return;
            }
        }

        // CONTINUATION SECTION: Text [Not Formatted] Start
        // ( [NO LTrim option!] <-- check this START parenthesis
        // Line of text with preserved user formatting
        // )
        // Skip hotkey: (::
        if (purifiedLine.match(/^\((?!::)(?!.*\bltrim\b)/)) {
            continuationSectionTextNotFormat = true;
        }

        // CONTINUATION SECTION: Text [Not Formatted] Save with original indent
        if (continuationSectionTextNotFormat) {
            formattedString += originalLine.trimEnd() + '\n';
            // CONTINUATION SECTION: Text [Not Formatted] Stop
            // ( [NO LTrim option!]
            // Line of text with preserved user formatting
            // ) <-- check this STOP parenthesis
            if (purifiedLine.match(/^\)/)) {
                continuationSectionTextNotFormat = false;
            }
            return;
        }

        // CONTINUATION SECTION: Text [Formatted] Stop
        // ( LTrim
        //     Line of text
        // ) <-- check this STOP parenthesis
        if (continuationSectionTextFormat && purifiedLine.match(/^\)/)) {
            continuationSectionTextFormat = false;
            depth--;
        }

        // CONTINUATION SECTION: Text [Formatted] Save indented
        if (continuationSectionTextFormat) {
            formattedString += buildIndentedLine(
                lineIndex,
                lines.length,
                originalLine.trim(),
                depth,
                options,
            );
            return;
        }

        // CONTINUATION SECTION: Expression, Object, Flow of Control nesting
        // obj := { a: 1
        //     , b: 2 }
        // if a = 1
        //     and b = 2
        if (
            // skip increment ++, decrement --, block comments /* and */
            purifiedLine.match(
                /^(((and|or|not)\b)|[\^!~?:&<>=.,|]|\+(?!\+)|-(?!-)|\/(?!\*)|\*(?!\/))/,
            ) &&
            // skip Hotkeys:: and ::Hotstrings:: (they has '::')
            !purifiedLine.match(/::/)
        ) {
            continuationSectionExpression = true;
            // CONTINUATION SECTION: Object
            // obj := { a: 1
            //     , b: 2 <-- revert indent after open brace
            //     , c: 3 }
            if (braceIndent) {
                depth--;
                waitCloseBraceObject.push(depth);
            }
            // CONTINUATION SECTION: Expression
            // if a = 1
            //     or b = 2 <-- revert indent for oneCommandCode and make it
            //     MsgBox                                               deferred
            if (oneCommandCode) {
                deferredOneCommandCode = true;
                oneCommandCode = false;
                prevLineIsOneCommandCode = false;
                depth--;
            }
            // CONTINUATION SECTION: Flow of Control nesting
            // Loop
            //     code         ; previous line is one command code
            //         , code <-- restore oneCommandCode depth
            // code
            if (prevLineIsOneCommandCode) {
                oneCommandCode = true;
                depth++;
            }
            depth++;
        }

        // CONTINUATION SECTION: Expression - Deferred oneCommandCode indent
        // if a = 1
        //     or b = 2
        //     MsgBox <-- restore deferred oneCommandCode
        if (deferredOneCommandCode && !continuationSectionExpression) {
            deferredOneCommandCode = false;
            oneCommandCode = true;
            depth++;
        }

        // IF-ELSE complete tracking
        if (waitElse && !emptyLine) {
            waitElse = false;
            // TODO: Common regexp to vars? Change "}? ?" --> "(} )?"
            // if {
            //     code
            // }
            // code <-- pop last IF, if we not meet ELSE
            if (!purifiedLine.match(/^}? ?else\b(?!:)/)) {
                ifDepth.pop();
            }
        }

        // CLOSE BRACE
        if (closeBraceNum) {
            // FLOW OF CONTROL
            ifDepth.exitBlockOfCode();
            focDepth.exitBlockOfCode();
            // CONTINUATION SECTION: Object
            // obj := { a: 1
            //     , b: 2
            //     , c: 3 } <-- skip de-indent by brace in Continuation Section: Object
            if (!continuationSectionExpression) {
                depth -= closeBraceNum;
                if (
                    purifiedLine.match(/} ?if\b/) &&
                    waitCloseBraceIf.last() === depth
                ) {
                    // IF-ELSE complete tracking
                    // TODO: WHO WILL FORMAT LIKE THAT? DELETE!
                    // if {
                    //     code
                    // } if { <-- pop previous IF, if we meet another IF
                    //     code
                    // }
                    waitCloseBraceIf.pop();
                    ifDepth.pop();
                }
            }
        }

        // OPEN BRACE
        if (openBraceNum) {
            // ONE COMMAND CODE
            if (
                (oneCommandCode || deferredOneCommandCode) &&
                !nextLineIsOneCommandCode(purifiedLine)
            ) {
                oneCommandCode = false;
                if (deferredOneCommandCode) {
                    // if (a = 4
                    //     and b = 5) {
                    //     MsgBox <-- disable deferredOneCommandCode indent
                    // }
                    deferredOneCommandCode = false;
                } else {
                    // if (var)
                    // { <-- revert oneCommandCode indent for open brace
                    //     MsgBox
                    // }
                    depth -= openBraceNum;
                }
                // FLOW OF CONTROL revert added by mistake
                // Loop, %var%
                // { <-- check open brace below flow of control statement
                //     code
                // }
                if (depth === focDepth.last()) {
                    focDepth.pop();
                }
            }
        }

        // FLOW OF CONTROL de-indent from all nesting
        if (
            !emptyLine &&
            !oneCommandCode &&
            !continuationSectionExpression &&
            (ifDepth.last() > -1 || focDepth.last() > -1)
        ) {
            if (purifiedLine.match(/^}? ?else\b(?!:)/)) {
                // {
                //     if
                //         if
                //             loop
                //                 loop
                //                     code
                //         else   <-- de-indent "ELSE" to last not complete "IF"
                //             code
                //     else       <-- de-indent "ELSE" to last not complete "IF"
                //         code
                //     code
                // }
                depth = ifDepth.pop();
            } else if (!(openBraceNum || closeBraceNum)) {
                // Example (skip irrelevant braces):
                // if       <-- relevant
                // {        <-- skip irrelevant
                //     code <-- relevant
                // }        <-- skip irrelevant
                // code     <-- relevant
                // Example (main logic):
                // if                                   |  loop
                //     if                               |      loop
                //         code                         |          code
                // code <-- de-indent from all nesting  |  code <-- de-indent from all nesting
                const restoreIfDepth: number | undefined =
                    ifDepth.restoreDepth();
                const restoreFocDepth: number | undefined =
                    focDepth.restoreDepth();
                if (
                    restoreIfDepth !== undefined &&
                    restoreFocDepth !== undefined
                ) {
                    depth = Math.min(restoreIfDepth, restoreFocDepth);
                } else {
                    depth = restoreIfDepth ?? restoreFocDepth;
                }
            }
        }

        // #DIRECTIVE without parameters
        // #IfWinActive WinTitle
        //     Hotkey::
        // #If <-- de-indent #Directive without parameters
        if (purifiedLine.match('^' + sharpDirective + '$')) {
            if (indentCodeAfterSharpDirective) {
                if (tagDepth > 0) {
                    depth -= tagDepth;
                } else {
                    depth--;
                }
            }
        }

        // #DIRECTIVE with parameters
        // #IfWinActive WinTitle1
        //     Hotkey::
        // #IfWinActive WinTitle2 <-- fall-through scenario for #Directive with
        //     Hotkey::                                               parameters
        if (purifiedLine.match('^' + sharpDirective + '\\b.+')) {
            if (indentCodeAfterSharpDirective) {
                if (tagDepth > 0) {
                    depth -= tagDepth;
                } else {
                    depth--;
                }
                sharpDirectiveLine = true;
            }
        }

        // Return, Exit, ExitApp
        // Label:
        //     code
        // Return <-- force de-indent by one level for labels
        if (
            purifiedLine.match(/^(return|exit|exitapp)\b/) &&
            tagDepth === depth
        ) {
            tagDepth = 0;
            depth--;
        }

        // SWITCH-CASE-DEFAULT or LABEL:
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default:
            depth--;
        } else if (purifiedLine.match(label)) {
            // Label:
            if (indentCodeAfterLabel) {
                // De-indent label or hotkey, if they not end with 'return'
                // command.
                // This is fall-through scenario. Example:
                // Label1: <-- de-indent
                //     code
                // Label2: <-- de-indent
                //     code
                // return
                // No need to make 'tagDepth' in sync with 'depth', 'Label'
                // check for next line will do it.
                if (tagDepth === depth) {
                    depth--;
                }
            }
        }

        // De-indent by label may produce negative 'depth', it's normal behavior
        if (depth < 0) {
            depth = 0;
        }
        if (preBlockCommentDepth < 0) {
            preBlockCommentDepth = 0;
        }

        // Save indented line
        formattedString += buildIndentedLine(
            lineIndex,
            lines.length,
            formattedLine,
            depth,
            options,
        );

        // =====================================================================
        // |                            NEXT LINE                              |
        // =====================================================================

        // START DIRECTIVE for formatter
        if (emptyLine) {
            if (comment.match(/;\s*@AHK\+\+AlignAssignmentOn/i)) {
                alignAssignment = true;
            } else if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOn/i)) {
                formatBlockComment = true;
            }
        }

        // ONE COMMAND CODE
        if (
            oneCommandCode &&
            // Don't change indentation on empty lines (single line comment is
            // equal to empty line) after one command code.
            !emptyLine &&
            // Don't change indentation on block comment after one command code.
            // Change indentation inside block comment, if user wants to format
            // block comment.
            (!blockComment || formatBlockComment)
        ) {
            oneCommandCode = false;
            prevLineIsOneCommandCode = true;
            // FLOW OF CONTROL
            // if (var)
            //    if (var) <-- don't de-indent nested flow of control statement
            if (!nextLineIsOneCommandCode(purifiedLine)) {
                depth--;
            }
        } else {
            prevLineIsOneCommandCode = false;
        }

        // CLOSE BRACE
        if (closeBraceNum) {
            // IF-ELSE complete tracking
            // if {
            //     code
            // } <-- check close brace ('depth' equal to '{' indent above)
            if (waitCloseBraceIf.last() === depth) {
                waitCloseBraceIf.pop();
                // if {
                //     code
                // } else <-- check this ELSE
                if (!purifiedLine.match(/}? ?else\b/)) {
                    waitElse = true;
                }
            }
        }

        // FLOW OF CONTROL
        // Loop, %var% <-- flow of control statement without open brace
        //     code
        // code
        if (
            nextLineIsOneCommandCode(purifiedLine) &&
            openBraceNum === 0 &&
            focDepth.last() === -1
        ) {
            focDepth.push(depth);
        }

        // IF-ELSE complete tracking
        // TODO: WHO WILL FORMAT LIKE THAT? DELETE!
        // if {        <-- check IF
        //     code
        // } if {      <-- TODO: who will format like that??? Simplify regex
        //     code
        // } else if { <-- check IF
        //     code
        // } else if   <-- check IF
        //     code
        if (
            purifiedLine.match(/^}? ?if\b(?!:)/) ||
            purifiedLine.match(/^}? ?else if\b/)
        ) {
            ifDepth.push(depth);
        }
        // if {  <-- check IF with open brace
        //     code
        // } else if { <-- check IF with open brace
        //     code
        // }
        if (
            purifiedLine.match(/^}? ?if\b.*{/) ||
            purifiedLine.match(/^}? ?else if\b.*{/)
        ) {
            waitCloseBraceIf.push(depth);
        }
        // if (var)
        // { <-- check open brace if above was IF
        //     code
        // }
        if (prevLineIsIf && openBraceNum) {
            waitCloseBraceIf.push(depth);
        }
        // TODO: WHO WILL FORMAT LIKE THAT? DELETE!
        // if (var)   <-- IF without open brace
        // {
        //     code
        // } if (var) <-- TODO: who will format like that??? Simplify regex
        //     code
        if (purifiedLine.match(/^}? ?if\b(?!:)(.(?!{))*$/)) {
            prevLineIsIf = true;
        } else if (!emptyLine) {
            prevLineIsIf = false;
        }

        // OPEN BRACE
        if (openBraceNum) {
            depth += openBraceNum;
            // Do not detect 'oneCommandCode', because it will produce extra
            // indent for next line like in example below:
            // if {
            // |   |   wrong_extra_indented_code_by_oneCommandCode
            // |   code
            // }
            detectOneCommandCode = false;
            // CONTINUATION SECTION: Nested Objects
            if (!continuationSectionExpression) {
                braceIndent = true;
            }
            // FLOW OF CONTROL
            ifDepth.enterBlockOfCode();
            focDepth.enterBlockOfCode();
        } else {
            braceIndent = false;
        }

        // #DIRECTIVE with parameters
        // #If Expression <-- indent next line after '#Directive'
        //     F1:: MsgBox Help
        if (sharpDirectiveLine && indentCodeAfterSharpDirective) {
            depth++;
        }

        // SWITCH-CASE-DEFAULT or LABEL:
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default: <-- indent next line
            //     code
            depth++;
            // Do not sync here 'tagDepth' with 'depth' to prevent 'Return' and
            // 'ExitApp' to de-indent inside 'Switch-Case-Default' construction!
        } else if (purifiedLine.match(label) && indentCodeAfterLabel) {
            // Label: <-- indent next line
            //     code
            depth++;
            tagDepth = depth;
        }

        // CONTINUATION SECTION: Expression, Object
        if (continuationSectionExpression) {
            continuationSectionExpression = false;
            // Object - Check close braces of nested objects
            // obj = { a: 1
            //     , b : { c: 2
            //         , d: 3 } } <-- multiply close brace in nested objects
            if (closeBraceNum) {
                depth -= closeBraceNum;
                // obj = { a: 1
                //     , b : { c: 2
                //         , d: 3 } } <-- revert indent after last close brace
                if (waitCloseBraceObject.last() === depth) {
                    waitCloseBraceObject.pop();
                    depth++;
                }
            }
            // Expression - De-indent next line
            // isPositive := x > 0
            //     and y > 0 <-- de-indent next line after continuation section
            // x++
            depth--;
        }

        // CONTINUATION SECTION: Text [Formatted] Start
        // ( LTrim <-- check this START parenthesis
        //     Indented line of text
        // )
        // Skip hotkey "open parenthesis" (::
        if (purifiedLine.match(/^\((?!::)(?=.*\bltrim\b)/)) {
            continuationSectionTextFormat = true;
            depth++;
        }

        // ONE COMMAND CODE
        // Loop, %var% <-- indent next line
        //     code
        // code
        if (detectOneCommandCode && nextLineIsOneCommandCode(purifiedLine)) {
            oneCommandCode = true;
            depth++;
        }

        // DEBUG CONSOLE OUTPUT
        if (lineIndex === lines.length - 1) {
            if (
                !(
                    isDeepStrictEqual(ifDepth.depth, [-1]) ||
                    isDeepStrictEqual(ifDepth.depth, [-1, 0])
                ) &&
                !(
                    isDeepStrictEqual(focDepth.depth, [-1]) ||
                    isDeepStrictEqual(focDepth.depth, [-1, 0])
                )
            ) {
                // If code is finished (number of open and close braces are
                // equal, flow of control statements has code after one command
                // code, etc...) arrays must be equal [-1] or [-1, 0]. Last zero
                // in array stays, because formatter waits code after close
                // brace, but instead reaches EOF. If not equal, syntax is
                // incorrect of there is bug in formatter logic.
                console.error('Internal formatter data:');
                console.log(' ifDepth:');
                console.log(ifDepth.depth);
                console.log('occDepth:');
                console.log(focDepth.depth);
            }
        }
    });

    formattedString = removeEmptyLines(
        formattedString,
        options.allowedNumberOfEmptyLines,
    );

    return formattedString;
};

/**
 * Is next line is one command code triggered by flow of control statement.
 *
 * Example:
 * ```ahk
 * if (var)   ; false
 *     MsgBox ; true
 * SoundBeep  ; false
 * ```
 * @return is next line is one command code
 */
function nextLineIsOneCommandCode(text: string, skipIf = false): boolean {
    /** Special keywords that can trigger one-line commands */
    const oneCommandList = [
        'ifnotexist',
        'ifexist',
        'ifwinactive',
        'ifwinnotactive',
        'ifwinexist',
        'ifwinnotexist',
        'ifinstring',
        'ifnotinstring',
        'if',
        'else',
        'loop',
        'for',
        'while',
        'catch',
    ];

    for (const oneCommand of oneCommandList) {
        if (skipIf && oneCommand === 'if') {
            continue;
        }
        // 1. Before 'oneCommandCode' allowed only optional close brace
        //    Example: '} else' or '} if'
        // 2. After 'oneCommandCode' not allowed semicolon
        //    Example: 'If:', 'Else:', 'Loop:', etc are valid labels, not 'oneCommandCode'
        //    Skip such labels, because they produce wrong additional level of indent
        // TODO: change \\s* to " ?" and "}?\\s*" to "(} )?"
        if (text.match('^}?\\s*' + oneCommand + '\\b(?!:)')) {
            return true;
        }
    }

    return false;
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.TextEdit[] {
        const stringToFormat = documentToString(document);

        const allowedNumberOfEmptyLines = Global.getConfig<number>(
            ConfigKey.allowedNumberOfEmptyLines,
        );

        const indentCodeAfterLabel = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterLabel,
        );

        const indentCodeAfterSharpDirective = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterSharpDirective,
        );

        const preserveIndent = Global.getConfig<boolean>(
            ConfigKey.preserveIndent,
        );

        const trimExtraSpaces = Global.getConfig<boolean>(
            ConfigKey.trimExtraSpaces,
        );

        const formattedString = internalFormat(stringToFormat, {
            ...options,
            allowedNumberOfEmptyLines,
            indentCodeAfterLabel,
            indentCodeAfterSharpDirective,
            preserveIndent,
            trimExtraSpaces,
        });

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedString),
        ];
    }
}
