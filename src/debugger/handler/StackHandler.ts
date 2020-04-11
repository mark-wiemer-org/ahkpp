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
    frames: Array<AhkStackItem>;
    count: number;
}

export class StackHandler {

    public static handle(response: string, startFrame: number, endFrame: number, currentFile: string): AhkStack {

        let stackList = response.match(/<stack(.|\s|\n)+?\/>/ig)
        if (stackList) {
            const frames = new Array<any>();
            for (let i = startFrame; i < Math.min(endFrame, stackList.length); i++) {
                let stack = stackList[i]
                frames.push({
                    index: i,
                    name: `${stack.match(/where="(.+?)"/i)[1]}`,
                    file: `${stack.match(/filename="(.+?)"/i)[1]}`,
                    line: parseInt(`${stack.match(/lineno="(.+?)"/i)[1]}`) - 1
                });
            }
            return ({ frames, count: stackList.length });
        } else {
            return { frames: [{ index: startFrame, name: currentFile, file: currentFile, line: 1 }], count: 1 };
        }

    }

}