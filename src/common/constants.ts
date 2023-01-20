/**
 * Semicolon must have at least one space or tab to its left or semicolon
 * placed at the beginning of a line.
 *
 * Example: `ToolTip;NotComment`, `ToolTip ;Comment`
 */
export const commentRegExp = /(?<=^|\s+);.*/;
