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

/**
 * This interface describes the mock-debug specific launch attr
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attr lives in the package.json of the mock-debug extension.
 * The interface should always match this schema.
 */
export interface LaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    /** An absolute path to the "program" to debug. */
    program: string;
    /** An absolute path to the AutoHotkey.exe. */
    runtime: string;
    dbgpSettings: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        max_children: number;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        max_data: number;
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
                commands.executeCommand('workbench.debug.action.focusRepl');
            })
            .on('end', () => {
                this.sendEvent(new TerminatedEvent());
            });
    }

    protected initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments,
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

    protected restartRequest(
        response: DebugProtocol.RestartResponse,
        args: DebugProtocol.RestartArguments,
        request?: DebugProtocol.Request,
    ): void {
        this.dispatcher.restart();
        this.sendResponse(response);
    }

    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: LaunchRequestArguments,
    ) {
        this.dispatcher.start(args);
        this.sendResponse(response);
    }

    protected disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
        args: DebugProtocol.DisconnectArguments,
        request?: DebugProtocol.Request,
    ): void {
        this.dispatcher.stop();
        this.sendResponse(response);
    }

    protected async setBreakPointsRequest(
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

    protected async stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments,
    ): Promise<void> {
        response.body = { stackFrames: await this.dispatcher.stack(args) };
        this.sendResponse(response);
    }

    protected scopesRequest(
        response: DebugProtocol.ScopesResponse,
        args: DebugProtocol.ScopesArguments,
    ): void {
        response.body = { scopes: this.dispatcher.scopes(args.frameId) };
        this.sendResponse(response);
    }

    protected async variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments,
        request?: DebugProtocol.Request,
    ) {
        response.body = {
            variables: await this.dispatcher.listVariables(args),
        };
        this.sendResponse(response);
    }

    protected async setVariableRequest(
        response: DebugProtocol.SetVariableResponse,
        args: DebugProtocol.SetVariableArguments,
        request?: DebugProtocol.Request,
    ): Promise<void> {
        try {
            response.body = await this.dispatcher.setVariable(args);
            this.sendResponse(response);
        } catch (error) {
            this.sendErrorResponse(response, {
                id: args.variablesReference,
                format: error.message,
            });
        }
    }

    protected pauseRequest(
        response: DebugProtocol.PauseResponse,
        args: DebugProtocol.PauseArguments,
        request?: DebugProtocol.Request,
    ): void {
        this.dispatcher.sendComand(Continue.BREAK);
        this.sendResponse(response);
    }

    protected continueRequest(
        response: DebugProtocol.ContinueResponse,
        args: DebugProtocol.ContinueArguments,
    ): void {
        this.dispatcher.sendComand(Continue.RUN);
        this.sendResponse(response);
    }

    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments,
    ): void {
        this.dispatcher.sendComand(Continue.STEP_OVER);
        this.sendResponse(response);
    }

    protected stepInRequest(
        response: DebugProtocol.StepInResponse,
        args: DebugProtocol.StepInArguments,
        request?: DebugProtocol.Request,
    ): void {
        this.dispatcher.sendComand(Continue.STEP_INTO);
        this.sendResponse(response);
    }

    protected stepOutRequest(
        response: DebugProtocol.StepOutResponse,
        args: DebugProtocol.StepOutArguments,
        request?: DebugProtocol.Request,
    ): void {
        this.dispatcher.sendComand(Continue.STEP_OUT);
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [new Thread(DebugSession.threadId, 'main thread')],
        };
        this.sendResponse(response);
    }

    protected async completionsRequest(
        response: DebugProtocol.CompletionsResponse,
        args: DebugProtocol.CompletionsArguments,
    ): Promise<void> {
        response.body = {
            targets: [
                ...(await this.dispatcher.listVariables({
                    variablesReference: VscodeScope.LOCAL,
                })),
                ...(await this.dispatcher.listVariables({
                    variablesReference: VscodeScope.GLOBAL,
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

    protected async evaluateRequest(
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
                variablesReference: VscodeScope.LOCAL,
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
