[ketcher-core](../README.md) / ReText

# Class: ReText

## Hierarchy

- `ReObject`

  ↳ **`ReText`**

## Table of contents

### Constructors

- [constructor](ReText.md#constructor)

### Properties

- [hover](ReText.md#hover)
- [hovering](ReText.md#hovering)
- [item](ReText.md#item)
- [paths](ReText.md#paths)
- [selected](ReText.md#selected)
- [selectionPlate](ReText.md#selectionplate)
- [visel](ReText.md#visel)

### Methods

- [drawHover](ReText.md#drawhover)
- [getRanges](ReText.md#getranges)
- [getReferencePoints](ReText.md#getreferencepoints)
- [getRelBox](ReText.md#getrelbox)
- [getRowWidth](ReText.md#getrowwidth)
- [getStyles](ReText.md#getstyles)
- [getVBoxObj](ReText.md#getvboxobj)
- [hoverPath](ReText.md#hoverpath)
- [makeSelectionPlate](ReText.md#makeselectionplate)
- [setHover](ReText.md#sethover)
- [show](ReText.md#show)
- [isSelectable](ReText.md#isselectable)

## Constructors

### constructor

• **new ReText**(`text`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | [`Text`](Text.md) |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L44)

## Properties

### hover

• **hover**: `boolean` = `false`

#### Inherited from

ReObject.hover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L25)

___

### hovering

• **hovering**: `any` = `null`

#### Inherited from

ReObject.hovering

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L26)

___

### item

• `Private` **item**: [`Text`](Text.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L41)

___

### paths

• **paths**: `any`[][] = `[]`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:42](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L42)

___

### selected

• **selected**: `boolean` = `false`

#### Inherited from

ReObject.selected

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L27)

___

### selectionPlate

• **selectionPlate**: `any` = `null`

#### Inherited from

ReObject.selectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L28)

___

### visel

• **visel**: `Visel`

#### Inherited from

ReObject.visel

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:24](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L24)

## Methods

### drawHover

▸ **drawHover**(`render`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`any`

#### Overrides

ReObject.drawHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:118](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L118)

___

### getRanges

▸ **getRanges**(`block`, `options`): [`number`, `number`, `Record`<`string`, `any`\>][]

#### Parameters

| Name | Type |
| :------ | :------ |
| `block` | `RawDraftContentBlock` |
| `options` | `any` |

#### Returns

[`number`, `number`, `Record`<`string`, `any`\>][]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:185](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L185)

___

### getReferencePoints

▸ **getReferencePoints**(): [`Vec2`](Vec2.md)[]

#### Returns

[`Vec2`](Vec2.md)[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:53](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L53)

___

### getRelBox

▸ **getRelBox**(`paths`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `any`[][] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `p0` | [`Vec2`](Vec2.md) |
| `p1` | [`Vec2`](Vec2.md) |

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L80)

___

### getRowWidth

▸ **getRowWidth**(`row`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any`[] |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:111](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L111)

___

### getStyles

▸ **getStyles**(`block`, `index`, `options`): `Record`<`string`, `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `block` | `RawDraftContentBlock` |
| `index` | `number` |
| `options` | `any` |

#### Returns

`Record`<`string`, `string`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:207](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L207)

___

### getVBoxObj

▸ **getVBoxObj**(`render`): ``null`` \| [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |

#### Returns

``null`` \| [`Box2Abs`](Box2Abs.md)

#### Inherited from

ReObject.getVBoxObj

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:34](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L34)

___

### hoverPath

▸ **hoverPath**(`render`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L72)

___

### makeSelectionPlate

▸ **makeSelectionPlate**(`restruct`, `paper`, `options`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `paper` | `any` |
| `options` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:125](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L125)

___

### setHover

▸ **setHover**(`hover`, `render`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hover` | `boolean` |
| `render` | [`Render`](Render.md) |

#### Returns

`void`

#### Inherited from

ReObject.setHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:43](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L43)

___

### show

▸ **show**(`restruct`, `_id`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `_id` | `number` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:130](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L130)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/retext.ts:49](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/retext.ts#L49)
