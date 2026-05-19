[ketcher-core](../README.md) / ReEnhancedFlag

# Class: ReEnhancedFlag

## Hierarchy

- `ReObject`

  ↳ **`ReEnhancedFlag`**

## Table of contents

### Constructors

- [constructor](ReEnhancedFlag.md#constructor)

### Properties

- [#path](ReEnhancedFlag.md##path)
- [hover](ReEnhancedFlag.md#hover)
- [hovering](ReEnhancedFlag.md#hovering)
- [selected](ReEnhancedFlag.md#selected)
- [selectionPlate](ReEnhancedFlag.md#selectionplate)
- [visel](ReEnhancedFlag.md#visel)

### Methods

- [drawHover](ReEnhancedFlag.md#drawhover)
- [getVBoxObj](ReEnhancedFlag.md#getvboxobj)
- [hoverPath](ReEnhancedFlag.md#hoverpath)
- [makeSelectionPlate](ReEnhancedFlag.md#makeselectionplate)
- [setHover](ReEnhancedFlag.md#sethover)
- [show](ReEnhancedFlag.md#show)
- [isSelectable](ReEnhancedFlag.md#isselectable)

## Constructors

### constructor

• **new ReEnhancedFlag**()

#### Overrides

ReObject.constructor

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L28)

## Properties

### #path

• `Private` **#path**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L26)

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

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:43](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L43)

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

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:36](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L36)

___

### makeSelectionPlate

▸ **makeSelectionPlate**(`restruct`, `_paper`, `options`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `_paper` | `any` |
| `options` | `any` |

#### Returns

`any`

#### Overrides

ReObject.makeSelectionPlate

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:51](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L51)

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

▸ **show**(`restruct`, `fragmentId`, `options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `restruct` | [`ReStruct`](ReStruct.md) |
| `fragmentId` | `number` |
| `options` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L57)

___

### isSelectable

▸ `Static` **isSelectable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/reenhancedFlag.ts#L32)
