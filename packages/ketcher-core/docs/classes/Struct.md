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
- [CalcImplicitHydrogenydrogen](Struct.md#CalcImplicitHydrogenydrogen)
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

---

### bonds

• **bonds**: [`Pool`](Pool.md)<[`Bond`](Bond.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:53](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L53)

---

### frags

• **frags**: [`Pool`](Pool.md)<`null` \| [`Fragment`](Fragment.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:60](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L60)

---

### functionalGroups

• **functionalGroups**: [`Pool`](Pool.md)<[`FunctionalGroup`](FunctionalGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:66](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L66)

---

### halfBonds

• **halfBonds**: [`Pool`](Pool.md)<[`HalfBond`](HalfBond.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:55](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L55)

---

### highlights

• **highlights**: [`Pool`](Pool.md)<[`Highlight`](Highlight.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:67](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L67)

---

### isReaction

• **isReaction**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:57](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L57)

---

### loops

• **loops**: [`Pool`](Pool.md)<[`Loop`](Loop.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:56](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L56)

---

### name

• **name**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L62)

---

### rgroups

• **rgroups**: [`Pool`](Pool.md)<[`RGroup`](RGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:61](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L61)

---

### rxnArrows

• **rxnArrows**: [`Pool`](Pool.md)<[`RxnArrow`](RxnArrow.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:58](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L58)

---

### rxnPluses

• **rxnPluses**: [`Pool`](Pool.md)<[`RxnPlus`](RxnPlus.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:59](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L59)

---

### sGroupForest

• **sGroupForest**: [`SGroupForest`](SGroupForest.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:63](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L63)

---

### sgroups

• **sgroups**: [`Pool`](Pool.md)<[`SGroup`](SGroup.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:54](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L54)

---

### simpleObjects

• **simpleObjects**: [`Pool`](Pool.md)<[`SimpleObject`](SimpleObject.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:64](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L64)

---

### texts

• **texts**: [`Pool`](Pool.md)<[`Text`](Text.md)\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:65](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L65)

## Methods

### atomAddNeighbor

▸ **atomAddNeighbor**(`hbid`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `hbid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:410](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L410)

---

### atomAddToSGroup

▸ **atomAddToSGroup**(`sgid`, `aid`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `sgid` | `any` |
| `aid`  | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:306](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L306)

---

### atomGetNeighbors

▸ **atomGetNeighbors**(`aid`): `undefined` \| [`Neighbor`](../README.md#neighbor)[]

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `aid` | `number` |

#### Returns

`undefined` \| [`Neighbor`](../README.md#neighbor)[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:967](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L967)

---

### atomSetPos

▸ **atomSetPos**(`id`, `pp`): `void`

#### Parameters

| Name | Type              |
| :--- | :---------------- |
| `id` | `number`          |
| `pp` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:509](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L509)

---

### atomSortNeighbors

▸ **atomSortNeighbors**(`aid`): `void`

#### Parameters

| Name  | Type  |
| :---- | :---- |
| `aid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:428](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L428)

---

### atomUpdateHalfBonds

▸ **atomUpdateHalfBonds**(`aid`): `void`

#### Parameters

| Name  | Type  |
| :---- | :---- |
| `aid` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:453](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L453)

---

### bindSGroupsToFunctionalGroups

▸ **bindSGroupsToFunctionalGroups**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1046](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1046)

---

### bondInitHalfBonds

▸ **bondInitHalfBonds**(`bid`, `bond?`): `void`

#### Parameters

| Name    | Type              |
| :------ | :---------------- |
| `bid`   | `any`             |
| `bond?` | [`Bond`](Bond.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:362](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L362)

---

### calcConn

▸ **calcConn**(`atom`): `any`[]

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `atom` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:312](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L312)

---

### CalcImplicitHydrogenydrogen

▸ **CalcImplicitHydrogenydrogen**(`aid`): `void`

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `aid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:899](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L899)

---

### checkBondExists

▸ **checkBondExists**(`begin`, `end`): `boolean`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `begin` | `number` |
| `end`   | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:649](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L649)

---

### clone

▸ **clone**(`atomSet?`, `bondSet?`, `dropRxnSymbols?`, `aidMap?`, `simpleObjectsSet?`, `textsSet?`): [`Struct`](Struct.md)

#### Parameters

| Name                | Type                                   |
| :------------------ | :------------------------------------- |
| `atomSet?`          | `null` \| [`Pile`](Pile.md)<`number`\> |
| `bondSet?`          | `null` \| [`Pile`](Pile.md)<`number`\> |
| `dropRxnSymbols?`   | `boolean`                              |
| `aidMap?`           | `null` \| `Map`<`number`, `number`\>   |
| `simpleObjectsSet?` | `null` \| [`Pile`](Pile.md)<`number`\> |
| `textsSet?`         | `null` \| [`Pile`](Pile.md)<`number`\> |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:117](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L117)

---

### defineRxnFragmentTypeForAtomset

▸ **defineRxnFragmentTypeForAtomset**(`atomset`, `arrowpos`): `1` \| `2`

#### Parameters

| Name       | Type                         |
| :--------- | :--------------------------- |
| `atomset`  | [`Pile`](Pile.md)<`number`\> |
| `arrowpos` | `number`                     |

#### Returns

`1` \| `2`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1035](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1035)

---

### findBondId

▸ **findBondId**(`begin`, `end`): `null` \| `number`

#### Parameters

| Name    | Type  |
| :------ | :---- |
| `begin` | `any` |
| `end`   | `any` |

#### Returns

`null` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:341](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L341)

---

### findConnectedComponent

▸ **findConnectedComponent**(`firstaid`): [`Pile`](Pile.md)<`number`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `firstaid` | `number` |

#### Returns

[`Pile`](Pile.md)<`number`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:659](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L659)

---

### findConnectedComponents

▸ **findConnectedComponents**(`discardExistingFragments?`): `any`[]

#### Parameters

| Name                        | Type      |
| :-------------------------- | :-------- |
| `discardExistingFragments?` | `boolean` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:675](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L675)

---

### findLoops

▸ **findLoops**(): `Object`

#### Returns

`Object`

| Name          | Type       |
| :------------ | :--------- |
| `bondsToMark` | `number`[] |
| `newLoops`    | `any`[]    |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:834](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L834)

---

### getAvgBondLength

▸ **getAvgBondLength**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:621](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L621)

---

### getAvgClosestAtomDistance

▸ **getAvgClosestAtomDistance**(): `number`

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:626](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L626)

---

### getBondFragment

▸ **getBondFragment**(`bid`): `undefined` \| `number`

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `bid` | `number` |

#### Returns

`undefined` \| `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:1041](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L1041)

---

### getBondLengthData

▸ **getBondLengthData**(): `Object`

#### Returns

`Object`

| Name          | Type     |
| :------------ | :------- |
| `cnt`         | `number` |
| `totalLength` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:608](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L608)

---

### getComponents

▸ **getComponents**(): `Object`

#### Returns

`Object`

| Name        | Type    |
| :---------- | :------ |
| `products`  | `any`[] |
| `reactants` | `any`[] |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:977](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L977)

---

### getCoordBoundingBox

▸ **getCoordBoundingBox**(`atomSet?`): `any`

#### Parameters

| Name       | Type                         |
| :--------- | :--------------------------- |
| `atomSet?` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:539](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L539)

---

### getCoordBoundingBoxObj

▸ **getCoordBoundingBoxObj**(): `any`

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:588](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L588)

---

### getFragment

▸ **getFragment**(`fid`): [`Struct`](Struct.md)

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `fid` | `number` |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:164](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L164)

---

### getFragmentIds

▸ **getFragmentIds**(`fid`): [`Pile`](Pile.md)<`number`\>

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `fid` | `number` |

#### Returns

[`Pile`](Pile.md)<`number`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:154](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L154)

---

### getScaffold

▸ **getScaffold**(): [`Struct`](Struct.md)

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:137](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L137)

---

### halfBondAngle

▸ **halfBondAngle**(`hbid1`, `hbid2`): `number`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `hbid1` | `number` |
| `hbid2` | `number` |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:808](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L808)

---

### halfBondSetAngle

▸ **halfBondSetAngle**(`hbid`, `left`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `hbid` | `any` |
| `left` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:396](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L396)

---

### halfBondUpdate

▸ **halfBondUpdate**(`hbid`): `void`

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `hbid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:374](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L374)

---

### hasRxnArrow

▸ **hasRxnArrow**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:95](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L95)

---

### hasRxnPluses

▸ **hasRxnPluses**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:99](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L99)

---

### hasRxnProps

▸ **hasRxnProps**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:88](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L88)

---

### initHalfBonds

▸ **initHalfBonds**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:385](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L385)

---

### initNeighbors

▸ **initNeighbors**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:349](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L349)

---

### isBlank

▸ **isBlank**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:107](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L107)

---

### isRxn

▸ **isRxn**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:103](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L103)

---

### loopHasSelfIntersections

▸ **loopHasSelfIntersections**(`hbs`): `boolean`

#### Parameters

| Name  | Type       |
| :---- | :--------- |
| `hbs` | `number`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:754](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L754)

---

### loopIsConvex

▸ **loopIsConvex**(`loop`): `boolean`

#### Parameters

| Name   | Type    |
| :----- | :------ |
| `loop` | `any`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:814](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L814)

---

### loopIsInner

▸ **loopIsInner**(`loop`): `boolean`

#### Parameters

| Name   | Type    |
| :----- | :------ |
| `loop` | `any`[] |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:823](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L823)

---

### markFragment

▸ **markFragment**(`idSet`): `void`

#### Parameters

| Name    | Type                         |
| :------ | :--------------------------- |
| `idSet` | [`Pile`](Pile.md)<`number`\> |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:702](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L702)

---

### markFragments

▸ **markFragments**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:713](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L713)

---

### mergeInto

▸ **mergeInto**(`cp`, `atomSet?`, `bondSet?`, `dropRxnSymbols?`, `keepAllRGroups?`, `aidMap?`, `simpleObjectsSet?`, `textsSet?`): [`Struct`](Struct.md)

#### Parameters

| Name                | Type                                   |
| :------------------ | :------------------------------------- |
| `cp`                | [`Struct`](Struct.md)                  |
| `atomSet?`          | `null` \| [`Pile`](Pile.md)<`number`\> |
| `bondSet?`          | `null` \| [`Pile`](Pile.md)<`number`\> |
| `dropRxnSymbols?`   | `boolean`                              |
| `keepAllRGroups?`   | `boolean`                              |
| `aidMap?`           | `null` \| `Map`<`number`, `number`\>   |
| `simpleObjectsSet?` | `null` \| [`Pile`](Pile.md)<`number`\> |
| `textsSet?`         | `null` \| [`Pile`](Pile.md)<`number`\> |

#### Returns

[`Struct`](Struct.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:168](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L168)

---

### partitionLoop

▸ **partitionLoop**(`loop`): `any`[]

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `loop` | `any` |

#### Returns

`any`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:777](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L777)

---

### prepareLoopStructure

▸ **prepareLoopStructure**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:298](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L298)

---

### rescale

▸ **rescale**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:740](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L740)

---

### rxnArrowSetPos

▸ **rxnArrowSetPos**(`id`, `pos`): `void`

#### Parameters

| Name  | Type                |
| :---- | :------------------ |
| `id`  | `number`            |
| `pos` | [`Vec2`](Vec2.md)[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:519](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L519)

---

### rxnPlusSetPos

▸ **rxnPlusSetPos**(`id`, `pp`): `void`

#### Parameters

| Name | Type              |
| :--- | :---------------- |
| `id` | `number`          |
| `pp` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:514](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L514)

---

### sGroupDelete

▸ **sGroupDelete**(`sgid`): `void`

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `sgid` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:500](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L500)

---

### sGroupsRecalcCrossBonds

▸ **sGroupsRecalcCrossBonds**(): `void`

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:472](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L472)

---

### scale

▸ **scale**(`scale`): `void`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `scale` | `number` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:720](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L720)

---

### setHbNext

▸ **setHbNext**(`hbid`, `next`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `hbid` | `any` |
| `next` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:392](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L392)

---

### setImplicitHydrogen

▸ **setImplicitHydrogen**(`list?`): `void`

#### Parameters

| Name    | Type       |
| :------ | :--------- |
| `list?` | `number`[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:947](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L947)

---

### simpleObjectSetPos

▸ **simpleObjectSetPos**(`id`, `pos`): `void`

#### Parameters

| Name  | Type                |
| :---- | :------------------ |
| `id`  | `number`            |
| `pos` | [`Vec2`](Vec2.md)[] |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:526](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L526)

---

### sortNeighbors

▸ **sortNeighbors**(`list`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `list` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:441](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L441)

---

### textSetPosition

▸ **textSetPosition**(`id`, `position`): `void`

#### Parameters

| Name       | Type              |
| :--------- | :---------------- |
| `id`       | `number`          |
| `position` | [`Vec2`](Vec2.md) |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:531](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L531)

---

### updateHalfBonds

▸ **updateHalfBonds**(`list`): `void`

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `list` | `any` |

#### Returns

`void`

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:460](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L460)
