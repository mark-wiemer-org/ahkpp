import { EventEmitter } from 'events';
import * as Net from 'net';
import * as xml2js from 'xml2js';
import { Out } from '../common/out';

/**
 * Exchange dbgp protocol with ahk debug proxy.
 */
export class DebugServer extends EventEmitter {
    private proxyServer: Net.Server;
    private ahkConnection: Net.Socket;
    public constructor(private port: number) {
        super();
    }

    public start(): DebugServer {
        const end = 0;
        let tempData: Buffer;
        this.proxyServer = new Net.Server()
            .listen(this.port)
            .on('connection', (socket: Net.Socket) => {
                this.ahkConnection = socket;
                socket.on('data', (chunk) => {
                    tempData = tempData
                        ? Buffer.concat([tempData, chunk])
                        : chunk;
                    if (tempData[tempData.length - 1] === end) {
                        this.process(tempData.toString());
                        tempData = null;
                    }
                });
            })
            .on('error', (err: Error) => {
                Out.log(err.message);
                throw err;
            });

        return this;
    }

    public shutdown() {
        if (this.ahkConnection) {
            this.ahkConnection.end();
        }
        if (this.proxyServer) {
            this.proxyServer.close();
        }
    }

    public write(data: string) {
        if (this.ahkConnection) {
            this.ahkConnection.write(data);
        }
    }

    private header = `<?xml version="1.0" encoding="UTF-8"?>`;
    private parser = new xml2js.Parser({
        attrkey: 'attr',
        charsAsChildren: false,
        charkey: 'content',
        explicitCharkey: true,
        explicitArray: false,
    });
    public process(data: string) {
        data = data.substring(data.indexOf('<?xml'));
        if (data.indexOf(this.header) === -1) {
            data = this.header + data;
        }
        for (const part of data.split(this.header)) {
            if (!part?.trim()) {
                continue;
            }
            const xmlString = this.header + part;
            this.parser
                .parseStringPromise(xmlString)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then((res: any) => {
                    for (const key in res) {
                        if (Object.prototype.hasOwnProperty.call(res, key)) {
                            this.emit(key, res[key]);
                        }
                    }
                })
                .catch((err: Error) => {
                    Out.log(err);
                });
        }
    }
}
