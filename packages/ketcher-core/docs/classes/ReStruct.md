[ketcher-core](../README.md) / ReStruct

# Class: ReStruct

## Table of contents

### Constructors

- [constructor](ReStruct.md#constructor)

### Properties

- [atoms](ReStruct.md#atoms)
- [atomsChanged](ReStruct.md#atomschanged)
- [bonds](ReStruct.md#bonds)
- [bondsChanged](ReStruct.md#bondschanged)
- [ccFragmentType](ReStruct.md#ccfragmenttype)
- [connectedComponents](ReStruct.md#connectedcomponents)
- [enhancedFlags](ReStruct.md#enhancedflags)
- [enhancedFlagsChanged](ReStruct.md#enhancedflagschanged)
- [frags](ReStruct.md#frags)
- [initialized](ReStruct.md#initialized)
- [layers](ReStruct.md#layers)
- [molecule](ReStruct.md#molecule)
- [reloops](ReStruct.md#reloops)
- [render](ReStruct.md#render)
- [rgroups](ReStruct.md#rgroups)
- [rxnArrows](ReStruct.md#rxnarrows)
- [rxnArrowsChanged](ReStruct.md#rxnarrowschanged)
- [rxnPluses](ReStruct.md#rxnpluses)
- [rxnPlusesChanged](ReStruct.md#rxnpluseschanged)
- [sgroupData](ReStruct.md#sgroupdata)
- [sgroups](ReStruct.md#sgroups)
- [simpleObjects](ReStruct.md#simpleobjects)
- [simpleObjectsChanged](ReStruct.md#simpleobjectschanged)
- [structChanged](ReStruct.md#structchanged)
- [texts](ReStruct.md#texts)
- [textsChanged](ReStruct.md#textschanged)
- [maps](ReStruct.md#maps)

### Methods

- [addConnectedComponent](ReStruct.md#addconnectedcomponent)
- [addReObjectPath](ReStruct.md#addreobjectpath)
- [assignConnectedComponents](ReStruct.md#assignconnectedcomponents)
- [clearConnectedComponents](ReStruct.md#clearconnectedcomponents)
- [clearMarks](ReStruct.md#clearmarks)
- [clearVisel](ReStruct.md#clearvisel)
- [clearVisels](ReStruct.md#clearvisels)
- [connectedComponentRemoveAtom](ReStruct.md#connectedcomponentremoveatom)
- [eachItem](ReStruct.md#eachitem)
- [getConnectedComponent](ReStruct.md#getconnectedcomponent)
- [getVBoxObj](ReStruct.md#getvboxobj)
- [initLayers](ReStruct.md#initlayers)
- [loopRemove](ReStruct.md#loopremove)
- [markAtom](ReStruct.md#markatom)
- [markBond](ReStruct.md#markbond)
- [markItem](ReStruct.md#markitem)
- [markItemRemoved](ReStruct.md#markitemremoved)
- [removeConnectedComponent](ReStruct.md#removeconnectedcomponent)
- [scale](ReStruct.md#scale)
- [setSelection](ReStruct.md#setselection)
- [showBonds](ReStruct.md#showbonds)
- [showEnhancedFlags](ReStruct.md#showenhancedflags)
- [showFragments](ReStruct.md#showfragments)
- [showItemSelection](ReStruct.md#showitemselection)
- [showLabels](ReStruct.md#showlabels)
- [showLoops](ReStruct.md#showloops)
- [showRGroups](ReStruct.md#showrgroups)
- [showReactionSymbols](ReStruct.md#showreactionsymbols)
- [showSGroups](ReStruct.md#showsgroups)
- [showSimpleObjects](ReStruct.md#showsimpleobjects)
- [showTexts](ReStruct.md#showtexts)
- [translate](ReStruct.md#translate)
- [update](ReStruct.md#update)
- [updateLoops](ReStruct.md#updateloops)
- [verifyLoops](ReStruct.md#verifyloops)

## Constructors

### constructor

• **new ReStruct**(`molecule`, `render`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `molecule` | `any` |
| `render` | [`Render`](Render.md) |

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:86](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L86)

## Properties

### atoms

• **atoms**: `Map`<`number`, [`ReAtom`](ReAtom.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L61)

___

### atomsChanged

• `Private` **atomsChanged**: `Map`<`number`, [`ReAtom`](ReAtom.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:79](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L79)

___

### bonds

• **bonds**: `Map`<`number`, [`ReBond`](ReBond.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L62)

___

### bondsChanged

• `Private` **bondsChanged**: `Map`<`number`, [`ReEnhancedFlag`](ReEnhancedFlag.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:84](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L84)

___

### ccFragmentType

• `Private` **ccFragmentType**: [`Pool`](Pool.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:76](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L76)

___

### connectedComponents

• **connectedComponents**: [`Pool`](Pool.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:75](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L75)

___

### enhancedFlags

• **enhancedFlags**: `Map`<`number`, [`ReEnhancedFlag`](ReEnhancedFlag.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:70](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L70)

___

### enhancedFlagsChanged

• `Private` **enhancedFlagsChanged**: `Map`<`number`, [`ReEnhancedFlag`](ReEnhancedFlag.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:83](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L83)

___

### frags

• **frags**: [`Pool`](Pool.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:66](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L66)

___

### initialized

• `Private` **initialized**: `boolean` = `false`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:73](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L73)

___

### layers

• `Private` **layers**: `any`[] = `[]`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:74](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L74)

___

### molecule

• **molecule**: [`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L60)

___

### reloops

• **reloops**: `Map`<`number`, `ReLoop`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L63)

___

### render

• **render**: [`Render`](Render.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L59)

___

### rgroups

• **rgroups**: [`Pool`](Pool.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:67](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L67)

___

### rxnArrows

• **rxnArrows**: `Map`<`number`, [`ReRxnArrow`](ReRxnArrow.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L65)

___

### rxnArrowsChanged

• `Private` **rxnArrowsChanged**: `Map`<`number`, [`ReRxnArrow`](ReRxnArrow.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:81](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L81)

___

### rxnPluses

• **rxnPluses**: `Map`<`number`, [`ReRxnPlus`](ReRxnPlus.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:64](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L64)

___

### rxnPlusesChanged

• `Private` **rxnPlusesChanged**: `Map`<`number`, [`ReRxnPlus`](ReRxnPlus.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:82](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L82)

___

### sgroupData

• **sgroupData**: `Map`<`number`, `ReDataSGroupData`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L69)

___

### sgroups

• **sgroups**: `Map`<`number`, [`ReSGroup`](ReSGroup.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:68](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L68)

___

### simpleObjects

• `Private` **simpleObjects**: `Map`<`number`, [`ReSimpleObject`](ReSimpleObject.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:71](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L71)

___

### simpleObjectsChanged

• `Private` **simpleObjectsChanged**: `Map`<`number`, [`ReSimpleObject`](ReSimpleObject.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:80](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L80)

___

### structChanged

• `Private` **structChanged**: `boolean` = `false`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:77](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L77)

___

### texts

• **texts**: `Map`<`number`, [`ReText`](ReText.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:72](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L72)

___

### textsChanged

• `Private` **textsChanged**: `Map`<`number`, [`ReText`](ReText.md)\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:85](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L85)

___

### maps

▪ `Static` **maps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `atoms` | typeof [`ReAtom`](ReAtom.md) |
| `bonds` | typeof [`ReBond`](ReBond.md) |
| `enhancedFlags` | typeof [`ReEnhancedFlag`](ReEnhancedFlag.md) |
| `frags` | typeof [`ReFrag`](ReFrag.md) |
| `reloops` | typeof `ReLoop` |
| `rgroups` | typeof [`ReRGroup`](ReRGroup.md) |
| `rxnArrows` | typeof [`ReRxnArrow`](ReRxnArrow.md) |
| `rxnPluses` | typeof [`ReRxnPlus`](ReRxnPlus.md) |
| `sgroupData` | typeof `ReDataSGroupData` |
| `sgroups` | typeof [`ReSGroup`](ReSGroup.md) |
| `simpleObjects` | typeof [`ReSimpleObject`](ReSimpleObject.md) |
| `texts` | typeof [`ReText`](ReText.md) |

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:44](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L44)

## Methods

### addConnectedComponent

▸ **addConnectedComponent**(`idSet`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `idSet` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:185](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L185)

___

### addReObjectPath

▸ **addReObjectPath**(`group`, `visel`, `path`, `pos?`, `visible?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `group` | [`LayerMap`](../enums/LayerMap.md) | `undefined` |
| `visel` | `Visel` | `undefined` |
| `path` | `any` | `undefined` |
| `pos` | ``null`` \| [`Vec2`](Vec2.md) | `null` |
| `visible` | `boolean` | `false` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:243](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L243)

___

### assignConnectedComponents

▸ **assignConnectedComponents**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:216](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L216)

___

### clearConnectedComponents

▸ **clearConnectedComponents**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:153](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L153)

___

### clearMarks

▸ **clearMarks**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:268](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L268)

___

### clearVisel

▸ **clearVisel**(`visel`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `visel` | `Visel` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:298](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L298)

___

### clearVisels

▸ **clearVisels**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:343](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L343)

___

### connectedComponentRemoveAtom

▸ **connectedComponentRemoveAtom**(`aid`, `reAtom?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `number` |
| `reAtom?` | [`ReAtom`](ReAtom.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:142](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L142)

___

### eachItem

▸ **eachItem**(`func`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:305](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L305)

___

### getConnectedComponent

▸ **getConnectedComponent**(`aid`, `adjacentComponents`): [`Pile`](Pile.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `number` \| `number`[] |
| `adjacentComponents` | [`Pile`](Pile.md)<`any`\> |

#### Returns

[`Pile`](Pile.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:160](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L160)

___

### getVBoxObj

▸ **getVBoxObj**(`selection`): ``null`` \| [`Box2Abs`](Box2Abs.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `selection` | `any` |

#### Returns

``null`` \| [`Box2Abs`](Box2Abs.md)

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:311](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L311)

___

### initLayers

▸ **initLayers**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:230](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L230)

___

### loopRemove

▸ **loopRemove**(`loopId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `loopId` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:519](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L519)

___

### markAtom

▸ **markAtom**(`aid`, `mark`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `number` |
| `mark` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:284](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L284)

___

### markBond

▸ **markBond**(`bid`, `mark`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bid` | `number` |
| `mark` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:280](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L280)

___

### markItem

▸ **markItem**(`map`, `id`, `mark`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `map` | `string` |
| `id` | `number` |
| `mark` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:288](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L288)

___

### markItemRemoved

▸ **markItemRemoved**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:276](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L276)

___

### removeConnectedComponent

▸ **removeConnectedComponent**(`ccid`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ccid` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:207](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L207)

___

### scale

▸ **scale**(`s`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:338](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L338)

___

### setSelection

▸ **setSelection**(`selection`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `selection` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:576](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L576)

___

### showBonds

▸ **showBonds**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:566](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L566)

___

### showEnhancedFlags

▸ **showEnhancedFlags**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:557](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L557)

___

### showFragments

▸ **showFragments**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:502](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L502)

___

### showItemSelection

▸ **showItemSelection**(`item`, `selected`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |
| `selected` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:616](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L616)

___

### showLabels

▸ **showLabels**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:547](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L547)

___

### showLoops

▸ **showLoops**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:452](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L452)

___

### showRGroups

▸ **showRGroups**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:512](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L512)

___

### showReactionSymbols

▸ **showReactionSymbols**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:477](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L477)

___

### showSGroups

▸ **showSGroups**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:491](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L491)

___

### showSimpleObjects

▸ **showSimpleObjects**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:459](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L459)

___

### showTexts

▸ **showTexts**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:468](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L468)

___

### translate

▸ **translate**(`d`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:334](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L334)

___

### update

▸ **update**(`force`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `force` | `boolean` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:347](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L347)

___

### updateLoops

▸ **updateLoops**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:439](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L439)

___

### verifyLoops

▸ **verifyLoops**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/application/render/restruct/restruct.ts:541](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/render/restruct/restruct.ts#L541)
