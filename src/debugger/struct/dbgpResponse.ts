export interface DbgpResponse {
	attr: {
		/** only one stack */
		stack: any,
		command: string;
		context: string;
		transaction_id: string;
		success: '0' | '1';
		/** Breakpoint id */
		id: number;
		/** run state */
		status: string;
	}
	children: {
		stack: any,
		property: any | any[],
		error?: {
			attr: {
				code: number;
			},
		},
	},
}