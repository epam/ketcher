[ketcher-core](../README.md) / Ketcher

# Class: Ketcher

## Table of contents

### Constructors

- [constructor](Ketcher.md#constructor)

### Properties

- [#editor](Ketcher.md##editor)
- [#formatterFactory](Ketcher.md##formatterfactory)
- [#indigo](Ketcher.md##indigo)
- [#structService](Ketcher.md##structservice)

### Accessors

- [editor](Ketcher.md#editor)
- [indigo](Ketcher.md#indigo)

### Methods

- [addFragment](Ketcher.md#addfragment)
- [containsReaction](Ketcher.md#containsreaction)
- [generateImage](Ketcher.md#generateimage)
- [generateInchIKey](Ketcher.md#generateinchikey)
- [getCml](Ketcher.md#getcml)
- [getInchi](Ketcher.md#getinchi)
- [getKet](Ketcher.md#getket)
- [getMolfile](Ketcher.md#getmolfile)
- [getRxn](Ketcher.md#getrxn)
- [getSmarts](Ketcher.md#getsmarts)
- [getSmiles](Ketcher.md#getsmiles)
- [recognize](Ketcher.md#recognize)
- [setMolecule](Ketcher.md#setmolecule)

## Constructors

### constructor

• **new Ketcher**(`editor`, `structService`, `formatterFactory`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `editor` | [`Editor`](../interfaces/Editor.md) |
| `structService` | [`StructService`](../interfaces/StructService.md) |
| `formatterFactory` | [`FormatterFactory`](FormatterFactory.md) |

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L57)

## Properties

### #editor

• `Private` **#editor**: [`Editor`](../interfaces/Editor.md)

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:50](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L50)

___

### #formatterFactory

• `Private` **#formatterFactory**: [`FormatterFactory`](FormatterFactory.md)

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:49](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L49)

___

### #indigo

• `Private` **#indigo**: `Indigo`

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:51](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L51)

___

### #structService

• `Private` **#structService**: [`StructService`](../interfaces/StructService.md)

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:48](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L48)

## Accessors

### editor

• `get` **editor**(): [`Editor`](../interfaces/Editor.md)

#### Returns

[`Editor`](../interfaces/Editor.md)

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:53](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L53)

___

### indigo

• `get` **indigo**(): `Indigo`

#### Returns

`Indigo`

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L72)

## Methods

### addFragment

▸ **addFragment**(`fragment`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fragment` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:161](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L161)

___

### containsReaction

▸ **containsReaction**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:146](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L146)

___

### generateImage

▸ **generateImage**(`data`, `options?`): `Promise`<`Blob`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `options` | [`GenerateImageOptions`](../interfaces/GenerateImageOptions.md) |

#### Returns

`Promise`<`Blob`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:171](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L171)

___

### generateInchIKey

▸ **generateInchIKey**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:136](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L136)

___

### getCml

▸ **getCml**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:124](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L124)

___

### getInchi

▸ **getInchi**(`withAuxInfo?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `withAuxInfo` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:128](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L128)

___

### getKet

▸ **getKet**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:116](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L116)

___

### getMolfile

▸ **getMolfile**(`molfileFormat?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `molfileFormat` | [`MolfileFormat`](../README.md#molfileformat) | `'v2000'` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:81](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L81)

___

### getRxn

▸ **getRxn**(`molfileFormat?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `molfileFormat` | [`MolfileFormat`](../README.md#molfileformat) | `'v2000'` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:99](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L99)

___

### getSmarts

▸ **getSmarts**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:120](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L120)

___

### getSmiles

▸ **getSmiles**(`isExtended?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `isExtended` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L76)

___

### recognize

▸ **recognize**(`image`, `version?`): `Promise`<[`Struct`](Struct.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `image` | `Blob` |
| `version?` | `string` |

#### Returns

`Promise`<[`Struct`](Struct.md)\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:167](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L167)

___

### setMolecule

▸ **setMolecule**(`structStr`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `structStr` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ketcher-core/src/application/ketcher.ts:150](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcher.ts#L150)
