[ketcher-core](../README.md) / FunctionalGroup

# Class: FunctionalGroup

## Table of contents

### Constructors

- [constructor](FunctionalGroup.md#constructor)

### Properties

- [#sgroup](FunctionalGroup.md##sgroup)

### Accessors

- [isExpanded](FunctionalGroup.md#isexpanded)
- [name](FunctionalGroup.md#name)
- [relatedSGroup](FunctionalGroup.md#relatedsgroup)
- [relatedSGroupId](FunctionalGroup.md#relatedsgroupid)

### Methods

- [atomsInFunctionalGroup](FunctionalGroup.md#atomsinfunctionalgroup)
- [bondsInFunctionalGroup](FunctionalGroup.md#bondsinfunctionalgroup)
- [clone](FunctionalGroup.md#clone)
- [findFunctionalGroupByAtom](FunctionalGroup.md#findfunctionalgroupbyatom)
- [findFunctionalGroupByBond](FunctionalGroup.md#findfunctionalgroupbybond)
- [isAtomInContractedFunctionalGroup](FunctionalGroup.md#isatomincontractedfunctionalgroup)
- [isBondInContractedFunctionalGroup](FunctionalGroup.md#isbondincontractedfunctionalgroup)
- [isContractedFunctionalGroup](FunctionalGroup.md#iscontractedfunctionalgroup)
- [isFirstAtomInFunctionalGroup](FunctionalGroup.md#isfirstatominfunctionalgroup)
- [isFunctionalGroup](FunctionalGroup.md#isfunctionalgroup)

## Constructors

### constructor

• **new FunctionalGroup**(`sgroup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | [`SGroup`](SGroup.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L23)

## Properties

### #sgroup

• `Private` **#sgroup**: [`SGroup`](SGroup.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:21](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L21)

## Accessors

### isExpanded

• `get` **isExpanded**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L37)

___

### name

• `get` **name**(): `string`

#### Returns

`string`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L29)

___

### relatedSGroup

• `get` **relatedSGroup**(): [`SGroup`](SGroup.md)

#### Returns

[`SGroup`](SGroup.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L41)

___

### relatedSGroupId

• `get` **relatedSGroupId**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L33)

## Methods

### atomsInFunctionalGroup

▸ `Static` **atomsInFunctionalGroup**(`functionalGroups`, `atom`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionalGroups` | `any` |
| `atom` | `any` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L54)

___

### bondsInFunctionalGroup

▸ `Static` **bondsInFunctionalGroup**(`molecule`, `functionalGroups`, `bond`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `molecule` | `any` |
| `functionalGroups` | `any` |
| `bond` | `any` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:64](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L64)

___

### clone

▸ `Static` **clone**(`functionalGroup`): [`FunctionalGroup`](FunctionalGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionalGroup` | [`FunctionalGroup`](FunctionalGroup.md) |

#### Returns

[`FunctionalGroup`](FunctionalGroup.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:98](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L98)

___

### findFunctionalGroupByAtom

▸ `Static` **findFunctionalGroupByAtom**(`functionalGroups`, `atom`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionalGroups` | `any` |
| `atom` | `any` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:79](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L79)

___

### findFunctionalGroupByBond

▸ `Static` **findFunctionalGroupByBond**(`molecule`, `functionalGroups`, `bond`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `molecule` | `any` |
| `functionalGroups` | `any` |
| `bond` | `any` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:86](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L86)

___

### isAtomInContractedFunctionalGroup

▸ `Static` **isAtomInContractedFunctionalGroup**(`atom`, `sgroups`, `functionalGroups`, `sgroupsFromReStruct`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `atom` | `any` |
| `sgroups` | `any` |
| `functionalGroups` | `any` |
| `sgroupsFromReStruct` | `boolean` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:111](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L111)

___

### isBondInContractedFunctionalGroup

▸ `Static` **isBondInContractedFunctionalGroup**(`bond`, `sgroups`, `functionalGroups`, `sgroupsFromReStruct`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bond` | `any` |
| `sgroups` | `any` |
| `functionalGroups` | `any` |
| `sgroupsFromReStruct` | `boolean` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:141](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L141)

___

### isContractedFunctionalGroup

▸ `Static` **isContractedFunctionalGroup**(`sgroupId`, `functionalGroups`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroupId` | `any` |
| `functionalGroups` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:174](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L174)

___

### isFirstAtomInFunctionalGroup

▸ `Static` **isFirstAtomInFunctionalGroup**(`sgroups`, `aid`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroups` | `any` |
| `aid` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:102](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L102)

___

### isFunctionalGroup

▸ `Static` **isFunctionalGroup**(`sgroup`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgroup` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/functionalGroup.ts:45](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/functionalGroup.ts#L45)
