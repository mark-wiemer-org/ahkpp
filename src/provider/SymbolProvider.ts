import * as vscode from "vscode";
import { Detecter } from "../core/detect/detecter";

export class SymBolProvider implements vscode.DocumentSymbolProvider {
    public async provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {

        const result = [];

        const script = await Detecter.buildScript(document, false)

        for (const method of script.methods) {
            result.push(
                new vscode.SymbolInformation(method.full, vscode.SymbolKind.Method, method.comment,
                    new vscode.Location(method.document.uri, new vscode.Position(method.line, method.character))
                )
            )
        }

        for (const label of script.labels) {
            result.push(
                new vscode.SymbolInformation(label.name, vscode.SymbolKind.Field, null,
                    new vscode.Location(label.document.uri, new vscode.Position(label.line, label.character))
                )
            )
        }

        // const { text } = document.lineAt(line);
        // const hotKeyMatch = text.match(/;;(.+)/);
        // if (hotKeyMatch) {
        //     return new vscode.SymbolInformation(hotKeyMatch[1], vscode.SymbolKind.Module, null, new vscode.Location(document.uri, new vscode.Position(line, 0)));
        // }

        return result;
    }

}


