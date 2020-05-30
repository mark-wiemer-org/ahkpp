import * as fs from "fs";
import * as path from 'path';
import * as vscode from "vscode";

export class FileManager {
    private static storagePath: string;
    public static init(context: vscode.ExtensionContext) {
        this.storagePath = context.globalStoragePath;
    }

    private static check(path: string) {
        if (!fs.existsSync(path)) fs.mkdirSync(path)
    }

    public static show(fileName: string) {
        if (!this.storagePath) { vscode.window.showErrorMessage("FileManager is not init!") }
        if (!fileName) { return; }
        const recordPath = `${this.storagePath}/${fileName}`;
        this.check(this.storagePath)
        this.check(path.resolve(recordPath, '..'))
        const openPath = vscode.Uri.file(recordPath);
        return new Promise((resolve) => {
            vscode.workspace.openTextDocument(openPath).then(async (doc) => {
                resolve(await vscode.window.showTextDocument(doc));
            });
        })

    }

    /**
     * 
     * @param return actually file name
     */
    public static record(fileName: string, content: string, model?: FileModel): Promise<string> {
        if (!this.storagePath) { vscode.window.showErrorMessage("FileManager is not init!") }
        if (!fileName) { return; }
        return new Promise((resolve, reject) => {
            const recordPath = `${this.storagePath}/${fileName}`;
            this.check(this.storagePath)
            this.check(path.resolve(recordPath, '..'))
            if (model == FileModel.WRITE) {
                fs.writeFileSync(recordPath, `${content}`, { encoding: 'utf8' });
            } else {
                fs.appendFileSync(recordPath, `${content}`, { encoding: 'utf8' });
            }
            resolve(recordPath)
        });
    }
}

export enum FileModel {
    WRITE, APPEND
}