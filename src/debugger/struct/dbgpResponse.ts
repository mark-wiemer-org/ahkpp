 
export interface DbgpResponse {
    attr: {
        /** only one stack */
        stack: any;
        command: string;
        context: string;
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
    [key: string]: any;
    attr?: {
        name?: string;
        /** Full path to the property */
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
