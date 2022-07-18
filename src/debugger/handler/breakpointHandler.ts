import { basename } from 'path';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Breakpoint, Source } from '@vscode/debugadapter';
import { readFileSync, existsSync } from 'fs';

type Callback = (breakPoint: DebugProtocol.Breakpoint) => void;

export class BreakPointHandler {
    private _breakPoints = new Map<string, DebugProtocol.Breakpoint[]>();

    /**
     * set breakpoint to the script actual.
     */
    public loopPoints(callback: Callback) {
        for (const key of this._breakPoints.keys()) {
            for (const bp of this._breakPoints.get(key)) {
                callback(bp);
            }
        }
    }

    public get(path: string): DebugProtocol.Breakpoint[] {
        return this._breakPoints.get(path);
    }

    public buildBreakPoint(
        path: string,
        sourceBreakpoints: DebugProtocol.SourceBreakpoint[],
        callback: Callback,
    ): DebugProtocol.Breakpoint[] {
        if (!existsSync(path)) {
            return [];
        }
        const sourceLines = readFileSync(path).toString().split('\n');
        const bps = sourceBreakpoints.map((sourceBreakpoint) => {
            const breakPoint = new Breakpoint(
                false,
                sourceBreakpoint.line,
                sourceBreakpoint.column,
                new Source(basename(path), path),
            );
            const lineText = sourceLines[sourceBreakpoint.line];
            if (lineText && lineText.trim().charAt(0) != ';') {
                breakPoint.verified = true;
            }
            callback(breakPoint);
            return breakPoint;
        });
        this._breakPoints.set(path, bps);
        return bps;
    }
}
