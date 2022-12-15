[ketcher-core](../README.md) / SmiSerializer

# Class: SmiSerializer

## Implements

- [`Serializer`](../interfaces/Serializer.md)<[`Struct`](Struct.md)\>

## Table of contents

### Constructors

- [constructor](SmiSerializer.md#constructor)

### Properties

- [options](SmiSerializer.md#options)
- [DefaultOptions](SmiSerializer.md#defaultoptions)

### Methods

- [deserialize](SmiSerializer.md#deserialize)
- [serialize](SmiSerializer.md#serialize)

## Constructors

### constructor

• **new SmiSerializer**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Partial`<[`SmiSerializerOptions`](../interfaces/SmiSerializerOptions.md)\> |

#### Defined in

[packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts#L29)

## Properties

### options

• `Private` `Readonly` **options**: [`SmiSerializerOptions`](../interfaces/SmiSerializerOptions.md)

#### Defined in

[packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts#L27)

___

### DefaultOptions

▪ `Static` **DefaultOptions**: [`SmiSerializerOptions`](../interfaces/SmiSerializerOptions.md)

#### Defined in

[packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts#L23)

## Methods

### deserialize

▸ **deserialize**(`_content`): [`Struct`](Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_content` | `string` |

#### Returns

[`Struct`](Struct.md)

#### Implementation of

[Serializer](../interfaces/Serializer.md).[deserialize](../interfaces/Serializer.md#deserialize)

#### Defined in

[packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts#L33)

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

[packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/smi/smiSerializer.ts#L37)
