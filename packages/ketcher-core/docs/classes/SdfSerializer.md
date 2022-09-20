[ketcher-core](../README.md) / SdfSerializer

# Class: SdfSerializer

## Implements

- [`Serializer`](../interfaces/Serializer.md)<[`SdfItem`](../interfaces/SdfItem.md)[]\>

## Table of contents

### Constructors

- [constructor](SdfSerializer.md#constructor)

### Methods

- [deserialize](SdfSerializer.md#deserialize)
- [serialize](SdfSerializer.md#serialize)

## Constructors

### constructor

• **new SdfSerializer**()

## Methods

### deserialize

▸ **deserialize**(`content`): [`SdfItem`](../interfaces/SdfItem.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |

#### Returns

[`SdfItem`](../interfaces/SdfItem.md)[]

#### Implementation of

[Serializer](../interfaces/Serializer.md).[deserialize](../interfaces/Serializer.md#deserialize)

#### Defined in

[packages/ketcher-core/src/domain/serializers/sdf/sdfSerializer.ts:24](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/sdf/sdfSerializer.ts#L24)

___

### serialize

▸ **serialize**(`sdfItems`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdfItems` | [`SdfItem`](../interfaces/SdfItem.md)[] |

#### Returns

`string`

#### Implementation of

[Serializer](../interfaces/Serializer.md).[serialize](../interfaces/Serializer.md#serialize)

#### Defined in

[packages/ketcher-core/src/domain/serializers/sdf/sdfSerializer.ts:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/sdf/sdfSerializer.ts#L57)
