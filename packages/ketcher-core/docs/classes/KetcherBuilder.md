[ketcher-core](../README.md) / KetcherBuilder

# Class: KetcherBuilder

## Table of contents

### Constructors

- [constructor](KetcherBuilder.md#constructor)

### Properties

- [#structServiceProvider](KetcherBuilder.md##structserviceprovider)

### Methods

- [build](KetcherBuilder.md#build)
- [withStructServiceProvider](KetcherBuilder.md#withstructserviceprovider)

## Constructors

### constructor

• **new KetcherBuilder**()

## Properties

### #structServiceProvider

• `Private` `Optional` **#structServiceProvider**: [`StructServiceProvider`](../interfaces/StructServiceProvider.md)

#### Defined in

[packages/ketcher-core/src/application/ketcherBuilder.ts:37](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcherBuilder.ts#L37)

## Methods

### build

▸ **build**(`editor`, `serviceOptions?`): [`Ketcher`](Ketcher.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `editor` | [`Editor`](../interfaces/Editor.md) |
| `serviceOptions?` | [`StructServiceOptions`](../interfaces/StructServiceOptions.md) |

#### Returns

[`Ketcher`](Ketcher.md)

#### Defined in

[packages/ketcher-core/src/application/ketcherBuilder.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcherBuilder.ts#L46)

___

### withStructServiceProvider

▸ **withStructServiceProvider**(`structServiceProvider`): [`KetcherBuilder`](KetcherBuilder.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `structServiceProvider` | [`StructServiceProvider`](../interfaces/StructServiceProvider.md) |

#### Returns

[`KetcherBuilder`](KetcherBuilder.md)

#### Defined in

[packages/ketcher-core/src/application/ketcherBuilder.ts:39](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/ketcherBuilder.ts#L39)
