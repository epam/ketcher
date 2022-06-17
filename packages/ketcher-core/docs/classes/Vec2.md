[ketcher-core](../README.md) / Vec2

# Class: Vec2

## Table of contents

### Constructors

- [constructor](Vec2.md#constructor)

### Properties

- [x](Vec2.md#x)
- [y](Vec2.md#y)
- [z](Vec2.md#z)
- [UNIT](Vec2.md#unit)
- [ZERO](Vec2.md#zero)

### Methods

- [add](Vec2.md#add)
- [addScaled](Vec2.md#addscaled)
- [add\_](Vec2.md#add_)
- [ceil](Vec2.md#ceil)
- [coordStr](Vec2.md#coordstr)
- [equals](Vec2.md#equals)
- [floor](Vec2.md#floor)
- [get\_xy0](Vec2.md#get_xy0)
- [length](Vec2.md#length)
- [max](Vec2.md#max)
- [min](Vec2.md#min)
- [negated](Vec2.md#negated)
- [normalize](Vec2.md#normalize)
- [normalized](Vec2.md#normalized)
- [oxAngle](Vec2.md#oxangle)
- [rotate](Vec2.md#rotate)
- [rotateSC](Vec2.md#rotatesc)
- [scaled](Vec2.md#scaled)
- [sub](Vec2.md#sub)
- [toString](Vec2.md#tostring)
- [turnLeft](Vec2.md#turnleft)
- [yComplement](Vec2.md#ycomplement)
- [angle](Vec2.md#angle)
- [centre](Vec2.md#centre)
- [cross](Vec2.md#cross)
- [diff](Vec2.md#diff)
- [dist](Vec2.md#dist)
- [dot](Vec2.md#dot)
- [lc](Vec2.md#lc)
- [lc2](Vec2.md#lc2)
- [max](Vec2.md#max-1)
- [min](Vec2.md#min-1)
- [sum](Vec2.md#sum)

## Constructors

### constructor

• **new Vec2**(`point`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](../interfaces/Point.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L32)

• **new Vec2**(`x?`, `y?`, `z?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x?` | `number` |
| `y?` | `number` |
| `z?` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:33](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L33)

## Properties

### x

• **x**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:28](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L28)

___

### y

• **y**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:29](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L29)

___

### z

• **z**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:30](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L30)

___

### UNIT

▪ `Static` **UNIT**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L26)

___

### ZERO

▪ `Static` **ZERO**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L25)

## Methods

### add

▸ **add**(`v`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:126](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L126)

___

### addScaled

▸ **addScaled**(`v`, `f`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |
| `f` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:157](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L157)

___

### add\_

▸ **add_**(`v`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:130](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L130)

___

### ceil

▸ **ceil**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:198](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L198)

___

### coordStr

▸ **coordStr**(): `string`

#### Returns

`string`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:180](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L180)

___

### equals

▸ **equals**(`v`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:122](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L122)

___

### floor

▸ **floor**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:202](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L202)

___

### get\_xy0

▸ **get_xy0**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:136](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L136)

___

### length

▸ **length**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:118](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L118)

___

### max

▸ **max**(`v`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:188](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L188)

___

### min

▸ **min**(`v`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:194](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L194)

___

### negated

▸ **negated**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:148](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L148)

___

### normalize

▸ **normalize**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:165](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L165)

___

### normalized

▸ **normalized**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:161](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L161)

___

### oxAngle

▸ **oxAngle**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:224](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L224)

___

### rotate

▸ **rotate**(`angle`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:206](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L206)

___

### rotateSC

▸ **rotateSC**(`sin`, `cos`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sin` | `number` |
| `cos` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:213](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L213)

___

### scaled

▸ **scaled**(`s`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:144](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L144)

___

### sub

▸ **sub**(`v`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:140](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L140)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:184](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L184)

___

### turnLeft

▸ **turnLeft**(): [`Vec2`](Vec2.md)

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:176](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L176)

___

### yComplement

▸ **yComplement**(`y1`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `y1` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:152](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L152)

___

### angle

▸ `Static` **angle**(`v1`, `v2`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:88](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L88)

___

### centre

▸ `Static` **centre**(`v1`, `v2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:114](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L114)

___

### cross

▸ `Static` **cross**(`v1`, `v2`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:84](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L84)

___

### diff

▸ `Static` **diff**(`v1`, `v2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:92](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L92)

___

### dist

▸ `Static` **dist**(`a`, `b`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`Vec2`](Vec2.md) |
| `b` | [`Vec2`](Vec2.md) |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:56](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L56)

___

### dot

▸ `Static` **dot**(`v1`, `v2`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L80)

___

### lc

▸ `Static` **lc**(...`args`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | (`number` \| [`Vec2`](Vec2.md))[] |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:98](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L98)

___

### lc2

▸ `Static` **lc2**(`v1`, `f1`, `v2`, `f2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `f1` | `number` |
| `v2` | [`Vec2`](Vec2.md) |
| `f2` | `number` |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:106](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L106)

___

### max

▸ `Static` **max**(`v1`, `v2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L60)

___

### min

▸ `Static` **min**(`v1`, `v2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:68](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L68)

___

### sum

▸ `Static` **sum**(`v1`, `v2`): [`Vec2`](Vec2.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | [`Vec2`](Vec2.md) |
| `v2` | [`Vec2`](Vec2.md) |

#### Returns

[`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/vec2.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/vec2.ts#L76)
