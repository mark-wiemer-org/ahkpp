import * as vscode from "vscode";

export class Global {
    public static CONFIG_PREFIX = "vscode-ahk-plus"
    /**
     * get configuration from vscode setting.
     * @param key config key
     */
    public static getConfig<T>(key: string): T {
        return vscode.workspace.getConfiguration(this.CONFIG_PREFIX).get<T>(key);
    }

}

export enum ConfigKey {
    compilePath = "compilePath", executePath = "executePath"
}