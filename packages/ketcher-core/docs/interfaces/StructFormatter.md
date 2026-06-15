[ketcher-core](../README.md) / StructFormatter

# Interface: StructFormatter

## Table of contents

### Methods

- [getStructureFromStringAsync](StructFormatter.md#getstructurefromstringasync)
- [getStringFromStructureAsync](StructFormatter.md#getstringfromstructureasync)

## Methods

### getStructureFromStringAsync

▸ **getStructureFromStringAsync**(`stringifiedStruct`): `Promise`<[`Struct`](../classes/Struct.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `stringifiedStruct` | `string` |

#### Returns

`Promise`<[`Struct`](../classes/Struct.md)\>

#### Defined in

[packages/ketcher-core/src/application/formatters/structFormatter.types.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/structFormatter.types.ts#L23)

___

### getStringFromStructureAsync

▸ **getStringFromStructureAsync**(`struct`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](../classes/Struct.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/formatters/structFormatter.types.ts:22](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/structFormatter.types.ts#L22)
