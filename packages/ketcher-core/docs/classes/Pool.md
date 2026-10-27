[ketcher-core](../README.md) / Pool

# Class: Pool<TValue\>

Copyright 2021 EPAM Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | `any` |

## Hierarchy

- `Map`<`number`, `TValue`\>

  ↳ **`Pool`**

## Table of contents

### Constructors

- [constructor](Pool.md#constructor)

### Properties

- [[toStringTag]](Pool.md#[tostringtag])
- [nextId](Pool.md#nextid)
- [size](Pool.md#size)
- [[species]](Pool.md#[species])

### Methods

- [[iterator]](Pool.md#[iterator])
- [add](Pool.md#add)
- [clear](Pool.md#clear)
- [delete](Pool.md#delete)
- [entries](Pool.md#entries)
- [filter](Pool.md#filter)
- [find](Pool.md#find)
- [forEach](Pool.md#foreach)
- [get](Pool.md#get)
- [has](Pool.md#has)
- [keyOf](Pool.md#keyof)
- [keys](Pool.md#keys)
- [newId](Pool.md#newid)
- [set](Pool.md#set)
- [some](Pool.md#some)
- [values](Pool.md#values)

## Constructors

### constructor

• **new Pool**<`TValue`\>(`entries?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entries?` | ``null`` \| readonly readonly [`number`, `TValue`][] |

#### Inherited from

Map<number, TValue\>.constructor

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:33

• **new Pool**<`TValue`\>(`iterable?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `iterable?` | ``null`` \| `Iterable`<readonly [`number`, `TValue`]\> |

#### Inherited from

Map<number, TValue\>.constructor

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:161

## Properties

### [toStringTag]

• `Readonly` **[toStringTag]**: `string`

#### Inherited from

Map.\_\_@toStringTag@1201

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:135

___

### nextId

• `Private` **nextId**: `number` = `0`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:18](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L18)

___

### size

• `Readonly` **size**: `number`

#### Inherited from

Map.size

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:28

___

### [species]

▪ `Static` `Readonly` **[species]**: `MapConstructor`

#### Inherited from

Map.\_\_@species@1193

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:317

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`number`, `TValue`]\>

Returns an iterable of entries in the map.

#### Returns

`IterableIterator`<[`number`, `TValue`]\>

#### Inherited from

Map.\_\_@iterator@92

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:121

___

### add

▸ **add**(`item`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `TValue` |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:20](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L20)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Inherited from

Map.clear

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:22

___

### delete

▸ **delete**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`boolean`

#### Inherited from

Map.delete

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:23

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, `TValue`]\>

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`IterableIterator`<[`number`, `TValue`]\>

#### Inherited from

Map.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:126

___

### filter

▸ **filter**(`predicate`): [`Pool`](Pool.md)<`TValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`key`: `number`, `value`: `TValue`) => `boolean` |

#### Returns

[`Pool`](Pool.md)<`TValue`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L46)

___

### find

▸ **find**(`predicate`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`key`: `number`, `value`: `TValue`) => `boolean` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:38](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L38)

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`value`: `TValue`, `key`: `number`, `map`: `Map`<`number`, `TValue`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

Map.forEach

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:24

___

### get

▸ **get**(`key`): `undefined` \| `TValue`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`undefined` \| `TValue`

#### Inherited from

Map.get

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:25

___

### has

▸ **has**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`boolean`

#### Inherited from

Map.has

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:26

___

### keyOf

▸ **keyOf**(`item`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `TValue` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L30)

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an iterable of keys in the map

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Map.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:131

___

### newId

▸ **newId**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L26)

___

### set

▸ **set**(`key`, `value`): [`Pool`](Pool.md)<`TValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |
| `value` | `TValue` |

#### Returns

[`Pool`](Pool.md)<`TValue`\>

#### Inherited from

Map.set

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:27

___

### some

▸ **some**(`predicate`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`value`: `TValue`) => `boolean` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/pool.ts:52](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pool.ts#L52)

___

### values

▸ **values**(): `IterableIterator`<`TValue`\>

Returns an iterable of values in the map

#### Returns

`IterableIterator`<`TValue`\>

#### Inherited from

Map.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:136
