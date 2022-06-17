[ketcher-core](../README.md) / EditorHistory

# Interface: EditorHistory

## Table of contents

### Properties

- [current](EditorHistory.md#current)
- [length](EditorHistory.md#length)

### Methods

- [pop](EditorHistory.md#pop)
- [push](EditorHistory.md#push)

## Properties

### current

• `Optional` `Readonly` **current**: `number`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:21](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L21)

___

### length

• `Readonly` **length**: `number`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:22](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L22)

## Methods

### pop

▸ **pop**(): `Action`

#### Returns

`Action`

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:24](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L24)

___

### push

▸ **push**(`action`): [`EditorHistory`](EditorHistory.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `Action` |

#### Returns

[`EditorHistory`](EditorHistory.md)

#### Defined in

[packages/ketcher-core/src/application/editor/editor.types.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/editor.types.ts#L23)
