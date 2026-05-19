[ketcher-core](../README.md) / ReRxnPlus

# Class: ReRxnPlus

## Hierarchy

- `ReObject`

  ↳ **`ReRxnPlus`**

## Table of contents

### Constructors

- [constructor](ReRxnPlus.md#constructor)

### Properties

- [hover](ReRxnPlus.md#hover)
- [hovering](ReRxnPlus.md#hovering)
- [item](ReRxnPlus.md#item)
- [selected](ReRxnPlus.md#selected)
- [selectionPlate](ReRxnPlus.md#selectionplate)
- [visel](ReRxnPlus.md#visel)

### Methods

- [drawHover](ReRxnPlus.md#drawhover)
- [getVBoxObj](ReRxnPlus.md#getvboxobj)
- [hoverPath](ReRxnPlus.md#hoverpath)
- [makeSelectionPlate](ReRxnPlus.md#makeselectionplate)
- [setHover](ReRxnPlus.md#sethover)
- [show](ReRxnPlus.md#show)
- [isSelectable](ReRxnPlus.md#isselectable)

## Constructors

### constructor

• **new ReRxnPlus**(`plus`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `plus` | `any` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L25)

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

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L27)

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

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:42](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L42)

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

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:34](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L34)

___

### makeSelectionPlate

▸ **makeSelectionPlate**(`restruct`, `paper`, `styles`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | `any` |
| `paper` | `any` |
| `styles` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:48](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L48)

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

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:53](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L53)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnplus.js:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnplus.js#L30)
