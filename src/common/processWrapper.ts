import * as child_process from 'child_process';
import {Out} from './out';

export class Process {
    public static exec(command: string, opt: child_process.ExecOptions = {}): Promise<boolean> {
        return new Promise((resolve, reject) => {
            child_process.exec(command, opt, (error) => {
                if (error) {
                    Out.log(error.message);
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    }
}