import * as vscode from "vscode";

export class AhkCodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken):
        vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        return [
            new vscode.CodeAction("测试",vscode.CodeActionKind.Refactor)
        ]
    }
}