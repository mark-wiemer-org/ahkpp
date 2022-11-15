import { EventEmitter } from 'events';
import Net = require('net');
import xml2js = require('xml2js');
import { Out } from '../common/out';

/**
 * Exchange dbgp protocol with ahk debug proxy.
 */
export class DebugServer extends EventEmitter {
    private proxyServer: Net.Server;
    private ahkConnection: Net.Socket;
    public hasNew: boolean;
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

    public prepareNewConnection() {
        this.closeAhkConnection();
        this.hasNew = true;
    }

    public closeAhkConnection() {
        if (this.ahkConnection) {
            this.ahkConnection.end();
            this.ahkConnection = null;
        }
    }

    public shutdown() {
        this.closeAhkConnection();
        if (this.hasNew) {
            this.hasNew = false;
            return;
        }
        if (this.proxyServer) {
            this.proxyServer.close();
            this.proxyServer = null;
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
        data = data.substr(data.indexOf('<?xml'));
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
                .then((res: any) => {
                    for (const key in res) {
                        if (res.hasOwnProperty(key)) {
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
