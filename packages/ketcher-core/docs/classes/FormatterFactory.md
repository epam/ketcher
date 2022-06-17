[ketcher-core](../README.md) / FormatterFactory

# Class: FormatterFactory

## Table of contents

### Constructors

- [constructor](FormatterFactory.md#constructor)

### Properties

- [#structService](FormatterFactory.md##structservice)

### Methods

- [create](FormatterFactory.md#create)
- [separateOptions](FormatterFactory.md#separateoptions)

## Constructors

### constructor

• **new FormatterFactory**(`structService`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `structService` | [`StructService`](../interfaces/StructService.md) |

#### Defined in

[packages/ketcher-core/src/application/formatters/formatterFactory.ts:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatterFactory.ts#L39)

## Properties

### #structService

• `Private` **#structService**: [`StructService`](../interfaces/StructService.md)

#### Defined in

[packages/ketcher-core/src/application/formatters/formatterFactory.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatterFactory.ts#L37)

## Methods

### create

▸ **create**(`format`, `options?`): [`StructFormatter`](../interfaces/StructFormatter.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `format` | [`SupportedFormat`](../README.md#supportedformat) |
| `options?` | `Partial`<[`MolSerializerOptions`](../interfaces/MolSerializerOptions.md) & [`StructServiceOptions`](../interfaces/StructServiceOptions.md)\> |

#### Returns

[`StructFormatter`](../interfaces/StructFormatter.md)

#### Defined in

[packages/ketcher-core/src/application/formatters/formatterFactory.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatterFactory.ts#L65)

___

### separateOptions

▸ `Private` **separateOptions**(`options?`): [`Partial`<[`MolSerializerOptions`](../interfaces/MolSerializerOptions.md)\>, `Partial`<[`StructServiceOptions`](../interfaces/StructServiceOptions.md)\>]

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Partial`<[`MolSerializerOptions`](../interfaces/MolSerializerOptions.md) & [`StructServiceOptions`](../interfaces/StructServiceOptions.md)\> |

#### Returns

[`Partial`<[`MolSerializerOptions`](../interfaces/MolSerializerOptions.md)\>, `Partial`<[`StructServiceOptions`](../interfaces/StructServiceOptions.md)\>]

#### Defined in

[packages/ketcher-core/src/application/formatters/formatterFactory.ts:43](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatterFactory.ts#L43)
