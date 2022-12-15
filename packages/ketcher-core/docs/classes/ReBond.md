[ketcher-core](../README.md) / ReBond

# Class: ReBond

## Hierarchy

- `ReObject`

  ↳ **`ReBond`**

## Table of contents

### Constructors

- [constructor](ReBond.md#constructor)

### Properties

- [b](ReBond.md#b)
- [boldStereo](ReBond.md#boldstereo)
- [doubleBondShift](ReBond.md#doublebondshift)
- [hover](ReBond.md#hover)
- [hovering](ReBond.md#hovering)
- [neihbid1](ReBond.md#neihbid1)
- [neihbid2](ReBond.md#neihbid2)
- [path](ReBond.md#path)
- [rbb](ReBond.md#rbb)
- [selected](ReBond.md#selected)
- [selectionPlate](ReBond.md#selectionplate)
- [visel](ReBond.md#visel)

### Methods

- [drawHover](ReBond.md#drawhover)
- [getVBoxObj](ReBond.md#getvboxobj)
- [makeHoverPlate](ReBond.md#makehoverplate)
- [makeSelectionPlate](ReBond.md#makeselectionplate)
- [setHover](ReBond.md#sethover)
- [show](ReBond.md#show)
- [isSelectable](ReBond.md#isselectable)

## Constructors

### constructor

• **new ReBond**(`bond`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `bond` | [`Bond`](Bond.md) |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L44)

## Properties

### b

• **b**: [`Bond`](Bond.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:36](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L36)

___

### boldStereo

• `Optional` **boldStereo**: `boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L41)

___

### doubleBondShift

• **doubleBondShift**: `number`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L37)

___

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

### neihbid1

• **neihbid1**: `number` = `-1`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L39)

___

### neihbid2

• **neihbid2**: `number` = `-1`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:40](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L40)

___

### path

• **path**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:38](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L38)

___

### rbb

• `Optional` **rbb**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `height` | `number` |
| `width` | `number` |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:42](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L42)

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
| `render` | [`Render`](Render.md) |

#### Returns

`any`

#### Overrides

ReObject.drawHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L54)

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

### makeHoverPlate

▸ **makeHoverPlate**(`render`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L60)

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

[packages/ketcher-core/src/application/render/restruct/rebond.ts:83](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L83)

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

▸ **show**(`restruct`, `bid`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `bid` | `number` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:105](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L105)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rebond.ts:50](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rebond.ts#L50)
