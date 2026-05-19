[ketcher-core](../README.md) / Struct

# Class: Struct

## Table of contents

### Constructors

- [constructor](Struct.md#constructor)

### Properties

- [atoms](Struct.md#atoms)
- [bonds](Struct.md#bonds)
- [frags](Struct.md#frags)
- [functionalGroups](Struct.md#functionalgroups)
- [halfBonds](Struct.md#halfbonds)
- [highlights](Struct.md#highlights)
- [isReaction](Struct.md#isreaction)
- [loops](Struct.md#loops)
- [name](Struct.md#name)
- [rgroups](Struct.md#rgroups)
- [rxnArrows](Struct.md#rxnarrows)
- [rxnPluses](Struct.md#rxnpluses)
- [sGroupForest](Struct.md#sgroupforest)
- [sgroups](Struct.md#sgroups)
- [simpleObjects](Struct.md#simpleobjects)
- [texts](Struct.md#texts)

### Methods

- [atomAddNeighbor](Struct.md#atomaddneighbor)
- [atomAddToSGroup](Struct.md#atomaddtosgroup)
- [atomGetNeighbors](Struct.md#atomgetneighbors)
- [atomSetPos](Struct.md#atomsetpos)
- [atomSortNeighbors](Struct.md#atomsortneighbors)
- [atomUpdateHalfBonds](Struct.md#atomupdatehalfbonds)
- [bindSGroupsToFunctionalGroups](Struct.md#bindsgroupstofunctionalgroups)
- [bondInitHalfBonds](Struct.md#bondinithalfbonds)
- [calcConn](Struct.md#calcconn)
- [calcImplicitHydrogen](Struct.md#calcimplicithydrogen)
- [checkBondExists](Struct.md#checkbondexists)
- [clone](Struct.md#clone)
- [defineRxnFragmentTypeForAtomset](Struct.md#definerxnfragmenttypeforatomset)
- [findBondId](Struct.md#findbondid)
- [findConnectedComponent](Struct.md#findconnectedcomponent)
- [findConnectedComponents](Struct.md#findconnectedcomponents)
- [findLoops](Struct.md#findloops)
- [getAvgBondLength](Struct.md#getavgbondlength)
- [getAvgClosestAtomDistance](Struct.md#getavgclosestatomdistance)
- [getBondFragment](Struct.md#getbondfragment)
- [getBondLengthData](Struct.md#getbondlengthdata)
- [getComponents](Struct.md#getcomponents)
- [getCoordBoundingBox](Struct.md#getcoordboundingbox)
- [getCoordBoundingBoxObj](Struct.md#getcoordboundingboxobj)
- [getFragment](Struct.md#getfragment)
- [getFragmentIds](Struct.md#getfragmentids)
- [getScaffold](Struct.md#getscaffold)
- [halfBondAngle](Struct.md#halfbondangle)
- [halfBondSetAngle](Struct.md#halfbondsetangle)
- [halfBondUpdate](Struct.md#halfbondupdate)
- [hasRxnArrow](Struct.md#hasrxnarrow)
- [hasRxnPluses](Struct.md#hasrxnpluses)
- [hasRxnProps](Struct.md#hasrxnprops)
- [initHalfBonds](Struct.md#inithalfbonds)
- [initNeighbors](Struct.md#initneighbors)
- [isBlank](Struct.md#isblank)
- [isRxn](Struct.md#isrxn)
- [loopHasSelfIntersections](Struct.md#loophasselfintersections)
- [loopIsConvex](Struct.md#loopisconvex)
- [loopIsInner](Struct.md#loopisinner)
- [markFragment](Struct.md#markfragment)
- [markFragments](Struct.md#markfragments)
- [mergeInto](Struct.md#mergeinto)
- [partitionLoop](Struct.md#partitionloop)
- [prepareLoopStructure](Struct.md#prepareloopstructure)
- [rescale](Struct.md#rescale)
- [rxnArrowSetPos](Struct.md#rxnarrowsetpos)
- [rxnPlusSetPos](Struct.md#rxnplussetpos)
- [sGroupDelete](Struct.md#sgroupdelete)
- [sGroupsRecalcCrossBonds](Struct.md#sgroupsrecalccrossbonds)
- [scale](Struct.md#scale)
- [setHbNext](Struct.md#sethbnext)
- [setImplicitHydrogen](Struct.md#setimplicithydrogen)
- [simpleObjectSetPos](Struct.md#simpleobjectsetpos)
- [sortNeighbors](Struct.md#sortneighbors)
- [textSetPosition](Struct.md#textsetposition)
- [updateHalfBonds](Struct.md#updatehalfbonds)

## Constructors

### constructor

• **new Struct**()

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:69](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L69)

## Properties

### atoms

• **atoms**: [`Pool`](Pool.md)<[`Atom`](Atom.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:52](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L52)

___

### bonds

• **bonds**: [`Pool`](Pool.md)<[`Bond`](Bond.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:53](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L53)

___

### frags

• **frags**: [`Pool`](Pool.md)<``null`` \| [`Fragment`](Fragment.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L60)

___

### functionalGroups

• **functionalGroups**: [`Pool`](Pool.md)<[`FunctionalGroup`](FunctionalGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:66](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L66)

___

### halfBonds

• **halfBonds**: [`Pool`](Pool.md)<[`HalfBond`](HalfBond.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:55](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L55)

___

### highlights

• **highlights**: [`Pool`](Pool.md)<[`Highlight`](Highlight.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:67](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L67)

___

### isReaction

• **isReaction**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L57)

___

### loops

• **loops**: [`Pool`](Pool.md)<[`Loop`](Loop.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:56](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L56)

___

### name

• **name**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L62)

___

### rgroups

• **rgroups**: [`Pool`](Pool.md)<[`RGroup`](RGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L61)

___

### rxnArrows

• **rxnArrows**: [`Pool`](Pool.md)<[`RxnArrow`](RxnArrow.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:58](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L58)

___

### rxnPluses

• **rxnPluses**: [`Pool`](Pool.md)<[`RxnPlus`](RxnPlus.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L59)

___

### sGroupForest

• **sGroupForest**: [`SGroupForest`](SGroupForest.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L63)

___

### sgroups

• **sgroups**: [`Pool`](Pool.md)<[`SGroup`](SGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L54)

___

### simpleObjects

• **simpleObjects**: [`Pool`](Pool.md)<[`SimpleObject`](SimpleObject.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:64](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L64)

___

### texts

• **texts**: [`Pool`](Pool.md)<[`Text`](Text.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L65)

## Methods

### atomAddNeighbor

▸ **atomAddNeighbor**(`hbid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:410](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L410)

___

### atomAddToSGroup

▸ **atomAddToSGroup**(`sgid`, `aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgid` | `any` |
| `aid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:306](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L306)

___

### atomGetNeighbors

▸ **atomGetNeighbors**(`aid`): `undefined` \| [`Neighbor`](../README.md#neighbor)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `number` |

#### Returns

`undefined` \| [`Neighbor`](../README.md#neighbor)[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:967](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L967)

___

### atomSetPos

▸ **atomSetPos**(`id`, `pp`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pp` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:509](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L509)

___

### atomSortNeighbors

▸ **atomSortNeighbors**(`aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:428](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L428)

___

### atomUpdateHalfBonds

▸ **atomUpdateHalfBonds**(`aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:453](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L453)

___

### bindSGroupsToFunctionalGroups

▸ **bindSGroupsToFunctionalGroups**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1046](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1046)

___

### bondInitHalfBonds

▸ **bondInitHalfBonds**(`bid`, `bond?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bid` | `any` |
| `bond?` | [`Bond`](Bond.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:362](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L362)

___

### calcConn

▸ **calcConn**(`atom`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `atom` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:312](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L312)

___

### calcImplicitHydrogen

▸ **calcImplicitHydrogen**(`aid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:899](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L899)

___

### checkBondExists

▸ **checkBondExists**(`begin`, `end`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `begin` | `number` |
| `end` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:649](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L649)

___

### clone

▸ **clone**(`atomSet?`, `bondSet?`, `dropRxnSymbols?`, `aidMap?`, `simpleObjectsSet?`, `textsSet?`): [`Struct`](Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `atomSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `bondSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `dropRxnSymbols?` | `boolean` |
| `aidMap?` | ``null`` \| `Map`<`number`, `number`\> |
| `simpleObjectsSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `textsSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:117](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L117)

___

### defineRxnFragmentTypeForAtomset

▸ **defineRxnFragmentTypeForAtomset**(`atomset`, `arrowpos`): ``1`` \| ``2``

#### Parameters

| Name | Type |
| :------ | :------ |
| `atomset` | [`Pile`](Pile.md)<`number`\> |
| `arrowpos` | `number` |

#### Returns

``1`` \| ``2``

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1035](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1035)

___

### findBondId

▸ **findBondId**(`begin`, `end`): ``null`` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `begin` | `any` |
| `end` | `any` |

#### Returns

``null`` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:341](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L341)

___

### findConnectedComponent

▸ **findConnectedComponent**(`firstaid`): [`Pile`](Pile.md)<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `firstaid` | `number` |

#### Returns

[`Pile`](Pile.md)<`number`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:659](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L659)

___

### findConnectedComponents

▸ **findConnectedComponents**(`discardExistingFragments?`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `discardExistingFragments?` | `boolean` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:675](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L675)

___

### findLoops

▸ **findLoops**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `bondsToMark` | `number`[] |
| `newLoops` | `any`[] |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:834](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L834)

___

### getAvgBondLength

▸ **getAvgBondLength**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:621](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L621)

___

### getAvgClosestAtomDistance

▸ **getAvgClosestAtomDistance**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:626](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L626)

___

### getBondFragment

▸ **getBondFragment**(`bid`): `undefined` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bid` | `number` |

#### Returns

`undefined` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1041](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1041)

___

### getBondLengthData

▸ **getBondLengthData**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cnt` | `number` |
| `totalLength` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:608](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L608)

___

### getComponents

▸ **getComponents**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `products` | `any`[] |
| `reactants` | `any`[] |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:977](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L977)

___

### getCoordBoundingBox

▸ **getCoordBoundingBox**(`atomSet?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `atomSet?` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:539](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L539)

___

### getCoordBoundingBoxObj

▸ **getCoordBoundingBoxObj**(): `any`

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:588](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L588)

___

### getFragment

▸ **getFragment**(`fid`): [`Struct`](Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fid` | `number` |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:164](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L164)

___

### getFragmentIds

▸ **getFragmentIds**(`fid`): [`Pile`](Pile.md)<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fid` | `number` |

#### Returns

[`Pile`](Pile.md)<`number`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:154](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L154)

___

### getScaffold

▸ **getScaffold**(): [`Struct`](Struct.md)

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:137](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L137)

___

### halfBondAngle

▸ **halfBondAngle**(`hbid1`, `hbid2`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbid1` | `number` |
| `hbid2` | `number` |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:808](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L808)

___

### halfBondSetAngle

▸ **halfBondSetAngle**(`hbid`, `left`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbid` | `any` |
| `left` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:396](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L396)

___

### halfBondUpdate

▸ **halfBondUpdate**(`hbid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:374](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L374)

___

### hasRxnArrow

▸ **hasRxnArrow**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:95](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L95)

___

### hasRxnPluses

▸ **hasRxnPluses**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:99](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L99)

___

### hasRxnProps

▸ **hasRxnProps**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:88](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L88)

___

### initHalfBonds

▸ **initHalfBonds**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:385](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L385)

___

### initNeighbors

▸ **initNeighbors**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:349](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L349)

___

### isBlank

▸ **isBlank**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:107](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L107)

___

### isRxn

▸ **isRxn**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:103](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L103)

___

### loopHasSelfIntersections

▸ **loopHasSelfIntersections**(`hbs`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbs` | `number`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:754](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L754)

___

### loopIsConvex

▸ **loopIsConvex**(`loop`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `loop` | `any`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:814](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L814)

___

### loopIsInner

▸ **loopIsInner**(`loop`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `loop` | `any`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:823](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L823)

___

### markFragment

▸ **markFragment**(`idSet`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `idSet` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:702](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L702)

___

### markFragments

▸ **markFragments**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:713](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L713)

___

### mergeInto

▸ **mergeInto**(`cp`, `atomSet?`, `bondSet?`, `dropRxnSymbols?`, `keepAllRGroups?`, `aidMap?`, `simpleObjectsSet?`, `textsSet?`): [`Struct`](Struct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cp` | [`Struct`](Struct.md) |
| `atomSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `bondSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `dropRxnSymbols?` | `boolean` |
| `keepAllRGroups?` | `boolean` |
| `aidMap?` | ``null`` \| `Map`<`number`, `number`\> |
| `simpleObjectsSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |
| `textsSet?` | ``null`` \| [`Pile`](Pile.md)<`number`\> |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:168](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L168)

___

### partitionLoop

▸ **partitionLoop**(`loop`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `loop` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:777](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L777)

___

### prepareLoopStructure

▸ **prepareLoopStructure**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:298](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L298)

___

### rescale

▸ **rescale**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:740](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L740)

___

### rxnArrowSetPos

▸ **rxnArrowSetPos**(`id`, `pos`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pos` | [`Vec2`](Vec2.md)[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:519](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L519)

___

### rxnPlusSetPos

▸ **rxnPlusSetPos**(`id`, `pp`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pp` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:514](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L514)

___

### sGroupDelete

▸ **sGroupDelete**(`sgid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sgid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:500](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L500)

___

### sGroupsRecalcCrossBonds

▸ **sGroupsRecalcCrossBonds**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:472](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L472)

___

### scale

▸ **scale**(`scale`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `scale` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:720](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L720)

___

### setHbNext

▸ **setHbNext**(`hbid`, `next`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hbid` | `any` |
| `next` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:392](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L392)

___

### setImplicitHydrogen

▸ **setImplicitHydrogen**(`list?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `list?` | `number`[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:947](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L947)

___

### simpleObjectSetPos

▸ **simpleObjectSetPos**(`id`, `pos`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pos` | [`Vec2`](Vec2.md)[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:526](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L526)

___

### sortNeighbors

▸ **sortNeighbors**(`list`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:441](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L441)

___

### textSetPosition

▸ **textSetPosition**(`id`, `position`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `position` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:531](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L531)

___

### updateHalfBonds

▸ **updateHalfBonds**(`list`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:460](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L460)
