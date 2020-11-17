import { readFileSync } from "fs";
import { join } from "path";
import { CancellationToken, ExtensionContext, Hover, HoverProvider, MarkdownString, Position, Range, TextDocument } from "vscode";
import { Parser } from "../parser/parser";

interface Snippet {
    prefix: string;
    body: string;
    description?: string;
}

interface Context {
    nextChart: string;
    word: string;
}

export class AhkHoverProvider implements HoverProvider {

    private snippetCache: Map<string, Snippet>;
    public constructor(context: ExtensionContext) {
        this.initSnippetCache(context);
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken) {

        const context = this.buildContext(document, position)

        const snippetHover = this.tryGetSnippetHover(context)
        if (snippetHover) {
            return snippetHover;
        }

        const method = await Parser.getMethodByName(document, context.word)
        if (method) {
            const markdonw = new MarkdownString("", true).appendCodeblock(method.full)
            if (method.comment) {
                markdonw.appendText(method.comment)
            }
            return new Hover(markdonw)
        }

        return null
    }

    private tryGetSnippetHover(context: Context): Hover {
        let snippetKey = context.word.toLowerCase();
        if (context.nextChart == "(") {
            snippetKey += "()"
        }
        const snippet = this.snippetCache.get(snippetKey)
        if (snippet) {
            const content = new MarkdownString(null, true)
                .appendCodeblock(snippet.body, 'ahk')
            if (snippet.description) {
                 content.appendText(snippet.description)
            }
            return new Hover(content)
        }
    }

    private buildContext(document: TextDocument, position: Position): Context {
        const line = position.line;
        const wordRange = document.getWordRangeAtPosition(position)
        let word = document.getText(wordRange);
        if (wordRange.start.character > 0) {
            const preChart = document.getText(new Range(line, wordRange.start.character - 1, line, wordRange.start.character))
            if (preChart == "#") {
                word = "#" + word;
            }
        }
        const nextChart = document.getText(new Range(line, wordRange.end.character, line, wordRange.end.character + 1))
        return { word, nextChart }
    }

    private initSnippetCache(context: ExtensionContext) {
        const ahk = JSON.parse(readFileSync(join(context.extensionPath, "snippets", "ahk.json"), "UTF8"));
        this.snippetCache = new Map<string, Snippet>();
        // tslint:disable-next-line: forin
        for (const key in ahk) {
            const snip = ahk[key] as Snippet;
            if (typeof snip.body === 'string') {
                snip.body = snip.body?.replace(/\d{1}:/g, "");
            }
            this.snippetCache.set(key.toLowerCase(), snip);
        }
    }

}