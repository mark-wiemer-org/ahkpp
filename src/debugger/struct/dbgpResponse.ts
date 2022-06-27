// Property names may come from AHK itself
// let's not change names until we are more confident
export interface DbgpResponse {
    attr: {
        /** only one stack */
        stack: any;
        command: string;
        context: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        transaction_id: string;
        success: '0' | '1';
        /** Breakpoint id */
        id: number;
        /** run state */
        status: string;
    };
    // children: {
    stack: any;
    property: any | any[];
    error?: {
        attr: {
            code: number;
        };
    };
    // },
}

export interface DbgpProperty {
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
        encoding?: BufferEncoding;
    };
    content?: string;
    property?: DbgpProperty | DbgpProperty[];
}
