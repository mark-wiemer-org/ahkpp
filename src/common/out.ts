import * as vscode from 'vscode';

/** Logs messages to IDE output channel */
export class Out {
    private static outputChannel: vscode.OutputChannel;

    /**
     * Logs the given value without focusing the output view.
     * Prepends all logs with `new Date().toISOString()`.
     */
    public static debug(value: Error | string) {
        Out.log(value, false);
    }

    /**
     * Logs the given value. Traces errors to console before logging.
     * Prepends all logs with `new Date().toISOString()`.
     * @param value The value to log
     * @param focus whether to focus the output view. Defaults to true.
     */
    public static log(value: Error | string, focus = true) {
        if (value instanceof Error) {
            console.trace(value);
            value = value.message;
        }
        if (!this.outputChannel) {
            this.outputChannel =
                vscode.window.createOutputChannel('AHK++ (v1)');
        }
        if (focus) {
            this.outputChannel.show(focus);
        }
        this.outputChannel.appendLine(`${new Date().toISOString()} ${value}`);
    }
}
