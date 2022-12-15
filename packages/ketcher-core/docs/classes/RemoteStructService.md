[ketcher-core](../README.md) / RemoteStructService

# Class: RemoteStructService

## Implements

- [`StructService`](../interfaces/StructService.md)

## Table of contents

### Constructors

- [constructor](RemoteStructService.md#constructor)

### Properties

- [apiPath](RemoteStructService.md#apipath)
- [customHeaders](RemoteStructService.md#customheaders)
- [defaultOptions](RemoteStructService.md#defaultoptions)

### Methods

- [aromatize](RemoteStructService.md#aromatize)
- [automap](RemoteStructService.md#automap)
- [calculate](RemoteStructService.md#calculate)
- [calculateCip](RemoteStructService.md#calculatecip)
- [check](RemoteStructService.md#check)
- [clean](RemoteStructService.md#clean)
- [convert](RemoteStructService.md#convert)
- [dearomatize](RemoteStructService.md#dearomatize)
- [generateImageAsBase64](RemoteStructService.md#generateimageasbase64)
- [generateInchIKey](RemoteStructService.md#generateinchikey)
- [info](RemoteStructService.md#info)
- [layout](RemoteStructService.md#layout)
- [recognize](RemoteStructService.md#recognize)

## Constructors

### constructor

• **new RemoteStructService**(`apiPath`, `defaultOptions`, `customHeaders?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiPath` | `string` |
| `defaultOptions` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |
| `customHeaders?` | `Record`<`string`, `string`\> |

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:133](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L133)

## Properties

### apiPath

• `Private` `Readonly` **apiPath**: `string`

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:129](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L129)

___

### customHeaders

• `Private` `Optional` `Readonly` **customHeaders**: `Record`<`string`, `string`\>

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:131](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L131)

___

### defaultOptions

• `Private` `Readonly` **defaultOptions**: [`StructServiceOptions`](../interfaces/StructServiceOptions.md)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:130](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L130)

## Methods

### aromatize

▸ **aromatize**(`data`, `options?`): `Promise`<[`AromatizeResult`](../interfaces/AromatizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`AromatizeData`](../interfaces/AromatizeData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`AromatizeResult`](../interfaces/AromatizeResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[aromatize](../interfaces/StructService.md#aromatize)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:218](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L218)

___

### automap

▸ **automap**(`data`, `options?`): `Promise`<[`AutomapResult`](../interfaces/AutomapResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`AutomapData`](../interfaces/AutomapData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`AutomapResult`](../interfaces/AutomapResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[automap](../interfaces/StructService.md#automap)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:257](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L257)

___

### calculate

▸ **calculate**(`data`, `options?`): `Promise`<[`CalculateResult`](../README.md#calculateresult)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CalculateData`](../interfaces/CalculateData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`CalculateResult`](../README.md#calculateresult)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[calculate](../interfaces/StructService.md#calculate)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:280](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L280)

___

### calculateCip

▸ **calculateCip**(`data`, `options?`): `Promise`<[`CalculateCipResult`](../interfaces/CalculateCipResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CalculateCipData`](../interfaces/CalculateCipData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`CalculateCipResult`](../interfaces/CalculateCipResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[calculateCip](../interfaces/StructService.md#calculatecip)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:244](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L244)

___

### check

▸ **check**(`data`, `options?`): `Promise`<[`CheckResult`](../interfaces/CheckResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CheckData`](../interfaces/CheckData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`CheckResult`](../interfaces/CheckResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[check](../interfaces/StructService.md#check)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:270](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L270)

___

### clean

▸ **clean**(`data`, `options?`): `Promise`<[`CleanResult`](../interfaces/CleanResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CleanData`](../interfaces/CleanData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`CleanResult`](../interfaces/CleanResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[clean](../interfaces/StructService.md#clean)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:208](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L208)

___

### convert

▸ **convert**(`data`, `options?`): `Promise`<[`ConvertResult`](../interfaces/ConvertResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`ConvertData`](../interfaces/ConvertData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`ConvertResult`](../interfaces/ConvertResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[convert](../interfaces/StructService.md#convert)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:182](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L182)

___

### dearomatize

▸ **dearomatize**(`data`, `options?`): `Promise`<[`DearomatizeResult`](../interfaces/DearomatizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`DearomatizeData`](../interfaces/DearomatizeData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`DearomatizeResult`](../interfaces/DearomatizeResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[dearomatize](../interfaces/StructService.md#dearomatize)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:231](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L231)

___

### generateImageAsBase64

▸ **generateImageAsBase64**(`data`, `options?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `options?` | [`GenerateImageOptions`](../interfaces/GenerateImageOptions.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

[StructService](../interfaces/StructService.md).[generateImageAsBase64](../interfaces/StructService.md#generateimageasbase64)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:319](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L319)

___

### generateInchIKey

▸ **generateInchIKey**(`struct`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `string` |

#### Returns

`Promise`<`string`\>

#### Implementation of

[StructService](../interfaces/StructService.md).[generateInchIKey](../interfaces/StructService.md#generateinchikey)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:143](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L143)

___

### info

▸ **info**(): `Promise`<[`InfoResult`](../interfaces/InfoResult.md)\>

#### Returns

`Promise`<[`InfoResult`](../interfaces/InfoResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[info](../interfaces/StructService.md#info)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:159](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L159)

___

### layout

▸ **layout**(`data`, `options?`): `Promise`<[`LayoutResult`](../interfaces/LayoutResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`LayoutData`](../interfaces/LayoutData.md) |
| `options?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

`Promise`<[`LayoutResult`](../interfaces/LayoutResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[layout](../interfaces/StructService.md#layout)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:195](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L195)

___

### recognize

▸ **recognize**(`blob`, `version`): `Promise`<[`RecognizeResult`](../interfaces/RecognizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `blob` | `Blob` |
| `version` | `string` |

#### Returns

`Promise`<[`RecognizeResult`](../interfaces/RecognizeResult.md)\>

#### Implementation of

[StructService](../interfaces/StructService.md).[recognize](../interfaces/StructService.md#recognize)

#### Defined in

[packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts:293](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#L293)
