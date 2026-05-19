[ketcher-core](../README.md) / KetSerializer

# Class: KetSerializer

## Implements

- [`Serializer`](../interfaces/Serializer.md)<[`Struct`](Struct.md)\>

## Table of contents

### Constructors

- [constructor](KetSerializer.md#constructor)

### Methods

- [deserialize](KetSerializer.md#deserialize)
- [serialize](KetSerializer.md#serialize)

## Constructors

### constructor

• **new KetSerializer**()

## Methods

### deserialize

▸ **deserialize**(`content`): [`Struct`](Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |

#### Returns

[`Struct`](Struct.md)

#### Implementation of

[Serializer](../interfaces/Serializer.md).[deserialize](../interfaces/Serializer.md#deserialize)

#### Defined in

[packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts#L72)

___

### serialize

▸ **serialize**(`struct`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | [`Struct`](Struct.md) |

#### Returns

`string`

#### Implementation of

[Serializer](../interfaces/Serializer.md).[serialize](../interfaces/Serializer.md#serialize)

#### Defined in

[packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts:88](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts#L88)
