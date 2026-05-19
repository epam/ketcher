[ketcher-core](../README.md) / Bond

# Class: Bond

## Table of contents

### Constructors

- [constructor](Bond.md#constructor)

### Properties

- [angle](Bond.md#angle)
- [begin](Bond.md#begin)
- [center](Bond.md#center)
- [end](Bond.md#end)
- [hb1](Bond.md#hb1)
- [hb2](Bond.md#hb2)
- [len](Bond.md#len)
- [reactingCenterStatus](Bond.md#reactingcenterstatus)
- [sa](Bond.md#sa)
- [sb](Bond.md#sb)
- [stereo](Bond.md#stereo)
- [topology](Bond.md#topology)
- [type](Bond.md#type)
- [xxx](Bond.md#xxx)
- [PATTERN](Bond.md#pattern)
- [attrlist](Bond.md#attrlist)

### Methods

- [clone](Bond.md#clone)
- [getCenter](Bond.md#getcenter)
- [getDir](Bond.md#getdir)
- [hasRxnProps](Bond.md#hasrxnprops)
- [attrGetDefault](Bond.md#attrgetdefault)
- [getAttrHash](Bond.md#getattrhash)

## Constructors

### constructor

• **new Bond**(`attributes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributes` | [`BondAttributes`](../interfaces/BondAttributes.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:91](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L91)

## Properties

### angle

• **angle**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:88](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L88)

___

### begin

• **begin**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L76)

___

### center

• **center**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:89](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L89)

___

### end

• **end**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:77](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L77)

___

### hb1

• `Optional` **hb1**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:86](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L86)

___

### hb2

• `Optional` **hb2**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:87](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L87)

___

### len

• **len**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:83](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L83)

___

### reactingCenterStatus

• `Readonly` **reactingCenterStatus**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:82](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L82)

___

### sa

• **sa**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:85](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L85)

___

### sb

• **sb**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:84](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L84)

___

### stereo

• `Readonly` **stereo**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L80)

___

### topology

• `Readonly` **topology**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:81](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L81)

___

### type

• `Readonly` **type**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:78](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L78)

___

### xxx

• `Readonly` **xxx**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:79](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L79)

___

### PATTERN

▪ `Static` **PATTERN**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `REACTING_CENTER` | { `CENTER`: `number` = 1; `MADE_OR_BROKEN`: `number` = 4; `MADE_OR_BROKEN_AND_CHANGED`: `number` = 12; `NOT_CENTER`: `number` = -1; `ORDER_CHANGED`: `number` = 8; `UNCHANGED`: `number` = 2; `UNMARKED`: `number` = 0 } |
| `REACTING_CENTER.CENTER` | `number` |
| `REACTING_CENTER.MADE_OR_BROKEN` | `number` |
| `REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED` | `number` |
| `REACTING_CENTER.NOT_CENTER` | `number` |
| `REACTING_CENTER.ORDER_CHANGED` | `number` |
| `REACTING_CENTER.UNCHANGED` | `number` |
| `REACTING_CENTER.UNMARKED` | `number` |
| `STEREO` | { `CIS_TRANS`: `number` = 3; `DOWN`: `number` = 6; `EITHER`: `number` = 4; `NONE`: `number` = 0; `UP`: `number` = 1 } |
| `STEREO.CIS_TRANS` | `number` |
| `STEREO.DOWN` | `number` |
| `STEREO.EITHER` | `number` |
| `STEREO.NONE` | `number` |
| `STEREO.UP` | `number` |
| `TOPOLOGY` | { `CHAIN`: `number` = 2; `EITHER`: `number` = 0; `RING`: `number` = 1 } |
| `TOPOLOGY.CHAIN` | `number` |
| `TOPOLOGY.EITHER` | `number` |
| `TOPOLOGY.RING` | `number` |
| `TYPE` | { `ANY`: `number` = 8; `AROMATIC`: `number` = 4; `DATIVE`: `number` = 9; `DOUBLE`: `number` = 2; `DOUBLE_OR_AROMATIC`: `number` = 7; `HYDROGEN`: `number` = 10; `SINGLE`: `number` = 1; `SINGLE_OR_AROMATIC`: `number` = 6; `SINGLE_OR_DOUBLE`: `number` = 5; `TRIPLE`: `number` = 3 } |
| `TYPE.ANY` | `number` |
| `TYPE.AROMATIC` | `number` |
| `TYPE.DATIVE` | `number` |
| `TYPE.DOUBLE` | `number` |
| `TYPE.DOUBLE_OR_AROMATIC` | `number` |
| `TYPE.HYDROGEN` | `number` |
| `TYPE.SINGLE` | `number` |
| `TYPE.SINGLE_OR_AROMATIC` | `number` |
| `TYPE.SINGLE_OR_DOUBLE` | `number` |
| `TYPE.TRIPLE` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L30)

___

### attrlist

▪ `Static` **attrlist**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `reactingCenterStatus` | `number` |
| `stereo` | `number` |
| `topology` | `number` |
| `type` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L69)

## Methods

### clone

▸ **clone**(`aidMap?`): [`Bond`](Bond.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `aidMap?` | ``null`` \| `Map`<`number`, `number`\> |

#### Returns

[`Bond`](Bond.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:145](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L145)

___

### getCenter

▸ **getCenter**(`struct`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:133](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L133)

___

### getDir

▸ **getDir**(`struct`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:139](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L139)

___

### hasRxnProps

▸ **hasRxnProps**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:129](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L129)

___

### attrGetDefault

▸ `Static` **attrGetDefault**(`attr`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attr` | `string` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:123](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L123)

___

### getAttrHash

▸ `Static` **getAttrHash**(`bond`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bond` | [`Bond`](Bond.md) |

#### Returns

`Object`

#### Defined in

[packages/ketcher-core/src/domain/entities/bond.ts:113](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/bond.ts#L113)
