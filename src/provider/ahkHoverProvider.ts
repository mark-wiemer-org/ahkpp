import { HoverProvider, TextDocument, Position, CancellationToken, ExtensionContext, ProviderResult, Range, Hover, MarkdownString } from "vscode";
import { join } from "path";
import { readFileSync } from "fs";

interface Snippet {
    prefix: string;
    body: string;
    description?: string;
}

export class AhkHoverProvider implements HoverProvider {

    private snippetMap: Map<string, Snippet>;
    public constructor(context: ExtensionContext) {
        const ahk = JSON.parse(readFileSync(join(context.extensionPath, "snippets", "ahk.json"), "UTF8"))
        this.snippetMap = new Map<string, Snippet>();
        // tslint:disable-next-line: forin
        for (const key in ahk) {
            this.snippetMap.set(key.toLowerCase(), ahk[key])
        }
    }

    public provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
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
        if (nextChart == "(") {
            word += "()";
        }

        const snippet = this.snippetMap.get(word.toLowerCase())
        if (snippet) {
            let content = new MarkdownString(null, true)
                .appendCodeblock(snippet.body, 'ahk')
            if (snippet.description) {
                content = content.appendText(snippet.description)
            }
            return new Hover(content)
        }

        return null
    }

}