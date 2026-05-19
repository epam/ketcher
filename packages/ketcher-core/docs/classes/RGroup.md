[ketcher-core](../README.md) / RGroup

# Class: RGroup

## Table of contents

### Constructors

- [constructor](RGroup.md#constructor)

### Properties

- [frags](RGroup.md#frags)
- [ifthen](RGroup.md#ifthen)
- [index](RGroup.md#index)
- [range](RGroup.md#range)
- [resth](RGroup.md#resth)

### Methods

- [clone](RGroup.md#clone)
- [getAttrs](RGroup.md#getattrs)
- [findRGroupByFragment](RGroup.md#findrgroupbyfragment)

## Constructors

### constructor

• **new RGroup**(`atrributes?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `atrributes?` | [`RGroupAttributes`](../interfaces/RGroupAttributes.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L33)

## Properties

### frags

• **frags**: [`Pile`](Pile.md)<`number`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L27)

___

### ifthen

• **ifthen**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L30)

___

### index

• **index**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L31)

___

### range

• **range**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L29)

___

### resth

• **resth**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L28)

## Methods

### clone

▸ **clone**(`fidMap?`): [`RGroup`](RGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fidMap?` | ``null`` \| `Map`<`number`, `number`\> |

#### Returns

[`RGroup`](RGroup.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L54)

___

### getAttrs

▸ **getAttrs**(): [`RGroupAttributes`](../interfaces/RGroupAttributes.md)

#### Returns

[`RGroupAttributes`](../interfaces/RGroupAttributes.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:45](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L45)

___

### findRGroupByFragment

▸ `Static` **findRGroupByFragment**(`rgroups`, `frid`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rgroups` | [`Pool`](Pool.md)<[`RGroup`](RGroup.md)\> |
| `frid` | `number` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/rgroup.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rgroup.ts#L41)
