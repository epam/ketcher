[ketcher-core](../README.md) / Serializer

# Interface: Serializer<T\>

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

| Name |
| :------ |
| `T` |

## Implemented by

- [`KetSerializer`](../classes/KetSerializer.md)
- [`MolSerializer`](../classes/MolSerializer.md)
- [`SdfSerializer`](../classes/SdfSerializer.md)
- [`SmiSerializer`](../classes/SmiSerializer.md)

## Table of contents

### Methods

- [deserialize](Serializer.md#deserialize)
- [serialize](Serializer.md#serialize)

## Methods

### deserialize

▸ **deserialize**(`content`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |

#### Returns

`T`

#### Defined in

[packages/ketcher-core/src/domain/serializers/serializers.types.ts:18](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/serializers.types.ts#L18)

___

### serialize

▸ **serialize**(`struct`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `T` |

#### Returns

`string`

#### Defined in

[packages/ketcher-core/src/domain/serializers/serializers.types.ts:19](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/serializers.types.ts#L19)
