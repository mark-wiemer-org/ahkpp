import format from 'date-format';
import * as vscode from "vscode";

function formatDate(date: Date) {
    if (!date) return '';
    return format('yyyy-MM-dd hh:mm:ss', date);
}

export class Out {

    private static outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("AHK");

    public static debug(value: any) {
        this.log(value, false)
    }

    public static log(value: any, focus = true) {
        if (value instanceof Error) {
            console.trace(value)
            value = value.message
        }
        if (focus) {
            this.outputChannel.show(focus);
        }
        const begin = formatDate(new Date());
        this.outputChannel.appendLine(`${begin} ${value}`);
    }

}