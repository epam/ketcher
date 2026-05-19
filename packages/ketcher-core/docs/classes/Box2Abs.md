[ketcher-core](../README.md) / Box2Abs

# Class: Box2Abs

## Table of contents

### Constructors

- [constructor](Box2Abs.md#constructor)

### Properties

- [p0](Box2Abs.md#p0)
- [p1](Box2Abs.md#p1)

### Methods

- [centre](Box2Abs.md#centre)
- [clone](Box2Abs.md#clone)
- [contains](Box2Abs.md#contains)
- [extend](Box2Abs.md#extend)
- [include](Box2Abs.md#include)
- [pos](Box2Abs.md#pos)
- [sz](Box2Abs.md#sz)
- [toString](Box2Abs.md#tostring)
- [transform](Box2Abs.md#transform)
- [translate](Box2Abs.md#translate)
- [fromRelBox](Box2Abs.md#fromrelbox)
- [segmentIntersection](Box2Abs.md#segmentintersection)
- [union](Box2Abs.md#union)

## Constructors

### constructor

• **new Box2Abs**()

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:24](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L24)

• **new Box2Abs**(`p`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | [`Vec2`](Vec2.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L25)

• **new Box2Abs**(`p0`, `p1`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `p0` | [`Vec2`](Vec2.md) |
| `p1` | [`Vec2`](Vec2.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L26)

• **new Box2Abs**(`x0`, `y0`, `x1`, `y1`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x0` | `number` |
| `y0` | `number` |
| `x1` | `number` |
| `y1` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L27)

## Properties

### p0

• `Readonly` **p0**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:21](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L21)

___

### p1

• `Readonly` **p1**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:22](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L22)

## Methods

### centre

▸ **centre**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:94](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L94)

___

### clone

▸ **clone**(): [`Box2Abs`](Box2Abs.md)

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L54)

___

### contains

▸ **contains**(`p`, `ext?`): `boolean`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `p` | [`Vec2`](Vec2.md) | `undefined` |
| `ext` | `number` | `0.0` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L69)

___

### extend

▸ **extend**(`lp`, `rb`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lp` | [`Vec2`](Vec2.md) |
| `rb` | [`Vec2`](Vec2.md) |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:58](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L58)

___

### include

▸ **include**(`p`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | [`Vec2`](Vec2.md) |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L63)

___

### pos

▸ **pos**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:98](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L98)

___

### sz

▸ **sz**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:90](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L90)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:50](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L50)

___

### transform

▸ **transform**(`f`, `options`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`p`: [`Vec2`](Vec2.md), `options`: `any`) => [`Vec2`](Vec2.md) |
| `options` | `any` |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:84](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L84)

___

### translate

▸ **translate**(`d`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | [`Vec2`](Vec2.md) |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L80)

___

### fromRelBox

▸ `Static` **fromRelBox**(`relBox`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `relBox` | `any` |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:102](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L102)

___

### segmentIntersection

▸ `Static` **segmentIntersection**(`a`, `b`, `c`, `d`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`Vec2`](Vec2.md) |
| `b` | [`Vec2`](Vec2.md) |
| `c` | [`Vec2`](Vec2.md) |
| `d` | [`Vec2`](Vec2.md) |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:115](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L115)

___

### union

▸ `Static` **union**(`b1`, `b2`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `b1` | [`Box2Abs`](Box2Abs.md) |
| `b2` | [`Box2Abs`](Box2Abs.md) |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/box2Abs.ts:111](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/box2Abs.ts#L111)
