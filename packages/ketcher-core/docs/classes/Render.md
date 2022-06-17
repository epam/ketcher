[ketcher-core](../README.md) / Render

# Class: Render

## Table of contents

### Constructors

- [constructor](Render.md#constructor)

### Properties

- [clientArea](Render.md#clientarea)
- [ctab](Render.md#ctab)
- [oldBb](Render.md#oldbb)
- [oldCb](Render.md#oldcb)
- [options](Render.md#options)
- [paper](Render.md#paper)
- [sz](Render.md#sz)
- [userOpts](Render.md#useropts)

### Methods

- [obj2view](Render.md#obj2view)
- [page2obj](Render.md#page2obj)
- [scrollPos](Render.md#scrollpos)
- [selectionLine](Render.md#selectionline)
- [selectionPolygon](Render.md#selectionpolygon)
- [selectionRectangle](Render.md#selectionrectangle)
- [setMolecule](Render.md#setmolecule)
- [setOffset](Render.md#setoffset)
- [setPaperSize](Render.md#setpapersize)
- [setScale](Render.md#setscale)
- [setScrollOffset](Render.md#setscrolloffset)
- [setViewBox](Render.md#setviewbox)
- [setZoom](Render.md#setzoom)
- [update](Render.md#update)
- [view2obj](Render.md#view2obj)

## Constructors

### constructor

• **new Render**(`clientArea`, `opt`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `clientArea` | `any` |
| `opt` | `any` |

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L25)

## Properties

### clientArea

• **clientArea**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L32)

___

### ctab

• **ctab**: [`ReStruct`](ReStruct.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:35](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L35)

___

### oldBb

• **oldBb**: `undefined` \| [`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:204](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L204)

___

### oldCb

• **oldCb**: `undefined` \| [`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:200](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L200)

___

### options

• **options**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:36](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L36)

___

### paper

• **paper**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L33)

___

### sz

• **sz**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:34](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L34)

___

### userOpts

• **userOpts**: `any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L31)

## Methods

### obj2view

▸ **obj2view**(`v`, `isRelative`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `any` |
| `isRelative` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L61)

___

### page2obj

▸ **page2obj**(`event`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L76)

___

### scrollPos

▸ **scrollPos**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L72)

___

### selectionLine

▸ **selectionLine**(`p0`, `p1`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p0` | `any` |
| `p1` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:43](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L43)

___

### selectionPolygon

▸ **selectionPolygon**(`r`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `r` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L39)

___

### selectionRectangle

▸ **selectionRectangle**(`p0`, `p1`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p0` | `any` |
| `p1` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:47](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L47)

___

### setMolecule

▸ **setMolecule**(`ctab`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ctab` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:167](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L167)

___

### setOffset

▸ **setOffset**(`newoffset`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newoffset` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:92](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L92)

___

### setPaperSize

▸ **setPaperSize**(`sz`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sz` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:86](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L86)

___

### setScale

▸ **setScale**(`z`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:149](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L149)

___

### setScrollOffset

▸ **setScrollOffset**(`x`, `y`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `any` |
| `y` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:120](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L120)

___

### setViewBox

▸ **setViewBox**(`z`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:158](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L158)

___

### setZoom

▸ **setZoom**(`zoom`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `zoom` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:102](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L102)

___

### update

▸ **update**(`force?`, `viewSz?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `force` | `boolean` | `false` |
| `viewSz` | ``null`` | `null` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:174](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L174)

___

### view2obj

▸ **view2obj**(`p`, `isRelative`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `any` |
| `isRelative` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/application/render/raphaelRender.js:51](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/raphaelRender.js#L51)
