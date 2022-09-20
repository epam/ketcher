[ketcher-core](../README.md) / SGroup

# Class: SGroup

## Table of contents

### Constructors

- [constructor](SGroup.md#constructor)

### Properties

- [allAtoms](SGroup.md#allatoms)
- [areas](SGroup.md#areas)
- [atomSet](SGroup.md#atomset)
- [atoms](SGroup.md#atoms)
- [bonds](SGroup.md#bonds)
- [bracketBox](SGroup.md#bracketbox)
- [bracketDir](SGroup.md#bracketdir)
- [data](SGroup.md#data)
- [hover](SGroup.md#hover)
- [hovering](SGroup.md#hovering)
- [id](SGroup.md#id)
- [label](SGroup.md#label)
- [neiAtoms](SGroup.md#neiatoms)
- [parentAtomSet](SGroup.md#parentatomset)
- [patoms](SGroup.md#patoms)
- [pp](SGroup.md#pp)
- [selected](SGroup.md#selected)
- [selectionPlate](SGroup.md#selectionplate)
- [type](SGroup.md#type)
- [xBonds](SGroup.md#xbonds)
- [TYPES](SGroup.md#types)

### Methods

- [calculatePP](SGroup.md#calculatepp)
- [checkAttr](SGroup.md#checkattr)
- [getAttr](SGroup.md#getattr)
- [getAttrs](SGroup.md#getattrs)
- [setAttr](SGroup.md#setattr)
- [updateOffset](SGroup.md#updateoffset)
- [addAtom](SGroup.md#addatom)
- [bracketPos](SGroup.md#bracketpos)
- [clone](SGroup.md#clone)
- [filter](SGroup.md#filter)
- [filterAtoms](SGroup.md#filteratoms)
- [getAtoms](SGroup.md#getatoms)
- [getBonds](SGroup.md#getbonds)
- [getBracketParameters](SGroup.md#getbracketparameters)
- [getCrossBonds](SGroup.md#getcrossbonds)
- [getMassCentre](SGroup.md#getmasscentre)
- [getObjBBox](SGroup.md#getobjbbox)
- [getOffset](SGroup.md#getoffset)
- [prepareMulForSaving](SGroup.md#preparemulforsaving)
- [removeAtom](SGroup.md#removeatom)
- [removeNegative](SGroup.md#removenegative)

## Constructors

### constructor

• **new SGroup**(`type`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` |

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L80)

## Properties

### allAtoms

• **allAtoms**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:73](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L73)

___

### areas

• **areas**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:64](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L64)

___

### atomSet

• **atomSet**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:70](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L70)

___

### atoms

• **atoms**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L69)

___

### bonds

• **bonds**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:74](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L74)

___

### bracketBox

• **bracketBox**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L62)

___

### bracketDir

• **bracketDir**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L63)

___

### data

• **data**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:78](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L78)

___

### hover

• **hover**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L65)

___

### hovering

• **hovering**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:66](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L66)

___

### id

• **id**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L60)

___

### label

• **label**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L61)

___

### neiAtoms

• **neiAtoms**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L76)

___

### parentAtomSet

• **parentAtomSet**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:71](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L71)

___

### patoms

• `Optional` **patoms**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L72)

___

### pp

• **pp**: ``null`` \| [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:77](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L77)

___

### selected

• **selected**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:67](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L67)

___

### selectionPlate

• **selectionPlate**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:68](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L68)

___

### type

• **type**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L59)

___

### xBonds

• **xBonds**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:75](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L75)

___

### TYPES

▪ `Static` **TYPES**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ANY` | `string` |
| `COM` | `string` |
| `COP` | `string` |
| `CRO` | `string` |
| `DAT` | `string` |
| `FOR` | `string` |
| `GEN` | `string` |
| `GRA` | `string` |
| `MER` | `string` |
| `MIX` | `string` |
| `MOD` | `string` |
| `MON` | `string` |
| `MUL` | `string` |
| `SRU` | `string` |
| `SUP` | `string` |

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L41)

## Methods

### calculatePP

▸ **calculatePP**(`struct`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:154](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L154)

___

### checkAttr

▸ **checkAttr**(`attr`, `value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attr` | `string` |
| `value` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:146](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L146)

___

### getAttr

▸ **getAttr**(`attr`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attr` | `string` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:125](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L125)

___

### getAttrs

▸ **getAttrs**(): `any`

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:130](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L130)

___

### setAttr

▸ **setAttr**(`attr`, `value`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attr` | `string` |
| `value` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:139](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L139)

___

### updateOffset

▸ **updateOffset**(`offset`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `offset` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:150](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L150)

___

### addAtom

▸ `Static` **addAtom**(`sgroup`, `aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | [`SGroup`](SGroup.md) |
| `aid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:259](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L259)

___

### bracketPos

▸ `Static` **bracketPos**(`sGroup`, `mol`, `crossBondsPerAtom`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sGroup` | `any` |
| `mol` | `any` |
| `crossBondsPerAtom` | `Object` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:296](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L296)

___

### clone

▸ `Static` **clone**(`sgroup`, `aidMap`): [`SGroup`](SGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | [`SGroup`](SGroup.md) |
| `aidMap` | `Map`<`number`, `number`\> |

#### Returns

[`SGroup`](SGroup.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:242](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L242)

___

### filter

▸ `Static` **filter**(`_mol`, `sg`, `atomMap`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_mol` | `any` |
| `sg` | `any` |
| `atomMap` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:238](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L238)

___

### filterAtoms

▸ `Static` **filterAtoms**(`atoms`, `map`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `atoms` | `any` |
| `map` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:219](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L219)

___

### getAtoms

▸ `Static` **getAtoms**(`mol`, `sg`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `mol` | `any` |
| `sg` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:420](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L420)

___

### getBonds

▸ `Static` **getBonds**(`mol`, `sg`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `mol` | `any` |
| `sg` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:429](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L429)

___

### getBracketParameters

▸ `Static` **getBracketParameters**(`mol`, `crossBondsPerAtom`, `atomSet`, `bb`, `d`, `n`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `mol` | `any` |
| `crossBondsPerAtom` | `Object` |
| `atomSet` | [`Pile`](Pile.md)<`number`\> |
| `bb` | `any` |
| `d` | `any` |
| `n` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:339](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L339)

___

### getCrossBonds

▸ `Static` **getCrossBonds**(`mol`, `parentAtomSet`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mol` | `any` |
| `parentAtomSet` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`Object`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:272](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L272)

___

### getMassCentre

▸ `Static` **getMassCentre**(`mol`, `atoms`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `mol` | `any` |
| `atoms` | `any` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:521](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L521)

___

### getObjBBox

▸ `Static` **getObjBBox**(`atoms`, `mol`): [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `atoms` | `any` |
| `mol` | `any` |

#### Returns

[`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:408](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L408)

___

### getOffset

▸ `Static` **getOffset**(`sgroup`): ``null`` \| [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | [`SGroup`](SGroup.md) |

#### Returns

``null`` \| [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:214](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L214)

___

### prepareMulForSaving

▸ `Static` **prepareMulForSaving**(`sgroup`, `mol`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | `any` |
| `mol` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:440](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L440)

___

### removeAtom

▸ `Static` **removeAtom**(`sgroup`, `aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | [`SGroup`](SGroup.md) |
| `aid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:263](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L263)

___

### removeNegative

▸ `Static` **removeNegative**(`atoms`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `atoms` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroup.ts:230](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroup.ts#L230)
