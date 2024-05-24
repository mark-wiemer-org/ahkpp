import { isDeepStrictEqual } from 'util';
import * as vscode from 'vscode';
import { commentRegExp } from '../common/constants';
import { ConfigKey, Global } from '../common/global';
import { FormatOptions } from './formattingProvider.types';
import {
    alignSingleLineComments,
    alignTextAssignOperator,
    braceNumber,
    buildIndentedLine,
    documentToString,
    FlowOfControlNestDepth,
    nextLineIsOneCommandCode,
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
    /** Current level of indentation. 0 = top-level, no indentation. */
    let depth = 0;
    /** Level of indentation on previous line */
    let prevLineDepth = 0;
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
    /** Previous line is one command code */
    let prevLineIsOneCommandCode = false;
    /**
     * Detect or not detect `oneCommandCode`.
     * Every iteration it's `true`, but becomes `false` when formatter increase
     * indent for next line by open brace `{`.
     * It's prevent wrong extra indent, when `{` present after flow of control
     * statement: one indent for `{` and additional indent for `oneCommandCode`.
     */
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
     * True iff continuation section is for text and should be formatted
     * ```ahk
     * ( LTrim
     *     Indented line of text
     * )
     * ```
     */
    let continuationSectionTextFormat = false;
    /**
     * True iff continuation section is for text but should **not** be formatted
     * ```ahk
     * ( [NO LTrim option!]
     * Line of text with preserved user formatting
     * )
     * ```
     */
    let continuationSectionTextNotFormat = false;
    /**
     * Level of indentation of current line increased by open brace `{`, but not
     * inside expression continuation section.
     */
    let openBraceIndent = false;
    /**
     * The indentation of `oneCommandCode` is delayed, because the current line
     * is an expression continuation section. The indentation is delayed by
     * temporarily disabling `oneCommandCode`.
     */
    let deferredOneCommandCode = false;
    /**
     * Indent level of open brace `{` that belongs to object's initialization
     * with continuation section.
     */
    let openBraceObjectDepth = -1;

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
    let preBlockCommentPrevLineDepth = 0;
    let preBlockCommentOneCommandCode = false;
    let preBlockCommentIfDepth = new FlowOfControlNestDepth();
    let preBlockCommentFocDepth = new FlowOfControlNestDepth();

    // SETTINGS' ALIASES
    const indentCodeAfterLabel = options.indentCodeAfterLabel;
    const indentCodeAfterIfDirective = options.indentCodeAfterIfDirective;
    const trimSpaces = options.trimExtraSpaces;

    // REGULAR EXPRESSION
    /** Formatter's directive `;@AHK++AlignAssignmentOn` */
    const ahkAlignAssignmentOn = /;\s*@AHK\+\+AlignAssignmentOn/i;
    /** Formatter's directive `;@AHK++AlignAssignmentOff` */
    const ahkAlignAssignmentOff = /;\s*@AHK\+\+AlignAssignmentOff/i;
    /** Formatter's directive `;@AHK++FormatBlockCommentOn` */
    const ahkFormatBlockCommentOn = /;\s*@AHK\+\+FormatBlockCommentOn/i;
    /** Formatter's directive `;@AHK++FormatBlockCommentOff` */
    const ahkFormatBlockCommentOff = /;\s*@AHK\+\+FormatBlockCommentOff/i;
    /**
     * A line that starts with `and`, `or`, `||`, `&&`, a comma, or a period is
     * automatically merged with the line directly above it (the same is true
     * for all other expression operators except `++` and `--`).
     *
     * Skip `++`, `--`, block comments `/ *` and `* /`
     */
    const continuationSection =
        /^(((and|or|not)\b)|[\^!~?:&<>=.,|]|\+(?!\+)|-(?!-)|\/(?!\*)|\*(?!\/))/;
    /**
     * Label name may consist of any characters other than `space`, `tab`,
     * `comma` and the escape character (`). Not ended by double colon `::`.
     *
     * Generally, aside from whitespace and comments,
     * no other code can be written on the same line as a label.
     *
     * Example: `Label:`
     */
    const label = /^[^\s\t,`]+(?<!:):$/;
    /**
     * Hotkey and hotstring without code after it.
     *
     * Example: `F1 & F2 Up::` (hotkey), `::btw::` (hotstring)
     */
    const hotkey = /^.+::$/;
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
        const comment = commentRegExp.exec(originalLine)?.[0] ?? '';
        let formattedLine = originalLine.replace(commentRegExp, ''); // Remove single line comment
        formattedLine = trimExtraSpaces(formattedLine, trimSpaces) // Remove extra spaces between words
            .concat(comment) // Add removed single line comment back
            .trim();
        /** Line is empty or this is a single line comment */
        const emptyLine = purifiedLine === '';

        detectOneCommandCode = true;

        const openBraceNum = braceNumber(purifiedLine, '{');
        const closeBraceNum = braceNumber(purifiedLine, '}');

        // =====================================================================
        // |                            THIS LINE                              |
        // =====================================================================

        // STOP DIRECTIVE for formatter
        if (emptyLine) {
            if (alignAssignment && comment.match(ahkAlignAssignmentOff)) {
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
            if (formatBlockComment && comment.match(ahkFormatBlockCommentOff)) {
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
                preBlockCommentPrevLineDepth = prevLineDepth;
                preBlockCommentOneCommandCode = oneCommandCode;
                preBlockCommentIfDepth = ifDepth;
                preBlockCommentFocDepth = focDepth;
                // reset indent values to default values
                tagDepth = depth;
                prevLineDepth = depth;
                oneCommandCode = false;
                ifDepth = new FlowOfControlNestDepth();
                focDepth = new FlowOfControlNestDepth();
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
                    prevLineDepth = preBlockCommentPrevLineDepth;
                    oneCommandCode = preBlockCommentOneCommandCode;
                    ifDepth = preBlockCommentIfDepth;
                    focDepth = preBlockCommentFocDepth;
                }
            }
            if (!formatBlockComment) {
                return;
            }
        }

        // SINGLE LINE COMMENT
        if (
            emptyLine &&
            // skip formatter's directives
            !comment.match(ahkAlignAssignmentOn) &&
            !comment.match(ahkAlignAssignmentOff) &&
            !comment.match(ahkFormatBlockCommentOn) &&
            !comment.match(ahkFormatBlockCommentOff)
        ) {
            // save with zero indent (indent value don't matter here)
            formattedString += buildIndentedLine(
                lineIndex,
                lines.length,
                formattedLine,
                0,
                options,
            );
            return;
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
            purifiedLine.match(continuationSection) &&
            // skip Hotkeys:: and ::Hotstrings:: (they has '::')
            !purifiedLine.match(/::/)
        ) {
            continuationSectionExpression = true;
            // CONTINUATION SECTION: Object
            // obj := { a: 1
            //     , b: 2 <-- revert one! indent level after open brace or
            //     , c: 3 }                                 multiply open braces
            if (openBraceIndent) {
                depth--;
                openBraceObjectDepth = prevLineDepth;
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

        // CLOSE BRACE
        if (closeBraceNum) {
            // FLOW OF CONTROL
            // Example (restore close brace depth):
            // foo() {
            //     for
            //         if
            //             return
            // } ; <-- de-indent from all nesting before loosing information
            //         about depth via focDepth.exitBlockOfCode() below
            if (focDepth.last() > -1) {
                depth = focDepth.last();
            }
            ifDepth.exitBlockOfCode(closeBraceNum);
            focDepth.exitBlockOfCode(closeBraceNum);
            // CONTINUATION SECTION: Object
            // obj := { a: 1
            //     , b: 2
            //     , c: 3 } <-- skip de-indent by brace in Continuation Section: Object
            if (!continuationSectionExpression) {
                depth -= closeBraceNum;
            }
        }

        // OPEN BRACE
        if (openBraceNum) {
            // ONE COMMAND CODE
            // else
            //     Loop { <-- skip de-indent one command code with open brace
            //         code
            if (
                (oneCommandCode || deferredOneCommandCode) &&
                !nextLineIsOneCommandCode(purifiedLine)
            ) {
                if (deferredOneCommandCode) {
                    // if (a = 4
                    //     and b = 5) {
                    //     MsgBox <-- disable deferredOneCommandCode indent
                    // }
                    deferredOneCommandCode = false;
                } else if (purifiedLine.match(/^{/)) {
                    // if (var)
                    // { <-- revert oneCommandCode indent for open brace
                    //     MsgBox
                    // }
                    // if (var)
                    //     obj := { key1: val1 <-- but not for object continuation
                    //         , key2: val2 }                            section
                    oneCommandCode = false;
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
        // if (a > 0
        //     and b > 0)          <-- skip continuation section
        //     code                <-- skip one command code
        //     /* block comment */ <-- skip block comment
        // code           <-- de-indent
        if (
            (ifDepth.last() > -1 || focDepth.last() > -1) &&
            !continuationSectionExpression &&
            !oneCommandCode &&
            (!blockComment || formatBlockComment)
        ) {
            // Else: <-- skip valid LABEL
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
            } else if (!purifiedLine.match(/^{/) && !purifiedLine.match(/^}/)) {
                // Example (skip irrelevant braces):
                // if       <-- relevant
                // {        <-- skip irrelevant
                //     code <-- relevant
                // }        <-- skip irrelevant
                // code     <-- relevant
                // Example (main logic):
                // if           |  loop
                //     if       |      loop
                //         code |          code
                // code         |  code           <-- de-indent from all nesting
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

        // #DIRECTIVE
        // #IfWinActive WinTitle1
        //     Hotkey::
        // #IfWinActive WinTitle2 <-- fall-through scenario for #Directive with
        //     Hotkey::                                               parameters
        // #If                    <-- de-indent #Directive without parameters
        if (purifiedLine.match('^' + sharpDirective + '\\b')) {
            if (tagDepth > 0) {
                depth -= tagDepth;
            } else {
                depth--;
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

        // SWITCH-CASE-DEFAULT or LABEL: or HOTKEY::
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default:
            depth--;
        } else if (purifiedLine.match(label) || purifiedLine.match(hotkey)) {
            if (indentCodeAfterLabel) {
                // Label: or Hotkey::
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

        prevLineDepth = depth;

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
            if (comment.match(ahkAlignAssignmentOn)) {
                alignAssignment = true;
            } else if (comment.match(ahkFormatBlockCommentOn)) {
                formatBlockComment = true;
            }
        }

        // ONE COMMAND CODE
        if (
            oneCommandCode &&
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
        // if {        <-- check IF
        //     code
        // } else if { <-- check IF
        //     code
        // } else if   <-- check IF
        //     code
        // else if     <-- check IF
        //     code
        // If:         <-- skip valid LABEL
        if (purifiedLine.match(/^(}? ?else )?if\b(?!:)/)) {
            ifDepth.push(depth);
        }

        // OPEN BRACE
        if (openBraceNum) {
            depth += openBraceNum;
            // Do not detect 'oneCommandCode', because it will produce extra
            // indent for next line like in example below:
            // if {
            //         code <-- wrong extra indent by oneCommandCode
            //     code
            // }
            detectOneCommandCode = false;
            // CONTINUATION SECTION: Nested Objects
            if (!continuationSectionExpression) {
                openBraceIndent = true;
            } else {
                openBraceIndent = false;
            }
            // FLOW OF CONTROL
            ifDepth.enterBlockOfCode(openBraceNum);
            focDepth.enterBlockOfCode(openBraceNum);
        } else {
            openBraceIndent = false;
        }

        // #DIRECTIVE with parameters
        // #If Expression <-- indent next line after '#Directive'
        //     F1:: MsgBox Help
        if (
            purifiedLine.match('^' + sharpDirective + '\\b.+') &&
            indentCodeAfterIfDirective
        ) {
            depth++;
        }

        // SWITCH-CASE-DEFAULT or LABEL: or HOTKEY::
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default: <-- indent next line
            //     code
            depth++;
            // Do not sync here 'tagDepth' with 'depth' to prevent 'Return' and
            // 'ExitApp' to de-indent inside 'Switch-Case-Default' construction!
        } else if (purifiedLine.match(label) || purifiedLine.match(hotkey)) {
            if (indentCodeAfterLabel) {
                // Label: or Hotkey:: <-- indent next line
                //     code
                // Do this only if the LABEL is not inside a nested code
                if (focDepth.depth.length === 1) {
                    depth++;
                    tagDepth = depth;
                }
            }
        }

        // CONTINUATION SECTION: Expression, Object
        if (continuationSectionExpression) {
            continuationSectionExpression = false;
            // Object - Check close braces of nested objects
            // obj := { a: 1
            //     , b : { c: 2
            //         , d: 3 } } <-- multiply close braces in nested objects
            if (closeBraceNum) {
                depth -= closeBraceNum;
                // obj := { a: 1
                //     , b : { c: 2
                //         , d: 3 } } <-- revert indent after last close brace
                if (openBraceObjectDepth === depth) {
                    openBraceObjectDepth = -1;
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

    formattedString = alignSingleLineComments(formattedString, options);

    formattedString = removeEmptyLines(
        formattedString,
        options.allowedNumberOfEmptyLines,
    );

    return formattedString;
};

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        _: vscode.CancellationToken,
    ): vscode.TextEdit[] {
        const stringToFormat = documentToString(document);

        const allowedNumberOfEmptyLines = Global.getConfig<number>(
            ConfigKey.allowedNumberOfEmptyLines,
        );

        const indentCodeAfterLabel = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterLabel,
        );

        const indentCodeAfterIfDirective = Global.getConfig<boolean>(
            ConfigKey.indentCodeAfterIfDirective,
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
            indentCodeAfterIfDirective,
            preserveIndent,
            trimExtraSpaces,
        });

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedString),
        ];
    }
}
