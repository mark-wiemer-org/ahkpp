import { DbgpResponse } from "../struct/dbgpResponse";

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

    public static handle(response: DbgpResponse, startFrame: number, endFrame: number): AhkStack {

        if (response) {
            const stackList = Array.isArray(response.children.stack) ? response.children.stack : Array.of(response.children.stack);
            const frames = new Array<any>();
            for (let i = startFrame; i < Math.min(endFrame, stackList.length); i++) {
                const stack = stackList[i];
                frames.push({
                    index: i,
                    name: `${stack.attr.where}`,
                    file: `${stack.attr.filename}`,
                    line: parseInt(`${stack.attr.lineno}`),
                });
            }
            return ({ frames, count: stackList.length });
        } else {
            return { frames: [], count: 0 };
        }

    }

}