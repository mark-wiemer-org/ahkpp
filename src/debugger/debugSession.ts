import { commands } from 'vscode';
import {
    BreakpointEvent,
    InitializedEvent,
    LoggingDebugSession,
    OutputEvent,
    StoppedEvent,
    TerminatedEvent,
    Thread,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { DebugDispatcher } from './debugDispatcher';
import { Continue } from './struct/command';
import { VscodeScope } from './struct/scope';
import { ConfigKey, Global } from '../common/global';

/**
 * This interface describes the mock-debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the mock-debug extension.
 * The interface should always match the one in package.json.
 */
export interface LaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    /** An absolute path to the "program" to debug. */
    program: string;
    /** An absolute path to the AutoHotkey.exe. */
    runtime: string;
    dbgpSettings: {
        maxChildren: number;
        maxData: number;
    };
}

/**
 * debug session for vscode.
 */
export class DebugSession extends LoggingDebugSession {
    private static threadId = 1;
    private dispatcher: DebugDispatcher;

    public constructor() {
        super('ahk-debug.txt');

        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        this.dispatcher = new DebugDispatcher();
        this.dispatcher
            .on('break', (reason: string) => {
                this.sendEvent(new StoppedEvent(reason, DebugSession.threadId));
            })
            .on('breakpointValidated', (bp: DebugProtocol.Breakpoint) => {
                this.sendEvent(
                    new BreakpointEvent('changed', {
                        verified: bp.verified,
                        id: bp.id,
                    } as DebugProtocol.Breakpoint),
                );
            })
            .on('output', (text) => {
                this.sendEvent(new OutputEvent(`${text}\n`));
                if (Global.getConfig(ConfigKey.showOutputView)) {
                    // focus on debug console view
                    commands.executeCommand('workbench.debug.action.focusRepl');
                }
            })
            .on('end', () => {
                this.sendEvent(new TerminatedEvent());
            });
    }

    protected override initializeRequest(
        response: DebugProtocol.InitializeResponse,
    ): void {
        response.body = {
            ...response.body,
            completionTriggerCharacters: ['.', '['],
            supportsConfigurationDoneRequest: false,
            supportsEvaluateForHovers: true,
            supportsStepBack: false,
            supportsDataBreakpoints: false,
            supportsCompletionsRequest: true,
            supportsCancelRequest: true,
            supportsRestartRequest: true,
            supportsBreakpointLocationsRequest: false,
            supportsSetVariable: true,
        };

        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected override restartRequest(
        response: DebugProtocol.RestartResponse,
    ): void {
        this.dispatcher.restart();
        this.sendResponse(response);
    }

    protected override async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: LaunchRequestArguments,
    ) {
        this.dispatcher.start(args);
        this.sendResponse(response);
    }

    protected override disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
    ): void {
        this.dispatcher.stop();
        this.sendResponse(response);
    }

    protected override async setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
    ): Promise<void> {
        response.body = {
            breakpoints: this.dispatcher.buildBreakPoint(
                args.source.path,
                args.breakpoints,
            ),
        };
        this.sendResponse(response);
    }

    protected override async stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments,
    ): Promise<void> {
        response.body = { stackFrames: await this.dispatcher.stack(args) };
        this.sendResponse(response);
    }

    protected override scopesRequest(
        response: DebugProtocol.ScopesResponse,
        args: DebugProtocol.ScopesArguments,
    ): void {
        response.body = { scopes: this.dispatcher.scopes(args.frameId) };
        this.sendResponse(response);
    }

    protected override async variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments,
    ) {
        response.body = {
            variables: await this.dispatcher.listVariables(args),
        };
        this.sendResponse(response);
    }

    protected override async setVariableRequest(
        response: DebugProtocol.SetVariableResponse,
        args: DebugProtocol.SetVariableArguments,
    ): Promise<void> {
        try {
            response.body = await this.dispatcher.setVariable(args);
            this.sendResponse(response);
        } catch (error) {
            this.sendErrorResponse(response, {
                id: args.variablesReference,
                format: (error as { message: string }).message,
            });
        }
    }

    protected override pauseRequest(
        response: DebugProtocol.PauseResponse,
    ): void {
        this.dispatcher.sendCommand(Continue.break);
        this.sendResponse(response);
    }

    protected override continueRequest(
        response: DebugProtocol.ContinueResponse,
    ): void {
        this.dispatcher.sendCommand(Continue.run);
        this.sendResponse(response);
    }

    protected override nextRequest(response: DebugProtocol.NextResponse): void {
        this.dispatcher.sendCommand(Continue.stepOver);
        this.sendResponse(response);
    }

    protected override stepInRequest(
        response: DebugProtocol.StepInResponse,
    ): void {
        this.dispatcher.sendCommand(Continue.stepInto);
        this.sendResponse(response);
    }

    protected override stepOutRequest(
        response: DebugProtocol.StepOutResponse,
    ): void {
        this.dispatcher.sendCommand(Continue.stepOut);
        this.sendResponse(response);
    }

    protected override threadsRequest(
        response: DebugProtocol.ThreadsResponse,
    ): void {
        response.body = {
            threads: [new Thread(DebugSession.threadId, 'main thread')],
        };
        this.sendResponse(response);
    }

    protected override async completionsRequest(
        response: DebugProtocol.CompletionsResponse,
    ): Promise<void> {
        response.body = {
            targets: [
                ...(await this.dispatcher.listVariables({
                    variablesReference: VscodeScope.local,
                })),
                ...(await this.dispatcher.listVariables({
                    variablesReference: VscodeScope.global,
                })),
            ].map((variable) => {
                return {
                    type: 'variable',
                    label: variable.name,
                    sortText: variable.name,
                };
            }),
        };
        this.sendResponse(response);
    }

    protected override async evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments,
    ): Promise<void> {
        const exp = args.expression.split('=');
        let reply: string;
        if (exp.length === 1) {
            reply = await this.dispatcher.getVariableByEval(args.expression);
        } else {
            this.dispatcher.setVariable({
                name: exp[0],
                value: exp[1],
                variablesReference: VscodeScope.local,
            });
            reply = `execute: ${args.expression}`;
        }

        response.body = {
            result: reply ? reply : `null`,
            variablesReference: 0,
        };
        this.sendResponse(response);
    }
}
