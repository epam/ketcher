[ketcher-core](../README.md) / MolSerializer

# Class: MolSerializer

## Implements

- [`Serializer`](../interfaces/Serializer.md)<[`Struct`](Struct.md)\>

## Table of contents

### Constructors

- [constructor](MolSerializer.md#constructor)

### Properties

- [options](MolSerializer.md#options)
- [DefaultOptions](MolSerializer.md#defaultoptions)

### Methods

- [deserialize](MolSerializer.md#deserialize)
- [serialize](MolSerializer.md#serialize)

## Constructors

### constructor

• **new MolSerializer**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Partial`<[`MolSerializerOptions`](../interfaces/MolSerializerOptions.md)\> |

#### Defined in

[packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts#L33)

## Properties

### options

• `Readonly` **options**: [`MolSerializerOptions`](../interfaces/MolSerializerOptions.md)

#### Defined in

[packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts#L31)

___

### DefaultOptions

▪ `Static` **DefaultOptions**: [`MolSerializerOptions`](../interfaces/MolSerializerOptions.md)

#### Defined in

[packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts#L23)

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

[packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts#L37)

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

[packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/molSerializer.ts#L69)
