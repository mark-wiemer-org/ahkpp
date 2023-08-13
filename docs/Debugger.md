# Debugger

This extension supports debugging through its own debugger or through [vscode-autohotkey-debug by zero-plusplus](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

## Implementation details

`extension.ts` has the following code:

```ts
vscode.debug.registerDebugAdapterDescriptorFactory(
    'ahk',
    new InlineDebugAdapterFactory(),
),
```

It calls this (also in `extension.ts`):

```ts
class InlineDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    public createDebugAdapterDescriptor(
        _session: vscode.DebugSession,
    ): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }
}
```

`DebugSession` is defined in [`debugSession.ts`](../src/debugger/debugSession.ts). It has a [`DebugDispatcher`](../src/debugger/debugDispatcher.ts), which has a [DebugServer](../src/debugger/debugServer.ts). The DebugServer connects directly to the AHK interpreter.
