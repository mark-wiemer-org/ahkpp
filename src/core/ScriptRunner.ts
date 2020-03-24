import * as child_process from "child_process";
import * as vscode from "vscode";

export class ScriptRunner {
    public static run() {
        vscode.window.activeTextEditor.document.save().then(() => {
            child_process.exec("\"C:\\Program Files\\Autohotkey\\AutoHotkeyU64.exe\" " + vscode.window.activeTextEditor.document.fileName);
        });
    }
}
