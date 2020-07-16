import * as fs from "fs";
import * as vscode from "vscode";
import { CodeUtil } from "../../common/codeUtil";
import { Out } from "../../common/out";
import { Script, Method, Ref, Label, Block } from "./model";

export class Detecter {

    private static documentCache = new Map<string, Script>();

    /**
     * load method list by path
     * @param buildPath
     */
    public static async buildByPath(buildPath: string) {
        if (!buildPath) return;
        if (fs.statSync(buildPath).isDirectory()) {
            fs.readdir(buildPath, (err, files) => {
                if (err) {
                    Out.log(err);
                    return;
                }
                for (const file of files) {
                    if (file.match(/(^\.|out|target|node_modules)/)) {
                        continue;
                    }
                    this.buildByPath(buildPath + "/" + file);
                }
            });
        } else if (buildPath.match(/\b(ahk|ext)$/i)) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(buildPath));
            this.buildScript(document);
        }

    }

    /**
     * detect method list by document
     * @param document 
     */
    public static async buildScript(document: vscode.TextDocument, usingCache = false): Promise<Script> {

        if (usingCache && null != this.documentCache.get(document.uri.path)) {
            return this.documentCache.get(document.uri.path)
        }

        const methods: Method[] = [];
        let refs: Ref[] = [];
        const labels: Label[] = [];
        const blocks: Block[] = [];
        const lineCount = Math.min(document.lineCount, 10000);
        let blockComment = false;
        for (let line = 0; line < lineCount; line++) {
            const lineText = document.lineAt(line).text;
            if (lineText.match(/ *\/\*/)) {
                blockComment = true;
            }
            if (lineText.match(/ *\*\//)) {
                blockComment = false;
            }
            if (blockComment) {
                continue;
            }
            const methodOrRef = Detecter.detechMethodByLine(document, line);
            if (methodOrRef) {
                if (methodOrRef instanceof Method) {
                    methods.push(methodOrRef);
                    refs.push(new Ref(methodOrRef.name, document, line, methodOrRef.character))
                } else if (methodOrRef instanceof Array) {
                    refs = refs.concat(methodOrRef)
                } else {
                    refs.push(methodOrRef)
                }
            }
            const label = Detecter.getLabelByLine(document, line);
            if (label) {
                labels.push(label);
            }
            const block = Detecter.getBlockByLine(document, line);
            if (block) {
                blocks.push(block);
            }
        }
        const script: Script = { methods, labels, refs,blocks }
        this.documentCache.set(document.uri.path, script)
        return script;
    }

    public static async getMethodByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const method of this.documentCache.get(document.uri.path).methods) {
            if (method.name.toLowerCase() == name) {
                return method;
            }
        }
        for (const filePath of this.documentCache.keys()) {
            for (const method of this.documentCache.get(filePath).methods) {
                if (method.name.toLowerCase() == name) {
                    return method;
                }
            }
        }
    }

    public static async getLabelByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const label of this.documentCache.get(document.uri.path).labels) {
            if (label.name.toLowerCase()==name) {
                return label;
            }
        }
        for (const filePath of this.documentCache.keys()) {
            for (const label of this.documentCache.get(filePath).labels) {
                if (label.name.toLowerCase()==name) {
                    return label;
                }
            }
        }
    }

    public static getAllRefByName(name: string): Ref[] {
        const refs = [];
        name = name.toLowerCase()
        for (const filePath of this.documentCache.keys()) {
            const document = this.documentCache.get(filePath)
            for (const ref of document.refs) {
                if (ref.name.toLowerCase() == name) {
                    refs.push(ref)
                }
            }
        }
        return refs;
    }

    private static getBlockByLine(document: vscode.TextDocument, line: number):Block {
        const { text } = document.lineAt(line);
        const blockMatch = text.match(/;;(.+)/);
        if (blockMatch) {
            return {document,line,name:blockMatch[1],character:text.indexOf(blockMatch[1])}
        }
    }

    private static getLabelByLine(document: vscode.TextDocument, line: number) {
        const text = CodeUtil.purity(document.lineAt(line).text);
        const label = /^ *([\u4e00-\u9fa5_a-zA-Z0-9]+) *:{1}(?!(:|=))/.exec(text)
        if (label) {
            const labelName = label[1]
            if(labelName.toLowerCase()=="case" || labelName.toLowerCase()=="default")return;
            return new Label(label[1], document, line, text.indexOf(labelName));
        }
    }

    /**
     * detect method by line
     * @param document
     * @param line
     */
    private static detechMethodByLine(document: vscode.TextDocument, line: number, origin?: string) {

        origin = origin != undefined ? origin : document.lineAt(line).text;
        const text = CodeUtil.purity(origin);
        const refPattern = /\s*(([\u4e00-\u9fa5_a-zA-Z0-9]+)(?<!if|while)\s*\(.*?\))\s*(\{)?\s*/i
        const methodMatch = text.match(refPattern);
        if (!methodMatch) {
            return;
        }
        const methodName = methodMatch[2];
        const character = origin.indexOf(methodName);
        if (text.length != methodMatch[0].length) {
            let refs = [new Ref(methodName, document, line, character)];
            const newRef = this.detechMethodByLine(document, line, origin.replace(new RegExp(methodName + "\\s*\\("), ""));
            if(newRef){
                if (newRef instanceof Array) {
                    refs = refs.concat(newRef);
                } else {
                    refs.push(newRef)
                }
            }
            return refs
        }
        const methodFullName = methodMatch[1];
        const isMethod = methodMatch[3];
        if (isMethod) {
            return new Method(methodFullName, methodName, document, line, character, Detecter.getRemarkByLine(document, line - 1));
        }
        for (let i = line + 1; i < document.lineCount; i++) {
            const nextLineText = CodeUtil.purity(document.lineAt(i).text);
            if (!nextLineText.trim()) { continue; }
            if (nextLineText.match(/^\s*{/)) {
                return new Method(methodFullName, methodName, document, line, character, Detecter.getRemarkByLine(document, line - 1));
            } else {
                return new Ref(methodName, document, line, character)
            }
        }
    }

    /**
     * detech remark, remark format: ;any
     * @param document 
     * @param line 
     */
    private static getRemarkByLine(document: vscode.TextDocument, line: number) {
        if (line >= 0) {
            const { text } = document.lineAt(line);
            const markMatch = text.match(/^\s*;(.+)/);
            if (markMatch) {
                return markMatch[1];
            }
        }
        return null;
    }

}