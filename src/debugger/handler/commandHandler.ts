import { DbgpResponse } from '../struct/dbgpResponse';
import { DebugServer } from '../debugServer';

export class CommandHandler {
    private transId = 1;
    private commandCallback = {};

    public constructor(private readonly debugServer: DebugServer) {}

    /**
     * send command to the ahk debug proxy.
     * @param command
     */
    public sendCommand(command: string, data?: string): Promise<DbgpResponse> {
        if (!this.debugServer) {
            return undefined;
        }
        this.transId++;
        command += ` -i ${this.transId}`;
        if (typeof data === 'string') {
            command += ` -- ${Buffer.from(data).toString('base64')}`;
        }
        command += '\x00';

        this.debugServer.write(`${command}`);
        return new Promise((resolve) => {
            this.commandCallback['' + this.transId] = (
                response: DbgpResponse,
            ) => {
                resolve(response);
            };
        });
    }

    public callback(transId: string, response: DbgpResponse) {
        const fun = this.commandCallback[transId];
        if (fun) {
            fun(response);
        }
        this.commandCallback[transId] = null;
    }
}
