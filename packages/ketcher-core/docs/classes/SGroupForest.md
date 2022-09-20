[ketcher-core](../README.md) / SGroupForest

# Class: SGroupForest

## Table of contents

### Constructors

- [constructor](SGroupForest.md#constructor)

### Properties

- [atomSets](SGroupForest.md#atomsets)
- [children](SGroupForest.md#children)
- [parent](SGroupForest.md#parent)

### Methods

- [getAtomSetRelations](SGroupForest.md#getatomsetrelations)
- [getPathToRoot](SGroupForest.md#getpathtoroot)
- [getSGroupsBFS](SGroupForest.md#getsgroupsbfs)
- [insert](SGroupForest.md#insert)
- [remove](SGroupForest.md#remove)
- [resetParentLink](SGroupForest.md#resetparentlink)

## Constructors

### constructor

• **new SGroupForest**()

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L28)

## Properties

### atomSets

• **atomSets**: `Map`<`number`, `any`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L26)

___

### children

• **children**: `Map`<`number`, `number`[]\>

node id -> list of child ids

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L25)

___

### parent

• **parent**: `Map`<`number`, `number`\>

node id -> parent id

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L23)

## Methods

### getAtomSetRelations

▸ **getAtomSetRelations**(`newId`, `atoms`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newId` | `any` |
| `atoms` | `any` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `children` | `number`[] |
| `parent` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L60)

___

### getPathToRoot

▸ **getPathToRoot**(`sgid`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgid` | `any` |

#### Returns

`number`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:94](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L94)

___

### getSGroupsBFS

▸ **getSGroupsBFS**(): `number`[]

returns an array or s-group ids in the order of breadth-first search

#### Returns

`number`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L37)

___

### insert

▸ **insert**(`__namedParameters`, `parent?`, `children?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `parent?` | `number` |
| `children?` | `number`[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `children` | `number`[] |
| `parent` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:102](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L102)

___

### remove

▸ **remove**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:144](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L144)

___

### resetParentLink

▸ `Private` **resetParentLink**(`childId`, `id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `childId` | `any` |
| `id` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:128](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L128)
