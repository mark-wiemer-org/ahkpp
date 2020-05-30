import { Variable } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { DbgpResponse } from '../struct/dbgpResponse';
import { Util } from '../util/util';

interface DbgpProperty {
    attr?: {
        name?: string;
        fullname?: string;
        type?: string;
        facet?: string;
        classname?: string;
        address?: string;
        size?: string;
        page?: string;
        pagesize?: string;
        children?: string;
        numchildren?: string;
        encoding?: string;
    };
    content?: string;
    property?: DbgpProperty | DbgpProperty[]
}

export class VariableHandler {

    private _properties = new Map<number, string>();
    private _propertyScopeIdMap = new Map<number, number>();
    private _variableReferenceCounter = 10000;

    public getPropertyNameByRef(ref: number): string {
        return this._properties.get(ref);
    }
    public getPropertyScopeByRef(ref: number): number {
        return this._propertyScopeIdMap.get(ref);
    }

    public parse(response: DbgpResponse, scopeId: number, args: DebugProtocol.VariablesArguments): Variable[] {

        return Util.toArray(response.attr.command === 'property_get' ? response.property.property : response.property)
            .map((property) => {
                const { attr } = property;
                let variablesReference: number;
                let indexedVariables: number, namedVariables: number;

                if (args && args.filter) {
                    const match = attr.name.match(/\[([0-9]+)\]/);
                    // get object array property
                    if (args.filter === 'named' && match) {
                        return;
                    } else if (args.filter === 'indexed') {
                        // get array value
                        if (match) {
                            const index = parseInt(match[1]);
                            const start = args.start + 1;
                            const end = args.start + args.count;
                            const contains = (start) <= index && index <= end;
                            if (!contains) {
                                return;
                            }
                        } else {
                            return;
                        }
                    }
                }

                if (property.property && attr.type === 'object') {
                    variablesReference = this._variableReferenceCounter++;
                    this._properties.set(variablesReference, property.attr.fullname);
                    this._propertyScopeIdMap.set(variablesReference, scopeId);
                    if (this.likeArray(property)) {
                        const length = this.getLikeArrayLength(property);
                        indexedVariables = 100 < length ? length : undefined;
                        namedVariables = 100 < length ? 1 : undefined;
                    }
                } else {
                    variablesReference = 0;
                }
                return {
                    name: attr.name, type: attr.type,
                    value: this.formatPropertyValue(property),
                    variablesReference, indexedVariables, namedVariables,
                };
            })
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