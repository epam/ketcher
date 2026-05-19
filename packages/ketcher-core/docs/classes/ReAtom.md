[ketcher-core](../README.md) / ReAtom

# Class: ReAtom

## Hierarchy

- `ReObject`

  ↳ **`ReAtom`**

## Table of contents

### Constructors

- [constructor](ReAtom.md#constructor)

### Properties

- [a](ReAtom.md#a)
- [color](ReAtom.md#color)
- [component](ReAtom.md#component)
- [hover](ReAtom.md#hover)
- [hovering](ReAtom.md#hovering)
- [hydrogenOnTheLeft](ReAtom.md#hydrogenontheleft)
- [label](ReAtom.md#label)
- [selected](ReAtom.md#selected)
- [selectionPlate](ReAtom.md#selectionplate)
- [showLabel](ReAtom.md#showlabel)
- [visel](ReAtom.md#visel)

### Methods

- [drawHover](ReAtom.md#drawhover)
- [getVBoxObj](ReAtom.md#getvboxobj)
- [makeHoverPlate](ReAtom.md#makehoverplate)
- [makeSelectionPlate](ReAtom.md#makeselectionplate)
- [setHover](ReAtom.md#sethover)
- [show](ReAtom.md#show)
- [isSelectable](ReAtom.md#isselectable)

## Constructors

### constructor

• **new ReAtom**(`atom`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `atom` | [`Atom`](Atom.md) |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L65)

## Properties

### a

• **a**: [`Atom`](Atom.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:58](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L58)

___

### color

• **color**: `string`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L61)

___

### component

• **component**: `number`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L62)

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

### hydrogenOnTheLeft

• **hydrogenOnTheLeft**: `boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L60)

___

### label

• `Optional` **label**: `ElemAttr`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L63)

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

### showLabel

• **showLabel**: `boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L59)

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

[packages/ketcher-core/src/application/render/restruct/reatom.ts:87](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L87)

___

### getVBoxObj

▸ **getVBoxObj**(`render`): ``null`` \| [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |

#### Returns

``null`` \| [`Box2Abs`](Box2Abs.md)

#### Overrides

ReObject.getVBoxObj

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L80)

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

[packages/ketcher-core/src/application/render/restruct/reatom.ts:93](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L93)

___

### makeSelectionPlate

▸ **makeSelectionPlate**(`restruct`, `paper`, `styles`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `paper` | `any` |
| `styles` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:115](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L115)

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

▸ **show**(`restruct`, `aid`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `aid` | `number` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:136](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L136)

___

### isSelectable

▸ `Static` **isSelectable**(): ``true``

#### Returns

``true``

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reatom.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reatom.ts#L76)
