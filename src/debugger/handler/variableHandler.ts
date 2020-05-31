import { Handles, Scope, Variable } from 'vscode-debugadapter';
import { DbgpProperty, DbgpResponse } from '../struct/dbgpResponse';
import { VarScope } from '../struct/scope';
import { Util } from '../util/util';


export interface VariableRequest {
    scope: VarScope,
    frameId: number,
    paramRef?: number,
    paramName?: string
}

interface AhkVariable {
    name: string;
    frameId: number;
    scope: VarScope;
    value: any;
}

export class VariableHandler {

    private variableHandles = new Handles<string | AhkVariable>();
    private variableMap = new Map<string, AhkVariable>();
    private frameId: number;

    public getScopeByRef(ref: number): number {
        const scopeOrVar = this.variableHandles.get(ref)
        if ((typeof scopeOrVar) == "string") {
            return scopeOrVar == 'Local' ? VarScope.LOCAL : VarScope.GLOBAL;
        }
        return (scopeOrVar as AhkVariable).scope;
    }

    public getVarByRef(ref: number): AhkVariable {
        return this.variableHandles.get(ref) as AhkVariable;
    }

    public getVarByName(name: string): AhkVariable {
        return this.variableMap.get(name) as AhkVariable;
    }

    public obtainValue(value: string) {

        let type: string;
        let isVariable = false;
        const match = value.match(/^(?:()|\"(.*)\"|(true|false)|([+-]?\d+)|([+-]?\d+\.[+-]?\d+)|([\w\d]+))$/si);
        if (!match) {
            return Promise.reject(new Error(`"${value}" is invalid value.`))
        }

        const [, blank, str, bool, int, float, varName] = match;
        if (blank !== undefined) {
            type = 'string';
            value = '';
        } else if (str !== undefined) {
            type = 'string';
            value = str
        } else if (bool !== undefined) {
            type = 'string';
            value = bool.match(/true/i) ? '1' : '0';
        } else if (int !== undefined) {
            type = 'integer';
            value = int;
        } else if (float !== undefined) {
            type = 'float';
            value = float;
        } else {
            isVariable = true;
            value = varName
        }
        return Promise.resolve({ type, value, isVariable })
    }

    public getArrayValue(ref: number, start: number, count: number): Variable[] | PromiseLike<Variable[]> {

        const ahkVar = this.getVarByRef(ref)
        if (!Array.isArray(ahkVar?.value)) return []

        return (ahkVar.value as any[]).slice(start, start + count).map((value, index) => {
            return new Variable(`[${start + index + 1}]`, value)
        });
    }

    public scopes(frameId: number): Scope[] {
        this.frameId = frameId;
        return [new Scope("Local", this.variableHandles.create("Local"), false), new Scope("Global", this.variableHandles.create("Global"), false)];
    }

    public getFrameId(): number {
        return this.frameId;
    }

    public parsePropertyget(response: DbgpResponse, scope: number): Variable[] {

        return this.parse(response.property.content ? response : response.property, scope)
    }

    public parse(response: DbgpResponse, scope: number): Variable[] {

        return Util.toArray(response.property)
            .map((property) => {
                const { attr } = property;
                let indexedVariables: number, namedVariables: number;
                if (this.likeArray(property)) {
                    const length = this.getLikeArrayLength(property);
                    indexedVariables = 100 < length ? length : undefined;
                    namedVariables = 100 < length ? 1 : undefined;
                }
                const ahkVar = { scope, frameId: scope == VarScope.GLOBAL ? -1 : this.frameId, name: property.attr.fullname, value: this.buildVariableValue(property) }
                this.variableMap.set(attr.name, ahkVar)
                return {
                    type: attr.type, name: attr.name, value: this.formatPropertyValue(property),
                    indexedVariables, namedVariables, variablesReference: attr.type != "object" ? 0 : this.variableHandles.create(ahkVar),
                };
            })
    }

    private buildVariableValue(property: DbgpProperty): any {
        const { attr, content = '' } = property;

        if (['string', 'integer', 'float'].includes(attr.type) === true) {
            const primitive = Util.atob(content);
            if (attr.type === 'integer' || attr.type === 'float') {
                return primitive;
            }
            return `"${primitive}"`;
        } else if (attr.type === 'object') {
            const childs = Util.toArray(property.property)
            if (this.likeArray(property) == true && attr.classname === 'Object') {
                return childs.map((p) => {
                    return Util.atob(p.content);
                })
            } else {
                return childs.reduce((value, child) => {
                    value[child.attr.fullname] = Util.atob(child.content)
                    return value;
                }, {})
            }
        }

        return `${attr.classname}`;
    }

    /** formats a dbgp property value for VS Code */
    private formatPropertyValue(property: DbgpProperty): string {
        const { attr, content = '' } = property;

        if (['string', 'integer', 'float'].includes(attr.type) === true) {
            const primitive = Buffer.from(content, attr.encoding).toString();

            if (attr.type === 'integer' || attr.type === 'float') {
                return primitive;
            }
            return `"${primitive}"`;
        } else if (attr.type === 'object') {
            if (this.likeArray(property) == true) {
                const classname = attr.classname === 'Object' ? 'Array' : attr.classname;
                const length = this.getLikeArrayLength(property);

                return `${classname}(${length})`;
            }
        }

        return `${attr.classname}`;
    }

    private getLikeArrayLength(property: DbgpProperty): number {
        const properties: DbgpProperty[] = Util.toArray(property.property)
        if (properties.length == 0) {
            return 0;
        }
        for (let i = properties.length - 1; i > 0; i--) {
            const match = properties[i].attr.name.match(/\[([0-9]+)\]/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 0;
    }

    private likeArray(property: DbgpProperty): boolean {
        return Util.toArray(property.property)
            .some((childProperty) => childProperty.attr.name.match(/\[[0-9]+\]/));
    }

}