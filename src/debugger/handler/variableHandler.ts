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

        const properties: DbgpProperty[] = Util.toArray(response.attr.command === 'property_get' ? response.property.property : response.property)
        if (properties.length == 0) {
            return [];
        }

        const variables: Variable[] = [];
        for (const property of properties) {

            const { attr } = property;
            let variablesReference;
            let indexedVariables, namedVariables;

            if (args && 'filter' in args) {
                const match = attr.name.match(/\[([0-9]+)\]/);
                const indexed = !!match;
                if (args.filter === 'named' && indexed) {
                    continue;
                } else if (args.filter === 'indexed') {
                    if (indexed) {
                        const index = parseInt(match[1]);
                        const start = args.start + 1;
                        const end = args.start + args.count;
                        const contains = (start) <= index && index <= end;
                        if (contains === false) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }
            }

            if (property.property && attr.type === 'object') {
                variablesReference = this._variableReferenceCounter++;
                this._properties.set(variablesReference, property.attr.fullname);
                this._propertyScopeIdMap.set(variablesReference, scopeId);

                if (this.isArrayLikeProperty(property) === true) {
                    const length = this.getArrayLikeLength(property);

                    indexedVariables = 100 < length ? length : undefined;
                    namedVariables = 100 < length ? 1 : undefined;
                }
            } else {
                variablesReference = 0;
            }

            const { name, type } = attr;
            const value = this.formatPropertyValue(property);
            const variable = {
                name, type, value, variablesReference,
                indexedVariables, namedVariables,
            };
            variables.push(variable);
            // return variable;

        }
        // properties.forEach((property, i) => {});
        return variables;

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
            if (this.isArrayLikeProperty(property) == true) {
                const classname = attr.classname === 'Object' ? 'Array' : attr.classname;
                const length = this.getArrayLikeLength(property);

                return `${classname}(${length})`;
            }
        }

        return `${attr.classname}`;
    }
    private getArrayLikeLength(property: DbgpProperty): number {
        const properties: DbgpProperty[] = Util.toArray(property.property)
        if (properties.length == 0) {
            return 0;
        }
        for (let i = properties.length - 1; 0 <= i; i--) {
            const property = properties[i];
            const match = property.attr.name.match(/\[([0-9]+)\]/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 0;
    }
    private isArrayLikeProperty(property: DbgpProperty): boolean {
        const childProperties: DbgpProperty[] = Util.toArray(property.property)
        if (childProperties.length == 0) {
            return false;
        }
        return childProperties.some((childProperty: DbgpProperty) => {
            if (childProperty.attr.name.match(/\[[0-9]+\]/)) {
                return true;
            }
            return false;
        });
    }

}