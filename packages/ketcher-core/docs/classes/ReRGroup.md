[ketcher-core](../README.md) / ReRGroup

# Class: ReRGroup

## Hierarchy

- `ReObject`

  ↳ **`ReRGroup`**

## Table of contents

### Constructors

- [constructor](ReRGroup.md#constructor)

### Properties

- [hover](ReRGroup.md#hover)
- [hovering](ReRGroup.md#hovering)
- [item](ReRGroup.md#item)
- [labelBox](ReRGroup.md#labelbox)
- [selected](ReRGroup.md#selected)
- [selectionPlate](ReRGroup.md#selectionplate)
- [visel](ReRGroup.md#visel)

### Methods

- [\_draw](ReRGroup.md#_draw)
- [calcBBox](ReRGroup.md#calcbbox)
- [draw](ReRGroup.md#draw)
- [drawHover](ReRGroup.md#drawhover)
- [getAtoms](ReRGroup.md#getatoms)
- [getBonds](ReRGroup.md#getbonds)
- [getVBoxObj](ReRGroup.md#getvboxobj)
- [makeSelectionPlate](ReRGroup.md#makeselectionplate)
- [setHover](ReRGroup.md#sethover)
- [show](ReRGroup.md#show)
- [isSelectable](ReRGroup.md#isselectable)

## Constructors

### constructor

• **new ReRGroup**(`rgroup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rgroup` | `any` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L27)

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

[packages/ketcher-core/src/application/render/restruct/rergroup.js:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L30)

___

### labelBox

• **labelBox**: ``null`` \| [`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L29)

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

▸ **_draw**(`render`, `rgid`, `attrs`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |
| `rgid` | `any` |
| `attrs` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:133](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L133)

___

### calcBBox

▸ **calcBBox**(`render`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L57)

___

### draw

▸ **draw**(`render`, `options`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |
| `options` | `any` |

#### Returns

`Object`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:70](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L70)

___

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

[packages/ketcher-core/src/application/render/restruct/rergroup.js:147](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L147)

___

### getAtoms

▸ **getAtoms**(`render`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L37)

___

### getBonds

▸ **getBonds**(`render`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:47](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L47)

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

▸ **show**(`restruct`, `id`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `id` | `any` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:171](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L171)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rergroup.js:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rergroup.js#L33)
