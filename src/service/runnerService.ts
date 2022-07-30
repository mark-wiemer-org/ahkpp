import { resolve as res } from 'path';
import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import { FileManager, FileModel } from '../common/fileManager';
import { ConfigKey, Global } from '../common/global';
import { Process } from '../common/processWrapper';

export class RunnerService {
    /** Align assignments and comments in selection. */
    public static async alignSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        // User can select part of first and/or last line of text. For example:
        //      this text not selected [this text selected on first line
        //      this text selected on second line] this text is not selected
        // 'selection.end' is position of last character in selection,
        // not last character of second line! Same problem with start position of 'selection.start'.
        /** Position of last character in last selected line */
        const endLinePosition = document.lineAt(selection.end.line).range.end;
        const range = document.validateRange(
            new vscode.Range(
                selection.start.line,
                0,
                selection.end.line,
                endLinePosition.character,
            ),
        );
        editor
            .edit((editBuilder) => {
                const fullSelection = new vscode.Selection(
                    range.start,
                    range.end,
                );
                const text = CodeUtil.alignTextAssignOperator(fullSelection);
                editBuilder.replace(range, text);
            })
            // The edit call returns a promise. When that resolves you can set
            // the selection, otherwise you interfere with the edit itself.
            // So use "then" to execute once the edit is done;
            .then((success) => {
                // Deselect selection after replace, set cursor to end of last selected line.
                // Since the selection's start position and end position are the same,
                // it's not highlighting any text any more.
                editor.selection = new vscode.Selection(
                    endLinePosition,
                    endLinePosition,
                );
                // P.S. You can move cursor to absolute position in editor by setting selection like above!
            });
    }

    /** Runs the editor selection as a standalone script. */
    public static async runSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);
        this.run(await this.createTemplate(text));
    }

    public static async startDebugger(script?: string) {
        const cwd = script
            ? vscode.Uri.file(script)
            : vscode.window.activeTextEditor.document.uri;
        script = script ? script : await this.getPathByActive();
        const debugPlusExists = vscode.extensions.getExtension(
            'zero-plusplus.vscode-autohotkey-debug',
        );
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cwd), {
            type: debugPlusExists ? 'autohotkey' : 'ahk',
            request: 'launch',
            name: 'AutoHotkey Debugger',
            runtime: Global.getConfig<string>(ConfigKey.executePath),
            program: script,
        });
    }

    /**
     * Runs the script at the specified path
     */
    public static async run(path?: string): Promise<void> {
        const executePath = Global.getConfig(ConfigKey.executePath);
        this.checkAndSaveActive();
        if (!path) {
            path = await this.getPathByActive();
        }
        Process.exec(`\"${executePath}\" \"${path}\"`, {
            cwd: `${res(path, '..')}`,
        });
    }

    /**
     * Compiles current script
     */
    public static async compile() {
        const currentPath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (!currentPath) {
            vscode.window.showErrorMessage('Cannot compile never-saved files.');
            return;
        }
        this.checkAndSaveActive();
        const pos = currentPath.lastIndexOf('.');
        const compilePath =
            currentPath.substr(0, pos < 0 ? currentPath.length : pos) + '.exe';
        if (
            await Process.exec(
                `"${Global.getConfig(
                    ConfigKey.compilePath,
                )}" /in "${currentPath}" /out "${compilePath}"`,
                { cwd: `${res(currentPath, '..')}` },
            )
        ) {
            vscode.window.showInformationMessage('compile success!');
        }
    }

    public static async getPathByActive(): Promise<string> {
        const document = vscode.window.activeTextEditor.document;
        if (document.isUntitled) {
            return await this.createTemplate(document.getText());
        }
        return document.fileName;
    }

    public static async createTemplate(content: string) {
        const path = `temp-${this.getNowDate()}.ahk`;
        return await FileManager.record(path, content, FileModel.write);
    }

    private static checkAndSaveActive(): void {
        if (!vscode.window.activeTextEditor.document.isUntitled) {
            vscode.commands.executeCommand('workbench.action.files.save');
        }
    }

    private static getNowDate(): string {
        const date = new Date();
        let month: string | number = date.getMonth() + 1;
        let strDate: string | number = date.getDate();

        if (month <= 9) {
            month = '0' + month;
        }

        if (strDate <= 9) {
            strDate = '0' + strDate;
        }

        return (
            date.getFullYear() +
            '-' +
            month +
            '-' +
            strDate +
            '-' +
            this.pad(date.getHours(), 2) +
            '-' +
            this.pad(date.getMinutes(), 2) +
            '-' +
            this.pad(date.getSeconds(), 2)
        );
    }

    private static pad(n: any, width: number, z?: any): number {
        z = z || '0';
        n = n + '';
        return n.length >= width
            ? n
            : new Array(width - n.length + 1).join(z) + n;
    }
}
