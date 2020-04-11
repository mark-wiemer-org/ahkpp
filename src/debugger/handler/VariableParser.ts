import { Variable } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { DbgpResponse } from '../AhkRuntime';

interface DbgpProperty {
    attributes?: {
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
    children?: { property: DbgpProperty | DbgpProperty[] };
}

export class VariableParser {

    private static _properties = new Map<number, string>();
    private static _variableReferenceCounter = 10000;

    public static getPropertyNameByRef(ref: number): string {
        return this._properties.get(ref);
    }

    public static parse(property: DbgpResponse, args: DebugProtocol.VariablesArguments): Variable[] {

        let properties: DbgpProperty[];

        if (this._properties.has(args.variablesReference) == true
            && property.response.attributes.command === 'property_get') {
            const { children } = property.response.children.property as DbgpProperty;
            properties = Array.isArray(children.property) == true ? children.property as DbgpProperty[] : [children.property as DbgpProperty];
        } else {
            if ("children" in property.response) {
                const { children } = property.response;
                properties = Array.isArray(children.property) ? children.property : [children.property];
            } else {
                properties = []; 1;
            }
        }

        if (properties.length === 0) {
            return [];
        }

        const variables: Variable[] = [];
        for (const property of properties) {

            const { attributes } = property;
            let variablesReference;
            let indexedVariables, namedVariables;

            if ('filter' in args) {
                const match = attributes.name.match(/\[([0-9]+)\]/);
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

            if ('children' in property && attributes.type === 'object') {
                variablesReference = this._variableReferenceCounter++;
                this._properties.set(variablesReference, property.attributes.fullname);

                if (this.isArrayLikeProperty(property) === true) {
                    const length = this.getArrayLikeLength(property);

                    indexedVariables = 100 < length ? length : undefined;
                    namedVariables = 100 < length ? 1 : undefined;
                }
            } else {
                variablesReference = 0;
            }

            const { name, type } = attributes;
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
    private static formatPropertyValue(property: DbgpProperty): string {
        const { attributes, content = '' } = property;

        if (['string', 'integer', 'float'].includes(attributes.type) === true) {
            const primitive = Buffer.from(content, attributes.encoding).toString();

            if (attributes.type === 'integer' || attributes.type === 'float') {
                return primitive;
            }
            return `"${primitive}"`;
        } else if (attributes.type === 'object') {
            if (this.isArrayLikeProperty(property) == true) {
                const classname = attributes.classname === 'Object' ? 'Array' : attributes.classname;
                const length = this.getArrayLikeLength(property);

                return `${classname}(${length})`;
            }
        }

        return `${attributes.classname}`;
    }
    private static getArrayLikeLength(property: DbgpProperty): number {
        const { children } = property;

        if (!children) {
            return 0;
        }

        const properties: DbgpProperty[] = Array.isArray(children.property) ? children.property as DbgpProperty[] : [children.property as DbgpProperty];
        for (let i = properties.length - 1; 0 <= i; i--) {
            const property = properties[i];

            const match = property.attributes.name.match(/\[([0-9]+)\]/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 0;
    }
    private static isArrayLikeProperty(property: DbgpProperty): boolean {
        const { attributes, children } = property;
        if (attributes.children === "0") {
            return false;
        }

        const childProperties: DbgpProperty[] = Array.isArray(children.property) ? children.property as DbgpProperty[] : [children.property as DbgpProperty];
        return childProperties.some((childProperty: DbgpProperty) => {
            if (childProperty.attributes.name.match(/\[[0-9]+\]/)) {
                return true;
            }
            return false;
        });
    }

}