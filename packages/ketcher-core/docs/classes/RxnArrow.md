[ketcher-core](../README.md) / RxnArrow

# Class: RxnArrow

## Table of contents

### Constructors

- [constructor](RxnArrow.md#constructor)

### Properties

- [height](RxnArrow.md#height)
- [mode](RxnArrow.md#mode)
- [pos](RxnArrow.md#pos)

### Methods

- [center](RxnArrow.md#center)
- [clone](RxnArrow.md#clone)
- [isElliptical](RxnArrow.md#iselliptical)

## Constructors

### constructor

• **new RxnArrow**(`attributes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributes` | [`RxnArrowAttributes`](../interfaces/RxnArrowAttributes.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L59)

## Properties

### height

• `Optional` **height**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:48](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L48)

___

### mode

• **mode**: [`RxnArrowMode`](../enums/RxnArrowMode.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L46)

___

### pos

• **pos**: [`Vec2`](Vec2.md)[]

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:47](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L47)

## Methods

### center

▸ **center**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L80)

___

### clone

▸ **clone**(): [`RxnArrow`](RxnArrow.md)

#### Returns

[`RxnArrow`](RxnArrow.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L76)

___

### isElliptical

▸ `Static` **isElliptical**(`arrow`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `arrow` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/rxnArrow.ts:50](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/rxnArrow.ts#L50)
