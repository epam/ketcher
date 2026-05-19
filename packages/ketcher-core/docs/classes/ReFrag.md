[ketcher-core](../README.md) / ReFrag

# Class: ReFrag

## Hierarchy

- `ReObject`

  ↳ **`ReFrag`**

## Table of contents

### Constructors

- [constructor](ReFrag.md#constructor)

### Properties

- [hover](ReFrag.md#hover)
- [hovering](ReFrag.md#hovering)
- [item](ReFrag.md#item)
- [selected](ReFrag.md#selected)
- [selectionPlate](ReFrag.md#selectionplate)
- [visel](ReFrag.md#visel)

### Methods

- [\_draw](ReFrag.md#_draw)
- [calcBBox](ReFrag.md#calcbbox)
- [draw](ReFrag.md#draw)
- [drawHover](ReFrag.md#drawhover)
- [fragGetAtoms](ReFrag.md#fraggetatoms)
- [fragGetBonds](ReFrag.md#fraggetbonds)
- [getVBoxObj](ReFrag.md#getvboxobj)
- [makeSelectionPlate](ReFrag.md#makeselectionplate)
- [setHover](ReFrag.md#sethover)
- [isSelectable](ReFrag.md#isselectable)

## Constructors

### constructor

• **new ReFrag**(`frag`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `frag` | `any` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L23)

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

• **item**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L25)

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

### \_draw

▸ **_draw**(`render`, `fid`, `attrs`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |
| `fid` | `any` |
| `attrs` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:74](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L74)

___

### calcBBox

▸ **calcBBox**(`restruct`, `fid`, `render`): `undefined`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `fid` | `any` |
| `render` | `any` |

#### Returns

`undefined`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:49](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L49)

___

### draw

▸ **draw**(`render`): ``null``

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

``null``

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:89](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L89)

___

### drawHover

▸ **drawHover**(`render`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`void`

#### Overrides

ReObject.drawHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:94](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L94)

___

### fragGetAtoms

▸ **fragGetAtoms**(`restruct`, `fid`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `fid` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L32)

___

### fragGetBonds

▸ **fragGetBonds**(`restruct`, `fid`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `fid` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:38](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L38)

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

### makeSelectionPlate

▸ **makeSelectionPlate**(`_restruct`, `_paper`, `_styles`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_restruct` | [`ReStruct`](ReStruct.md) |
| `_paper` | `any` |
| `_styles` | `any` |

#### Returns

`any`

#### Inherited from

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reobject.ts:73](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reobject.ts#L73)

___

### setHover

▸ **setHover**(`hover`, `render`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hover` | `any` |
| `render` | `any` |

#### Returns

`void`

#### Overrides

ReObject.setHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:99](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L99)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/refrag.js:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/refrag.js#L28)
