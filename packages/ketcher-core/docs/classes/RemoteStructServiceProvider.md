[ketcher-core](../README.md) / RemoteStructServiceProvider

# Class: RemoteStructServiceProvider

## Implements

- [`StructServiceProvider`](../interfaces/StructServiceProvider.md)

## Table of contents

### Constructors

- [constructor](RemoteStructServiceProvider.md#constructor)

### Properties

- [apiPath](RemoteStructServiceProvider.md#apipath)
- [customHeaders](RemoteStructServiceProvider.md#customheaders)
- [mode](RemoteStructServiceProvider.md#mode)

### Methods

- [createStructService](RemoteStructServiceProvider.md#createstructservice)

## Constructors

### constructor

• **new RemoteStructServiceProvider**(`apiPath`, `customHeaders?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiPath` | `string` |
| `customHeaders?` | `Record`<`string`, `string`\> |

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts#L31)

## Properties

### apiPath

• `Private` `Readonly` **apiPath**: `string`

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts#L27)

___

### customHeaders

• `Optional` **customHeaders**: `Record`<`string`, `string`\>

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts#L29)

___

### mode

• **mode**: [`ServiceMode`](../README.md#servicemode) = `'remote'`

#### Implementation of

[StructServiceProvider](../interfaces/StructServiceProvider.md).[mode](../interfaces/StructServiceProvider.md#mode)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts#L28)

## Methods

### createStructService

▸ **createStructService**(`options`): [`StructService`](../interfaces/StructService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

[`StructService`](../interfaces/StructService.md)

#### Implementation of

[StructServiceProvider](../interfaces/StructServiceProvider.md).[createStructService](../interfaces/StructServiceProvider.md#createstructservice)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructServiceProvider.ts#L44)
