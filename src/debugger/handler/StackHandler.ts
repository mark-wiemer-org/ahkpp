import { DbgpResponse } from "../struct/dbgpResponse";
import { DebugProtocol } from 'vscode-debugprotocol';
import { StackFrame, Source } from "vscode-debugadapter";
import { basename } from "path";

export class StackHandler {

    public handle(args: DebugProtocol.StackTraceArguments, response: DbgpResponse): StackFrame[] {
        if (response) {
            const stackList = Array.isArray(response.stack) ? response.stack : Array.of(response.stack);
            return stackList.map((stack, index) => {
                return new StackFrame(index, stack.attr.where, new Source(basename(stack.attr.filename), stack.attr.filename), parseInt(stack.attr.lineno));
            })
        } else {
            return [];
        }

    }

}