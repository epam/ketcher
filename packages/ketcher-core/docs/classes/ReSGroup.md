[ketcher-core](../README.md) / ReSGroup

# Class: ReSGroup

## Hierarchy

- `ReObject`

  ↳ **`ReSGroup`**

## Table of contents

### Constructors

- [constructor](ReSGroup.md#constructor)

### Properties

- [hover](ReSGroup.md#hover)
- [hovering](ReSGroup.md#hovering)
- [item](ReSGroup.md#item)
- [render](ReSGroup.md#render)
- [selected](ReSGroup.md#selected)
- [selectionPlate](ReSGroup.md#selectionplate)
- [visel](ReSGroup.md#visel)

### Methods

- [draw](ReSGroup.md#draw)
- [drawHover](ReSGroup.md#drawhover)
- [getVBoxObj](ReSGroup.md#getvboxobj)
- [makeSelectionPlate](ReSGroup.md#makeselectionplate)
- [setHover](ReSGroup.md#sethover)
- [show](ReSGroup.md#show)
- [isSelectable](ReSGroup.md#isselectable)

## Constructors

### constructor

• **new ReSGroup**(`sgroup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | `any` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L29)

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

[packages/ketcher-core/src/application/render/restruct/resgroup.js:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L31)

___

### render

• **render**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L39)

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

### draw

▸ **draw**(`remol`, `sgroup`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `remol` | `any` |
| `sgroup` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:38](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L38)

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

[packages/ketcher-core/src/application/render/restruct/resgroup.js:133](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L133)

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

▸ **makeSelectionPlate**(`restruct`, `paper`, `options`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `paper` | `any` |
| `options` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:122](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L122)

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

▸ **show**(`restruct`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:178](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L178)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resgroup.js:34](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resgroup.js#L34)
