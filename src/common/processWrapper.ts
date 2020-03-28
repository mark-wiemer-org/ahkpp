import * as child_process from 'child_process';
import { Out } from './out';

export class Process {
    static exec(command: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            child_process.exec(command, error => {
                if (error) {
                    Out.log(error.message)
                    reject(error)
                    return;
                }
                resolve(true)
            })
        });
    }
}