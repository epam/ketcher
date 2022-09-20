[ketcher-core](../README.md) / ReSimpleObject

# Class: ReSimpleObject

## Hierarchy

- `ReObject`

  ↳ **`ReSimpleObject`**

## Table of contents

### Constructors

- [constructor](ReSimpleObject.md#constructor)

### Properties

- [hover](ReSimpleObject.md#hover)
- [hovering](ReSimpleObject.md#hovering)
- [item](ReSimpleObject.md#item)
- [selected](ReSimpleObject.md#selected)
- [selectionPlate](ReSimpleObject.md#selectionplate)
- [visel](ReSimpleObject.md#visel)

### Methods

- [calcDistance](ReSimpleObject.md#calcdistance)
- [drawHover](ReSimpleObject.md#drawhover)
- [getReferencePointDistance](ReSimpleObject.md#getreferencepointdistance)
- [getReferencePoints](ReSimpleObject.md#getreferencepoints)
- [getVBoxObj](ReSimpleObject.md#getvboxobj)
- [hoverPath](ReSimpleObject.md#hoverpath)
- [makeSelectionPlate](ReSimpleObject.md#makeselectionplate)
- [setHover](ReSimpleObject.md#sethover)
- [show](ReSimpleObject.md#show)
- [isSelectable](ReSimpleObject.md#isselectable)

## Constructors

### constructor

• **new ReSimpleObject**(`simpleObject`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `simpleObject` | `any` |

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L39)

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

• `Private` **item**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L37)

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

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:48](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L48)

___

### drawHover

▸ **drawHover**(`render`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |

#### Returns

`any`[]

#### Overrides

ReObject.drawHover

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:339](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L339)

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

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:136](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L136)

___

### getReferencePoints

▸ **getReferencePoints**(`onlyOnObject?`): [`Vec2`](Vec2.md)[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `onlyOnObject` | `boolean` | `false` |

#### Returns

[`Vec2`](Vec2.md)[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:152](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L152)

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

▸ **hoverPath**(`render`): `StyledPath`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | [`Render`](Render.md) |

#### Returns

`StyledPath`[]

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:192](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L192)

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

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:351](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L351)

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

▸ **show**(`restruct`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:375](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L375)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/resimpleObject.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/resimpleObject.ts#L44)
