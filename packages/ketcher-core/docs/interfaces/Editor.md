[ketcher-core](../README.md) / Editor

# Interface: Editor

## Table of contents

### Methods

- [clear](Editor.md#clear)
- [isDitrty](Editor.md#isditrty)
- [options](Editor.md#options)
- [redo](Editor.md#redo)
- [selection](Editor.md#selection)
- [setOrigin](Editor.md#setorigin)
- [struct](Editor.md#struct)
- [structSelected](Editor.md#structselected)
- [subscribe](Editor.md#subscribe)
- [undo](Editor.md#undo)
- [unsubscribe](Editor.md#unsubscribe)
- [zoom](Editor.md#zoom)

## Methods

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:49](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L49)

___

### isDitrty

▸ **isDitrty**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:41](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L41)

___

### options

▸ **options**(`value?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value?` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:50](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L50)

___

### redo

▸ **redo**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:48](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L48)

___

### selection

▸ **selection**(`arg?`): ``null`` \| `Selection`

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg?` | ``null`` \| `Selection` \| ``"all"`` |

#### Returns

``null`` \| `Selection`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L46)

___

### setOrigin

▸ **setOrigin**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:42](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L42)

___

### struct

▸ **struct**(`struct?`): [`Struct`](../classes/Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct?` | [`Struct`](../classes/Struct.md) |

#### Returns

[`Struct`](../classes/Struct.md)

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:43](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L43)

___

### structSelected

▸ **structSelected**(): [`Struct`](../classes/Struct.md)

#### Returns

[`Struct`](../classes/Struct.md)

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:52](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L52)

___

### subscribe

▸ **subscribe**(`eventName`, `handler`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `handler` | (`data?`: `any`) => `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L44)

___

### undo

▸ **undo**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:47](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L47)

___

### unsubscribe

▸ **unsubscribe**(`eventName`, `subscriber`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `subscriber` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:45](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L45)

___

### zoom

▸ **zoom**(`value?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value?` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:51](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L51)
