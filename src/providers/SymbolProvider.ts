import * as vscode from "vscode";
import { Parser } from "../parser/parser";

export class SymBolProvider implements vscode.DocumentSymbolProvider {
    public async provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {

        const result = [];

        const script = await Parser.buildScript(document, false)

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

        for (const block of script.blocks) {
            result.push(
                new vscode.SymbolInformation(block.name, vscode.SymbolKind.Module, null, new vscode.Location(block.document.uri, new vscode.Position(block.line, block.character)))
            )
        }

        for (const variable of script.variables) {
            result.push(
                new vscode.SymbolInformation(variable.name, vscode.SymbolKind.Variable, null, new vscode.Location(variable.document.uri, new vscode.Position(variable.line, variable.character)))
            )
        }

        return result;
    }

}


