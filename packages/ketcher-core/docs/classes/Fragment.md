[ketcher-core](../README.md) / Fragment

# Class: Fragment

## Table of contents

### Constructors

- [constructor](Fragment.md#constructor)

### Properties

- [#enhancedStereoFlag](Fragment.md##enhancedstereoflag)
- [#stereoAtoms](Fragment.md##stereoatoms)
- [stereoFlagPosition](Fragment.md#stereoflagposition)

### Accessors

- [enhancedStereoFlag](Fragment.md#enhancedstereoflag)
- [stereoAtoms](Fragment.md#stereoatoms)

### Methods

- [addStereoAtom](Fragment.md#addstereoatom)
- [clone](Fragment.md#clone)
- [deleteStereoAtom](Fragment.md#deletestereoatom)
- [updateStereoAtom](Fragment.md#updatestereoatom)
- [updateStereoFlag](Fragment.md#updatestereoflag)
- [getDefaultStereoFlagPosition](Fragment.md#getdefaultstereoflagposition)

## Constructors

### constructor

• **new Fragment**(`stereoAtoms?`, `stereoFlagPosition?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `stereoAtoms` | `number`[] | `[]` |
| `stereoFlagPosition?` | [`Point`](../interfaces/Point.md) | `undefined` |

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:86](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L86)

## Properties

### #enhancedStereoFlag

• `Private` `Optional` **#enhancedStereoFlag**: [`StereoFlag`](../enums/StereoFlag.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:74](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L74)

___

### #stereoAtoms

• `Private` **#stereoAtoms**: `number`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L76)

___

### stereoFlagPosition

• `Optional` **stereoFlagPosition**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:75](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L75)

## Accessors

### enhancedStereoFlag

• `get` **enhancedStereoFlag**(): `undefined` \| [`StereoFlag`](../enums/StereoFlag.md)

#### Returns

`undefined` \| [`StereoFlag`](../enums/StereoFlag.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:82](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L82)

___

### stereoAtoms

• `get` **stereoAtoms**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:78](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L78)

## Methods

### addStereoAtom

▸ **addStereoAtom**(`atomId`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `atomId` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:134](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L134)

___

### clone

▸ **clone**(`aidMap`): [`Fragment`](Fragment.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `aidMap` | `Map`<`number`, `number`\> |

#### Returns

[`Fragment`](Fragment.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:104](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L104)

___

### deleteStereoAtom

▸ **deleteStereoAtom**(`struct`, `fragmentId`, `atomId`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |
| `fragmentId` | `number` |
| `atomId` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:142](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L142)

___

### updateStereoAtom

▸ **updateStereoAtom**(`struct`, `aid`, `frId`, `isAdd`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |
| `aid` | `number` |
| `frId` | `number` |
| `isAdd` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:117](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L117)

___

### updateStereoFlag

▸ **updateStereoFlag**(`struct`): `undefined` \| [`StereoFlag`](../enums/StereoFlag.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |

#### Returns

`undefined` \| [`StereoFlag`](../enums/StereoFlag.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:111](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L111)

___

### getDefaultStereoFlagPosition

▸ `Static` **getDefaultStereoFlagPosition**(`struct`, `fragmentId`): `undefined` \| [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |
| `fragmentId` | `number` |

#### Returns

`undefined` \| [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/fragment.ts:94](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/fragment.ts#L94)
