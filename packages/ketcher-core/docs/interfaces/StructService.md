[ketcher-core](../README.md) / StructService

# Interface: StructService

## Implemented by

- [`RemoteStructService`](../classes/RemoteStructService.md)

## Table of contents

### Methods

- [aromatize](StructService.md#aromatize)
- [automap](StructService.md#automap)
- [calculate](StructService.md#calculate)
- [calculateCip](StructService.md#calculatecip)
- [check](StructService.md#check)
- [clean](StructService.md#clean)
- [convert](StructService.md#convert)
- [dearomatize](StructService.md#dearomatize)
- [generateImageAsBase64](StructService.md#generateimageasbase64)
- [generateInchIKey](StructService.md#generateinchikey)
- [info](StructService.md#info)
- [layout](StructService.md#layout)
- [recognize](StructService.md#recognize)

## Methods

### aromatize

▸ **aromatize**(`data`, `options?`): `Promise`<[`AromatizeResult`](AromatizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`AromatizeData`](AromatizeData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`AromatizeResult`](AromatizeResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:147](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L147)

___

### automap

▸ **automap**(`data`, `options?`): `Promise`<[`AutomapResult`](AutomapResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`AutomapData`](AutomapData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`AutomapResult`](AutomapResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:159](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L159)

___

### calculate

▸ **calculate**(`data`, `options?`): `Promise`<[`CalculateResult`](../README.md#calculateresult)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CalculateData`](CalculateData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`CalculateResult`](../README.md#calculateresult)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:167](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L167)

___

### calculateCip

▸ **calculateCip**(`data`, `options?`): `Promise`<[`CalculateCipResult`](CalculateCipResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CalculateCipData`](CalculateCipData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`CalculateCipResult`](CalculateCipResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:155](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L155)

___

### check

▸ **check**(`data`, `options?`): `Promise`<[`CheckResult`](CheckResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CheckData`](CheckData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`CheckResult`](CheckResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:163](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L163)

___

### clean

▸ **clean**(`data`, `options?`): `Promise`<[`CleanResult`](CleanResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CleanData`](CleanData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`CleanResult`](CleanResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:143](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L143)

___

### convert

▸ **convert**(`data`, `options?`): `Promise`<[`ConvertResult`](ConvertResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`ConvertData`](ConvertData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`ConvertResult`](ConvertResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:135](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L135)

___

### dearomatize

▸ **dearomatize**(`data`, `options?`): `Promise`<[`DearomatizeResult`](DearomatizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`DearomatizeData`](DearomatizeData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`DearomatizeResult`](DearomatizeResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:151](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L151)

___

### generateImageAsBase64

▸ **generateImageAsBase64**(`data`, `options?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `options?` | [`GenerateImageOptions`](GenerateImageOptions.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:173](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L173)

___

### generateInchIKey

▸ **generateInchIKey**(`struct`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:172](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L172)

___

### info

▸ **info**(): `Promise`<[`InfoResult`](InfoResult.md)\>

#### Returns

`Promise`<[`InfoResult`](InfoResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:134](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L134)

___

### layout

▸ **layout**(`data`, `options?`): `Promise`<[`LayoutResult`](LayoutResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`LayoutData`](LayoutData.md) |
| `options?` | [`StructServiceOptions`](StructServiceOptions.md) |

#### Returns

`Promise`<[`LayoutResult`](LayoutResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:139](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L139)

___

### recognize

▸ **recognize**(`blob`, `version`): `Promise`<[`RecognizeResult`](RecognizeResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `blob` | `Blob` |
| `version` | `string` |

#### Returns

`Promise`<[`RecognizeResult`](RecognizeResult.md)\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:171](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L171)
