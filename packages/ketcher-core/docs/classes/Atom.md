[ketcher-core](../README.md) / Atom

# Class: Atom

## Table of contents

### Constructors

- [constructor](Atom.md#constructor)

### Properties

- [aam](Atom.md#aam)
- [alias](Atom.md#alias)
- [atomList](Atom.md#atomlist)
- [attpnt](Atom.md#attpnt)
- [badConn](Atom.md#badconn)
- [charge](Atom.md#charge)
- [exactChangeFlag](Atom.md#exactchangeflag)
- [explicitValence](Atom.md#explicitvalence)
- [fragment](Atom.md#fragment)
- [hCount](Atom.md#hcount)
- [hasImplicitH](Atom.md#hasimplicith)
- [implicitH](Atom.md#implicith)
- [invRet](Atom.md#invret)
- [isotope](Atom.md#isotope)
- [label](Atom.md#label)
- [neighbors](Atom.md#neighbors)
- [pp](Atom.md#pp)
- [pseudo](Atom.md#pseudo)
- [radical](Atom.md#radical)
- [rglabel](Atom.md#rglabel)
- [ringBondCount](Atom.md#ringbondcount)
- [rxnFragmentType](Atom.md#rxnfragmenttype)
- [sgs](Atom.md#sgs)
- [stereoLabel](Atom.md#stereolabel)
- [stereoParity](Atom.md#stereoparity)
- [substitutionCount](Atom.md#substitutioncount)
- [unsaturatedAtom](Atom.md#unsaturatedatom)
- [valence](Atom.md#valence)
- [PATTERN](Atom.md#pattern)
- [attrlist](Atom.md#attrlist)

### Methods

- [calcValence](Atom.md#calcvalence)
- [calcValenceMinusHyd](Atom.md#calcvalenceminushyd)
- [clone](Atom.md#clone)
- [hasRxnProps](Atom.md#hasrxnprops)
- [isPlainCarbon](Atom.md#isplaincarbon)
- [isPseudo](Atom.md#ispseudo)
- [isQuery](Atom.md#isquery)
- [pureHydrogen](Atom.md#purehydrogen)
- [attrGetDefault](Atom.md#attrgetdefault)
- [getAttrHash](Atom.md#getattrhash)

## Constructors

### constructor

• **new Atom**(`attributes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributes` | [`AtomAttributes`](../interfaces/AtomAttributes.md) |

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:149](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L149)

## Properties

### aam

• **aam**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:140](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L140)

___

### alias

• **alias**: ``null`` \| `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:138](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L138)

___

### atomList

• **atomList**: ``null`` \| [`AtomList`](AtomList.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:122](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L122)

___

### attpnt

• **attpnt**: `any`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:123](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L123)

___

### badConn

• **badConn**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:137](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L137)

___

### charge

• **charge**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:127](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L127)

___

### exactChangeFlag

• **exactChangeFlag**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:142](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L142)

___

### explicitValence

• **explicitValence**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:128](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L128)

___

### fragment

• **fragment**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:121](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L121)

___

### hCount

• **hCount**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:125](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L125)

___

### hasImplicitH

• `Optional` **hasImplicitH**: `boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:146](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L146)

___

### implicitH

• **implicitH**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:133](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L133)

___

### invRet

• **invRet**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:141](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L141)

___

### isotope

• **isotope**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:124](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L124)

___

### label

• **label**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:120](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L120)

___

### neighbors

• **neighbors**: `number`[]

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:135](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L135)

___

### pp

• **pp**: [`Vec2`](Vec2.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:134](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L134)

___

### pseudo

• **pseudo**: `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:147](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L147)

___

### radical

• **radical**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:126](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L126)

___

### rglabel

• **rglabel**: ``null`` \| `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:139](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L139)

___

### ringBondCount

• **ringBondCount**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:129](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L129)

___

### rxnFragmentType

• **rxnFragmentType**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:143](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L143)

___

### sgs

• **sgs**: [`Pile`](Pile.md)<`any`\>

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:136](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L136)

___

### stereoLabel

• `Optional` **stereoLabel**: ``null`` \| `string`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:144](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L144)

___

### stereoParity

• **stereoParity**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:145](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L145)

___

### substitutionCount

• **substitutionCount**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:131](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L131)

___

### unsaturatedAtom

• **unsaturatedAtom**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:130](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L130)

___

### valence

• **valence**: `number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:132](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L132)

___

### PATTERN

▪ `Static` **PATTERN**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `RADICAL` | { `DOUPLET`: `number` = 2; `NONE`: `number` = 0; `SINGLET`: `number` = 1; `TRIPLET`: `number` = 3 } |
| `RADICAL.DOUPLET` | `number` |
| `RADICAL.NONE` | `number` |
| `RADICAL.SINGLET` | `number` |
| `RADICAL.TRIPLET` | `number` |
| `STEREO_PARITY` | { `EITHER`: `number` = 3; `EVEN`: `number` = 2; `NONE`: `number` = 0; `ODD`: `number` = 1 } |
| `STEREO_PARITY.EITHER` | `number` |
| `STEREO_PARITY.EVEN` | `number` |
| `STEREO_PARITY.NONE` | `number` |
| `STEREO_PARITY.ODD` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:82](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L82)

___

### attrlist

▪ `Static` **attrlist**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `aam` | `number` |
| `alias` | ``null`` |
| `atomList` | ``null`` |
| `attpnt` | ``null`` |
| `charge` | `number` |
| `exactChangeFlag` | `number` |
| `explicitValence` | `number` |
| `hCount` | `number` |
| `invRet` | `number` |
| `isotope` | `number` |
| `label` | `string` |
| `radical` | `number` |
| `rglabel` | ``null`` |
| `ringBondCount` | `number` |
| `stereoLabel` | ``null`` |
| `stereoParity` | `number` |
| `substitutionCount` | `number` |
| `unsaturatedAtom` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:98](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L98)

## Methods

### calcValence

▸ **calcValence**(`conn`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:281](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L281)

___

### calcValenceMinusHyd

▸ **calcValenceMinusHyd**(`conn`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | `number` |

#### Returns

`number`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:507](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L507)

___

### clone

▸ **clone**(`fidMap`): [`Atom`](Atom.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fidMap` | `Map`<`number`, `number`\> |

#### Returns

[`Atom`](Atom.md)

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:234](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L234)

___

### hasRxnProps

▸ **hasRxnProps**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:272](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L272)

___

### isPlainCarbon

▸ **isPlainCarbon**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:252](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L252)

___

### isPseudo

▸ **isPseudo**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:267](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L267)

___

### isQuery

▸ **isQuery**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:242](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L242)

___

### pureHydrogen

▸ **pureHydrogen**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:248](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L248)

___

### attrGetDefault

▸ `Static` **attrGetDefault**(`attr`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attr` | `string` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:228](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L228)

___

### getAttrHash

▸ `Static` **getAttrHash**(`atom`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `atom` | [`Atom`](Atom.md) |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:220](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L220)
