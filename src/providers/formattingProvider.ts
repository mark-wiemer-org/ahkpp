import * as vscode from 'vscode';
import { ConfigKey, Global } from '../common/global';
import { FormatOptions } from './formattingProvider.types';
import {
    alignTextAssignOperator,
    braceNumber,
    buildIndentedLine,
    documentToString,
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

    let formattedString = '';
    /** Current level of indentation. 0 = top-level, no indentation */
    let depth = 0;
    /**
     * It's marker for `Return`, `ExitApp`, `#Directive` commands, which allow/disallow for them to be un-indented.
     *
     * `tagDepth === 0`:
     *
     *    Indentation level was decreased by `Return` or `ExitApp` command, so they placed on same
     *    indentation level as `Label`.
     *    Decrement of indentation level by `Label` is disallowed (previous `Label` finished with `Return`
     *    or `ExitApp` command and un-indent for fall-through scenario not needed).
     *    Decrement indentation by one level for `#Directive` is allowed.
     *
     * `tagDepth === depth`:
     *
     *    Current indentation level is in sync with `Label` indentation level (no additional indent added
     *    by block `{}`, `oneCommandCode`, etc...).
     *    `Return` or `ExitApp` commands allowed to be un-indented, so they will be placed on same
     *    indentation level as `Label`.
     *    `Label` allowed to be un-indented for fall-through scenario.
     *
     * `tagDepth !== depth`:
     *
     *    `Return` or `ExitApp` commands disallowed to be un-indented, so they will obey indentation rules
     *    as code above them (`Return` inside function, block `{}`, `oneCommandCode`, etc... stay on same
     *    indentation level as code above them).
     *
     * `tagDepth > 0` :
     *
     *    `#Directive` allowed to be un-indented by `tagDepth` value (jump several indentation levels).
     *
     * `tagDepth = depth`:
     *
     *    Only `Label` makes syncing `tagDepth` with `depth`.
     *    `Case:` and `Default:` must not make syncing to disallow `Return` and `ExitApp` un-indent
     *    inside `Switch-Case` block.
     */
    let tagDepth = 0;
    /**
     * `True` if this line is an one-statement block. Example:
     * ```ahk
     * if (var)   ; false
     *     MsgBox ; true
     * SoundBeep  ; false
     *  ```
     */
    let oneCommandCode = false;
    let blockComment = false;
    /** Base indent, that block comment had in original code */
    let blockCommentIndent = '';
    /**
     * Detect or not detect `oneCommandCode`.
     * Every iteration it's `true`, but become `false` if formatter increase indent for next line for open brace `{`.
     * It's prevents wrong extra indent, if `{` present after `oneCommandCode` code:
     * one indent for `{` and additional indent for `oneCommandCode`.
     */
    let detectOneCommandCode = true;
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
    /**
     * Formatter's directive:
     * ```ahk
     * ;@AHK++FormatBlockCommentOn
     * ;@AHK++FormatBlockCommentOff
     * ```
     * Format text inside block comment like regular code
     */
    let formatBlockComment = false;
    // Save important values to this variables on block comment enter, restore them on exit
    let preBlockCommentDepth = 0;
    let preBlockCommentTagDepth = 0;
    let preBlockCommentOneCommandCode = false;

    /**
     * This line is `#Directive`, that will create context-sensitive hotkeys and hotstrings.
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
    /**
     * Continuation section: Expression, Object
     * ```ahk
     * obj := { a: 1 ; false
     *     , b: 2 } ; true
     * if a = 1 ; false
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
     * Indent was increased by brace `{`, but not inside expression continuation section
     */
    let braceIndent = false;
    /**
     * The indentation of `oneCommandCode` is delayed because the current line is
     * an expression continuation section. The indentation is delayed by temporarily
     * disabling `oneCommandCode`.
     */
    let deferredOneCommandCode = false;
    /**
     * Array of depth of open brace `{` that belongs to object initialization
     * with continuation section.
     */
    const waitCloseBraceObject: number[] = [];

    const indentCodeAfterLabel = options.indentCodeAfterLabel;
    const indentCodeAfterSharpDirective = options.indentCodeAfterSharpDirective;
    const trimSpaces = options.trimExtraSpaces;

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
    /** Label name may consist of any characters other than `space`,
     * `tab`, `comma` and the escape character (`).
     * Generally, aside from whitespace and comments,
     * no other code can be written on the same line as a label.
     *
     * Example: `Label:`
     */
    const label = /^[^\s\t,`]+:$/;

    const lines = stringToFormat.split('\n');

    lines.forEach((originalLine, lineIndex) => {
        const purifiedLine = purify(originalLine).toLowerCase();
        /** The line comment. Empty string if no line comment exists */
        const comment = /;.+/.exec(originalLine)?.[0] ?? '';
        let formattedLine = originalLine.replace(/;.+/, ''); // Remove single line comment
        formattedLine = trimExtraSpaces(formattedLine, trimSpaces) // Remove extra spaces between words
            .concat(comment) // Add removed single line comment back
            .trim();
        /** Line is empty or this is single comment line */
        const emptyLine = purifiedLine === '';

        continuationSectionExpression = false;
        detectOneCommandCode = true;
        sharpDirectiveLine = false;

        // ==========================================================================
        // |                               THIS LINE                                |
        // ==========================================================================

        // Stop directives for formatter
        if (emptyLine) {
            if (comment.match(/;\s*@AHK\+\+AlignAssignmentOff/i)) {
                alignAssignment = false;
                assignmentBlock = alignTextAssignOperator(assignmentBlock);
                // Save aligned block
                assignmentBlock.forEach((alignedFormattedLine, index) => {
                    formattedString += buildIndentedLine(
                        // return 'lineIndex' before 'assignmentBlock' and increment with 'index'
                        lineIndex - assignmentBlock.length + index + 1,
                        lines.length,
                        alignedFormattedLine,
                        depth,
                        options,
                    );
                });
                assignmentBlock = [];
            } else if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOff/i)) {
                formatBlockComment = false;
            }
        }

        // Align Assignment
        if (alignAssignment) {
            assignmentBlock.push(formattedLine);
            if (lineIndex !== lines.length - 1) {
                // skip to the next iteration
                return;
            }
            // Save aligned block if we reach end of text, but didn't find stop directive ';@AHK++AlignAssignmentOff'
            assignmentBlock.forEach((alignedFormattedLine, index) => {
                formattedString += buildIndentedLine(
                    // return 'lineIndex' before 'assignmentBlock' and increment with 'index'
                    lineIndex - assignmentBlock.length + index + 1,
                    lines.length,
                    alignedFormattedLine,
                    depth,
                    options,
                );
            });
            assignmentBlock = [];
        }

        // Block comments
        // The /* and */ symbols can be used to comment out an entire section,
        // but only if the symbols appear at the beginning of a line (excluding whitespace),
        // as in this example:
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
                // reset indent values to default values with added current 'depth' indent
                oneCommandCode = false;
                tagDepth = depth;
            }
        }

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
                    blockCommentLine,
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
                }
            }
            if (!formatBlockComment) {
                return;
            }
        }

        // Continuation section: Text [Not Formatted] Start
        // ( [NO LTrim option!] <-- check this START parenthesis
        // Line of text with preserved user formatting
        // )
        // Skip hotkey: (::
        if (purifiedLine.match(/^\((?!::)(?!.*\bltrim\b)/)) {
            continuationSectionTextNotFormat = true;
        }

        // Continuation section: Text [Not Formatted] Save with original indent
        if (continuationSectionTextNotFormat) {
            formattedString += originalLine.trimEnd() + '\n';
            // Continuation section: Text [Not Formatted] Stop
            // ( [NO LTrim option!]
            // Line of text with preserved user formatting
            // ) <-- check this STOP parenthesis
            if (purifiedLine.match(/^\)/)) {
                continuationSectionTextNotFormat = false;
            }
            return;
        }

        // Continuation section: Text [Formatted] Stop
        // ( LTrim
        //     Line of text
        // ) <-- check this STOP parenthesis
        if (continuationSectionTextFormat && purifiedLine.match(/^\)/)) {
            continuationSectionTextFormat = false;
            depth--;
        }

        // Continuation section: Text [Formatted] Save indented
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

        // Continuation section: Expression, Object
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
            // obj := { a: 1
            //     , b: 2 <-- revert indent after open brace
            //     , c: 3 }
            if (braceIndent) {
                depth--;
                waitCloseBraceObject.push(depth);
            }
            // if a = 1
            //     or b = 2 <-- revert indent for oneCommandCode and make it deferred
            //     MsgBox
            if (oneCommandCode) {
                deferredOneCommandCode = true;
                oneCommandCode = false;
                depth--;
            }
            depth++;
        }

        // Continuation section: Expression - Deferred oneCommandCode indent
        // if a = 1
        //     or b = 2
        //     MsgBox <-- restore deferred oneCommandCode
        if (deferredOneCommandCode && !continuationSectionExpression) {
            deferredOneCommandCode = false;
            oneCommandCode = true;
            depth++;
        }

        // #IfWinActive, #IfWinExist with omit params OR #If without expression
        if (purifiedLine.match('^' + sharpDirective + '$')) {
            if (indentCodeAfterSharpDirective) {
                if (tagDepth > 0) {
                    depth -= tagDepth;
                } else {
                    depth--;
                }
            }
        }

        // #IfWinActive, #IfWinExist with params OR #If with expression
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

        // Switch-Case-Default: or Label:
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default:
            depth--;
        } else if (purifiedLine.match(label)) {
            // Label:
            if (indentCodeAfterLabel) {
                if (tagDepth === depth) {
                    // De-indent label or hotkey, if they not end with 'return' command.
                    // This is fall-through scenario. Example:
                    // Label1:
                    //     code
                    // Label2:
                    //     code
                    // return
                    // No need to make 'tagDepth' in sync with 'depth', 'Label' check for next line will do it.
                    depth--;
                }
            }
        }

        // Check close braces
        // obj := { a: 1
        //     , b: 2
        //     , c: 3 } <-- skip de-indent by brace in Continuation Section: Object
        if (purifiedLine.includes('}') && !continuationSectionExpression) {
            const braceNum = braceNumber(purifiedLine, '}');
            depth -= braceNum;
        }

        // One command code and open braces
        if (
            (oneCommandCode || deferredOneCommandCode) &&
            purifiedLine.includes('{')
        ) {
            const braceNum = braceNumber(purifiedLine, '{');
            // if (a = 1)
            // { <-- revert indent (for brace) added by oneCommandCode
            //     MsgBox
            // }
            if (braceNum > 0) {
                oneCommandCode = false;
                // if (a = 4
                //     and b = 5) {
                //     MsgBox <-- disable deferredOneCommandCode indent
                // }
                if (deferredOneCommandCode) {
                    deferredOneCommandCode = false;
                } else {
                    depth--;
                }
            }
        }

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

        // ==========================================================================
        // |                               NEXT LINE                                |
        // ==========================================================================

        // Start directives for formatter
        if (emptyLine) {
            if (comment.match(/;\s*@AHK\+\+AlignAssignmentOn/i)) {
                alignAssignment = true;
            } else if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOn/i)) {
                formatBlockComment = true;
            }
        }

        // One command code
        if (
            oneCommandCode &&
            // Don't change indentation on empty lines (single line comment is equal to empty line) after one command code.
            !emptyLine &&
            // Don't change indentation on block comment after one command code.
            // Change indentation inside block comment, if user wants to format block comment.
            (!blockComment || formatBlockComment)
        ) {
            oneCommandCode = false;
            depth--;
        }

        // #IfWinActive, #IfWinExist with params OR #If with expression
        if (sharpDirectiveLine && indentCodeAfterSharpDirective) {
            depth++;
        }

        // Check open braces
        if (purifiedLine.includes('{')) {
            const braceNum = braceNumber(purifiedLine, '{');
            depth += braceNum;
            if (braceNum > 0) {
                // Do not detect 'oneCommandCode', because it will produce extra indent for next line:
                // if (true) {
                // |   |   wrong_extra_indented_code
                // |   code
                // }
                detectOneCommandCode = false;
                // Continuation section: Nested Objects
                if (!continuationSectionExpression) {
                    braceIndent = true;
                }
            }
        } else {
            braceIndent = false;
        }

        // Switch-Case-Default: or Label:
        if (purifiedLine.match(switchCaseDefault)) {
            // Case: or Default:
            depth++;
            // Do not sync 'tagDepth' with 'depth' to prevent 'Return' and 'ExitApp' to un-indent
            // inside 'Switch-Case-Default' construction
        } else if (purifiedLine.match(label) && indentCodeAfterLabel) {
            // Label:
            depth++;
            tagDepth = depth;
        }

        // Continuation section: Expression, Object
        if (continuationSectionExpression) {
            continuationSectionExpression = false;
            // Objects - Check close braces of nested objects
            // obj = { a: 1
            //     , b : { c: 2
            //         , d: 3 } } <-- multiply close brace in nested objects
            if (purifiedLine.includes('}')) {
                const braceNum = braceNumber(purifiedLine, '}');
                depth -= braceNum;
                // obj = { a: 1
                //     , b : { c: 2
                //         , d: 3 } } <-- revert indent after last close brace
                if (
                    waitCloseBraceObject[waitCloseBraceObject.length - 1] ===
                    depth
                ) {
                    waitCloseBraceObject.pop();
                    depth++;
                }
            }
            // Expression
            depth--;
        }

        // Continuation section: Text [Formatted] Start
        // ( LTrim <-- check this START parenthesis
        //     Indented line of text
        // )
        // Skip hotkey "open parenthesis" (::
        if (purifiedLine.match(/^\((?!::)(?=.*\bltrim\b)/)) {
            continuationSectionTextFormat = true;
            depth++;
        }

        // One command code
        // Loop, %var%
        //     code <-- indent for one line
        // code
        if (detectOneCommandCode) {
            for (const oneCommand of oneCommandList) {
                let temp: RegExpExecArray;
                // 1. Before 'oneCommandCode' allowed only optional close brace
                //    Example: '} else' or '} if'
                // 2. After 'oneCommandCode' not allowed semicolon
                //    Example: 'If:', 'Else:', 'Loop:', etc are valid labels, not 'oneCommandCode'
                //    Skip such labels, because they produce wrong additional level of indent
                if (purifiedLine.match('^}?\\s*' + oneCommand + '\\b(?!:)')) {
                    oneCommandCode = true;
                    depth++;
                    break;
                }
            }
        }
    });

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
