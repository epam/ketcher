[ketcher-core](../README.md) / Pile

# Class: Pile<TValue\>

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

- `Set`<`TValue`\>

  ↳ **`Pile`**

## Table of contents

### Constructors

- [constructor](Pile.md#constructor)

### Properties

- [[toStringTag]](Pile.md#[tostringtag])
- [size](Pile.md#size)
- [[species]](Pile.md#[species])

### Methods

- [[iterator]](Pile.md#[iterator])
- [add](Pile.md#add)
- [clear](Pile.md#clear)
- [delete](Pile.md#delete)
- [entries](Pile.md#entries)
- [equals](Pile.md#equals)
- [filter](Pile.md#filter)
- [find](Pile.md#find)
- [forEach](Pile.md#foreach)
- [has](Pile.md#has)
- [isSuperset](Pile.md#issuperset)
- [keys](Pile.md#keys)
- [union](Pile.md#union)
- [values](Pile.md#values)

## Constructors

### constructor

• **new Pile**<`TValue`\>(`values?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | ``null`` \| readonly `TValue`[] |

#### Inherited from

Set<TValue\>.constructor

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:68

• **new Pile**<`TValue`\>(`iterable?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `iterable?` | ``null`` \| `Iterable`<`TValue`\> |

#### Inherited from

Set<TValue\>.constructor

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:209

## Properties

### [toStringTag]

• `Readonly` **[toStringTag]**: `string`

#### Inherited from

Set.\_\_@toStringTag@1201

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:143

___

### size

• `Readonly` **size**: `number`

#### Inherited from

Set.size

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:64

___

### [species]

▪ `Static` `Readonly` **[species]**: `SetConstructor`

#### Inherited from

Set.\_\_@species@1193

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:320

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<`TValue`\>

Iterates over values in the set.

#### Returns

`IterableIterator`<`TValue`\>

#### Inherited from

Set.\_\_@iterator@92

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:172

___

### add

▸ **add**(`value`): [`Pile`](Pile.md)<`TValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `TValue` |

#### Returns

[`Pile`](Pile.md)<`TValue`\>

#### Inherited from

Set.add

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:59

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Inherited from

Set.clear

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:60

___

### delete

▸ **delete**(`value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `TValue` |

#### Returns

`boolean`

#### Inherited from

Set.delete

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:61

___

### entries

▸ **entries**(): `IterableIterator`<[`TValue`, `TValue`]\>

Returns an iterable of [v,v] pairs for every value `v` in the set.

#### Returns

`IterableIterator`<[`TValue`, `TValue`]\>

#### Inherited from

Set.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:176

___

### equals

▸ **equals**(`setB`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `setB` | [`Pile`](Pile.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/pile.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pile.ts#L28)

___

### filter

▸ **filter**(`expression`): [`Pile`](Pile.md)<`TValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `expression` | (`arg`: `TValue`) => `boolean` |

#### Returns

[`Pile`](Pile.md)<`TValue`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/pile.ts:40](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pile.ts#L40)

___

### find

▸ **find**(`predicate`): ``null`` \| `TValue`

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`item`: `TValue`) => `boolean` |

#### Returns

``null`` \| `TValue`

#### Defined in

[packages/ketcher-core/src/domain/entities/pile.ts:20](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pile.ts#L20)

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`value`: `TValue`, `value2`: `TValue`, `set`: `Set`<`TValue`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

Set.forEach

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:62

___

### has

▸ **has**(`value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `TValue` |

#### Returns

`boolean`

#### Inherited from

Set.has

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:63

___

### isSuperset

▸ **isSuperset**(`subset`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `subset` | [`Pile`](Pile.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/pile.ts:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pile.ts#L32)

___

### keys

▸ **keys**(): `IterableIterator`<`TValue`\>

Despite its name, returns an iterable of the values in the set.

#### Returns

`IterableIterator`<`TValue`\>

#### Inherited from

Set.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:180

___

### union

▸ **union**(`setB`): [`Pile`](Pile.md)<`TValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `setB` | [`Pile`](Pile.md)<`any`\> |

#### Returns

[`Pile`](Pile.md)<`TValue`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/pile.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/pile.ts#L44)

___

### values

▸ **values**(): `IterableIterator`<`TValue`\>

Returns an iterable of values in the set.

#### Returns

`IterableIterator`<`TValue`\>

#### Inherited from

Set.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:185
