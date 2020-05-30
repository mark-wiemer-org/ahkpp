import { DbgpResponse } from "../AhkRuntime";

export interface AhkStackItem {
    /** stack order */
    index: number;
    /** * stack name */
    name: string;
    /** stack source file path */
    file: string;
    /** source file executing line */
    line: number;
}

export interface AhkStack {
    frames: AhkStackItem[];
    count: number;
}

export class StackHandler {

    public static handle(response: DbgpResponse, startFrame: number, endFrame: number, currentFile: string): AhkStack {

        if (response.children) {
            const stackList = Array.isArray(response.children.stack) ? response.children.stack : Array.of(response.children.stack);
            const frames = new Array<any>();
            for (let i = startFrame; i < Math.min(endFrame, stackList.length); i++) {
                const stack = stackList[i];
                frames.push({
                    index: i,
                    name: `${stack.attributes.where}`,
                    file: `${stack.attributes.filename}`,
                    line: parseInt(`${stack.attributes.lineno}`) - 1,
                });
            }
            return ({ frames, count: stackList.length });
        } else {
            return { frames: [], count: 0 };
        }

    }

}