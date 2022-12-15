[ketcher-core](../README.md) / ReRxnArrow

# Class: ReRxnArrow

## Hierarchy

- `ReObject`

  ↳ **`ReRxnArrow`**

## Table of contents

### Constructors

- [constructor](ReRxnArrow.md#constructor)

### Properties

- [hover](ReRxnArrow.md#hover)
- [hovering](ReRxnArrow.md#hovering)
- [item](ReRxnArrow.md#item)
- [selected](ReRxnArrow.md#selected)
- [selectionPlate](ReRxnArrow.md#selectionplate)
- [visel](ReRxnArrow.md#visel)

### Methods

- [calcDistance](ReRxnArrow.md#calcdistance)
- [drawHover](ReRxnArrow.md#drawhover)
- [generatePath](ReRxnArrow.md#generatepath)
- [getArrowParams](ReRxnArrow.md#getarrowparams)
- [getReferencePointDistance](ReRxnArrow.md#getreferencepointdistance)
- [getReferencePoints](ReRxnArrow.md#getreferencepoints)
- [getVBoxObj](ReRxnArrow.md#getvboxobj)
- [hoverPath](ReRxnArrow.md#hoverpath)
- [makeSelectionPlate](ReRxnArrow.md#makeselectionplate)
- [setHover](ReRxnArrow.md#sethover)
- [show](ReRxnArrow.md#show)
- [isSelectable](ReRxnArrow.md#isselectable)

## Constructors

### constructor

• **new ReRxnArrow**(`arrow`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `arrow` | `Arrow` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L46)

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

• **item**: `Arrow`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L44)

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

### calcDistance

▸ **calcDistance**(`p`, `s`): `MinDistanceWithReferencePoint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | [`Vec2`](Vec2.md) |
| `s` | `any` |

#### Returns

`MinDistanceWithReferencePoint`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:55](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L55)

___

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

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:105](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L105)

___

### generatePath

▸ **generatePath**(`render`, `options`, `type`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |
| `options` | `any` |
| `type` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:150](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L150)

___

### getArrowParams

▸ **getArrowParams**(`x1`, `y1`, `x2`, `y2`): `ArrowParams`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x1` | `any` |
| `y1` | `any` |
| `x2` | `any` |
| `y2` | `any` |

#### Returns

`ArrowParams`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:188](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L188)

___

### getReferencePointDistance

▸ **getReferencePointDistance**(`p`): `MinDistanceWithReferencePoint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | [`Vec2`](Vec2.md) |

#### Returns

`MinDistanceWithReferencePoint`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:83](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L83)

___

### getReferencePoints

▸ **getReferencePoints**(): [`Vec2`](Vec2.md)[]

#### Returns

[`Vec2`](Vec2.md)[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:111](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L111)

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
| `render` | [`Render`](Render.md) |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:99](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L99)

___

### makeSelectionPlate

▸ **makeSelectionPlate**(`restruct`, `_paper`, `styles`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `_paper` | `any` |
| `styles` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:126](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L126)

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
| `_id` | `any` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:195](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L195)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts:51](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/rerxnarrow.ts#L51)
