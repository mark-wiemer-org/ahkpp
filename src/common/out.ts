import * as vscode from 'vscode';

/** Logs messages to VS output channel */
export class Out {
    private static outputChannel: vscode.OutputChannel =
        vscode.window.createOutputChannel('AHK');

    public static debug(value: unknown) {
        this.log(value, false);
    }

    /**
     * Logs the given value. Traces errors to console before logging.
     * Prepends all logs with `new Date().toISOString()`.
     * @param value The value to log
     */
    public static log(value: unknown, focus = true) {
        if (value instanceof Error) {
            console.trace(value);
            value = value.message;
        }
        if (focus) {
            this.outputChannel.show(focus);
        }
        this.outputChannel.appendLine(`${new Date().toISOString()} ${value}`);
    }
}
