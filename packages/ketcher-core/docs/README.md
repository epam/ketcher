ketcher-core

# ketcher-core

## Table of contents

### Enumerations

- [ChemicalMimeType](enums/ChemicalMimeType.md)
- [LayerMap](enums/LayerMap.md)
- [RxnArrowMode](enums/RxnArrowMode.md)
- [SimpleObjectMode](enums/SimpleObjectMode.md)
- [StereLabelStyleType](enums/StereLabelStyleType.md)
- [StereoColoringType](enums/StereoColoringType.md)
- [StereoFlag](enums/StereoFlag.md)
- [StereoLabel](enums/StereoLabel.md)
- [TextCommand](enums/TextCommand.md)

### Classes

- [Atom](classes/Atom.md)
- [AtomList](classes/AtomList.md)
- [Bond](classes/Bond.md)
- [Box2Abs](classes/Box2Abs.md)
- [FormatterFactory](classes/FormatterFactory.md)
- [Fragment](classes/Fragment.md)
- [FunctionalGroup](classes/FunctionalGroup.md)
- [FunctionalGroupsProvider](classes/FunctionalGroupsProvider.md)
- [HalfBond](classes/HalfBond.md)
- [Highlight](classes/Highlight.md)
- [KetSerializer](classes/KetSerializer.md)
- [Ketcher](classes/Ketcher.md)
- [KetcherBuilder](classes/KetcherBuilder.md)
- [Loop](classes/Loop.md)
- [MolSerializer](classes/MolSerializer.md)
- [Pile](classes/Pile.md)
- [Pool](classes/Pool.md)
- [RGroup](classes/RGroup.md)
- [ReAtom](classes/ReAtom.md)
- [ReBond](classes/ReBond.md)
- [ReEnhancedFlag](classes/ReEnhancedFlag.md)
- [ReFrag](classes/ReFrag.md)
- [ReRGroup](classes/ReRGroup.md)
- [ReRxnArrow](classes/ReRxnArrow.md)
- [ReRxnPlus](classes/ReRxnPlus.md)
- [ReSGroup](classes/ReSGroup.md)
- [ReSimpleObject](classes/ReSimpleObject.md)
- [ReStruct](classes/ReStruct.md)
- [ReText](classes/ReText.md)
- [RemoteStructService](classes/RemoteStructService.md)
- [RemoteStructServiceProvider](classes/RemoteStructServiceProvider.md)
- [Render](classes/Render.md)
- [RxnArrow](classes/RxnArrow.md)
- [RxnPlus](classes/RxnPlus.md)
- [SGroup](classes/SGroup.md)
- [SGroupBracketParams](classes/SGroupBracketParams.md)
- [SGroupForest](classes/SGroupForest.md)
- [SdfSerializer](classes/SdfSerializer.md)
- [SimpleObject](classes/SimpleObject.md)
- [SmiSerializer](classes/SmiSerializer.md)
- [Struct](classes/Struct.md)
- [Text](classes/Text.md)
- [Vec2](classes/Vec2.md)

### Interfaces

- [AromatizeData](interfaces/AromatizeData.md)
- [AromatizeResult](interfaces/AromatizeResult.md)
- [AtomAttributes](interfaces/AtomAttributes.md)
- [AtomListParams](interfaces/AtomListParams.md)
- [AutomapData](interfaces/AutomapData.md)
- [AutomapResult](interfaces/AutomapResult.md)
- [BondAttributes](interfaces/BondAttributes.md)
- [CalculateCipData](interfaces/CalculateCipData.md)
- [CalculateCipResult](interfaces/CalculateCipResult.md)
- [CalculateData](interfaces/CalculateData.md)
- [CheckData](interfaces/CheckData.md)
- [CheckResult](interfaces/CheckResult.md)
- [CleanData](interfaces/CleanData.md)
- [CleanResult](interfaces/CleanResult.md)
- [ConvertData](interfaces/ConvertData.md)
- [ConvertResult](interfaces/ConvertResult.md)
- [DearomatizeData](interfaces/DearomatizeData.md)
- [DearomatizeResult](interfaces/DearomatizeResult.md)
- [Editor](interfaces/Editor.md)
- [Element](interfaces/Element.md)
- [GenerateImageOptions](interfaces/GenerateImageOptions.md)
- [HighlightAttributes](interfaces/HighlightAttributes.md)
- [InfoResult](interfaces/InfoResult.md)
- [LayoutData](interfaces/LayoutData.md)
- [LayoutResult](interfaces/LayoutResult.md)
- [MolSerializerOptions](interfaces/MolSerializerOptions.md)
- [Point](interfaces/Point.md)
- [RGroupAttributes](interfaces/RGroupAttributes.md)
- [RecognizeResult](interfaces/RecognizeResult.md)
- [Renderer](interfaces/Renderer.md)
- [RxnArrowAttributes](interfaces/RxnArrowAttributes.md)
- [RxnPlusAttributes](interfaces/RxnPlusAttributes.md)
- [ScaleOptions](interfaces/ScaleOptions.md)
- [SdfItem](interfaces/SdfItem.md)
- [Serializer](interfaces/Serializer.md)
- [SimpleObjectAttributes](interfaces/SimpleObjectAttributes.md)
- [SmiSerializerOptions](interfaces/SmiSerializerOptions.md)
- [StructAssociatedData](interfaces/StructAssociatedData.md)
- [StructFormatter](interfaces/StructFormatter.md)
- [StructService](interfaces/StructService.md)
- [StructServiceOptions](interfaces/StructServiceOptions.md)
- [StructServiceProvider](interfaces/StructServiceProvider.md)
- [TextAttributes](interfaces/TextAttributes.md)
- [WithFormat](interfaces/WithFormat.md)
- [WithOutputFormat](interfaces/WithOutputFormat.md)
- [WithSelection](interfaces/WithSelection.md)
- [WithStruct](interfaces/WithStruct.md)

### Type Aliases

- [AutomapMode](README.md#automapmode)
- [CalculateProps](README.md#calculateprops)
- [CalculateResult](README.md#calculateresult)
- [CheckTypes](README.md#checktypes)
- [ElementLabel](README.md#elementlabel)
- [FormatterFactoryOptions](README.md#formatterfactoryoptions)
- [GenGroup](README.md#gengroup)
- [GenItem](README.md#genitem)
- [GenItemSet](README.md#genitemset)
- [GenericsType](README.md#genericstype)
- [Group](README.md#group)
- [MolfileFormat](README.md#molfileformat)
- [Neighbor](README.md#neighbor)
- [OutputFormatType](README.md#outputformattype)
- [Period](README.md#period)
- [ServiceMode](README.md#servicemode)
- [SupportedFormat](README.md#supportedformat)

### Variables

- [ElementColor](README.md#elementcolor)
- [Elements](README.md#elements)
- [Generics](README.md#generics)
- [Scale](README.md#scale)
- [SgContexts](README.md#sgcontexts)
- [StereoValidator](README.md#stereovalidator)
- [formatProperties](README.md#formatproperties)

### Functions

- [checkOverlapping](README.md#checkoverlapping)
- [getPropertiesByFormat](README.md#getpropertiesbyformat)
- [getPropertiesByImgFormat](README.md#getpropertiesbyimgformat)
- [identifyStructFormat](README.md#identifystructformat)
- [radicalElectrons](README.md#radicalelectrons)

## Type Aliases

### AutomapMode

Ƭ **AutomapMode**: ``"discard"`` \| ``"keep"`` \| ``"alter"`` \| ``"clear"``

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:107](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L107)

___

### CalculateProps

Ƭ **CalculateProps**: ``"molecular-weight"`` \| ``"most-abundant-mass"`` \| ``"monoisotopic-mass"`` \| ``"gross"`` \| ``"mass-composition"``

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:94](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L94)

___

### CalculateResult

Ƭ **CalculateResult**: `Record`<[`CalculateProps`](README.md#calculateprops), `string` \| `number` \| `boolean`\>

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:105](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L105)

___

### CheckTypes

Ƭ **CheckTypes**: ``"radicals"`` \| ``"pseudoatoms"`` \| ``"stereo"`` \| ``"query"`` \| ``"overlapping_atoms"`` \| ``"overlapping_bonds"`` \| ``"rgroups"`` \| ``"chiral"`` \| ``"3d"`` \| ``"chiral_flag"`` \| ``"valence"``

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:46](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L46)

___

### ElementLabel

Ƭ **ElementLabel**: ``"H"`` \| ``"He"`` \| ``"Li"`` \| ``"Be"`` \| ``"B"`` \| ``"C"`` \| ``"N"`` \| ``"O"`` \| ``"F"`` \| ``"Ne"`` \| ``"Na"`` \| ``"Mg"`` \| ``"Al"`` \| ``"Si"`` \| ``"P"`` \| ``"S"`` \| ``"Cl"`` \| ``"Ar"`` \| ``"K"`` \| ``"Ca"`` \| ``"Sc"`` \| ``"Ti"`` \| ``"V"`` \| ``"Cr"`` \| ``"Mn"`` \| ``"Fe"`` \| ``"Co"`` \| ``"Ni"`` \| ``"Cu"`` \| ``"Zn"`` \| ``"Ga"`` \| ``"Ge"`` \| ``"As"`` \| ``"Se"`` \| ``"Br"`` \| ``"Kr"`` \| ``"Rb"`` \| ``"Sr"`` \| ``"Y"`` \| ``"Zr"`` \| ``"Nb"`` \| ``"Mo"`` \| ``"Tc"`` \| ``"Ru"`` \| ``"Rh"`` \| ``"Pd"`` \| ``"Ag"`` \| ``"Cd"`` \| ``"In"`` \| ``"Sn"`` \| ``"Sb"`` \| ``"Te"`` \| ``"I"`` \| ``"Xe"`` \| ``"Cs"`` \| ``"Ba"`` \| ``"La"`` \| ``"Ce"`` \| ``"Pr"`` \| ``"Nd"`` \| ``"Pm"`` \| ``"Sm"`` \| ``"Eu"`` \| ``"Gd"`` \| ``"Tb"`` \| ``"Dy"`` \| ``"Ho"`` \| ``"Er"`` \| ``"Tm"`` \| ``"Yb"`` \| ``"Lu"`` \| ``"Hf"`` \| ``"Ta"`` \| ``"W"`` \| ``"Re"`` \| ``"Os"`` \| ``"Ir"`` \| ``"Pt"`` \| ``"Au"`` \| ``"Hg"`` \| ``"Tl"`` \| ``"Pb"`` \| ``"Bi"`` \| ``"Po"`` \| ``"At"`` \| ``"Rn"`` \| ``"Fr"`` \| ``"Ra"`` \| ``"Ac"`` \| ``"Th"`` \| ``"Pa"`` \| ``"U"`` \| ``"Np"`` \| ``"Pu"`` \| ``"Am"`` \| ``"Cm"`` \| ``"Bk"`` \| ``"Cf"`` \| ``"Es"`` \| ``"Fm"`` \| ``"Md"`` \| ``"No"`` \| ``"Lr"`` \| ``"Rf"`` \| ``"Db"`` \| ``"Sg"`` \| ``"Bh"`` \| ``"Hs"`` \| ``"Mt"`` \| ``"Ds"`` \| ``"Rg"`` \| ``"Cn"`` \| ``"Nh"`` \| ``"Fl"`` \| ``"Mc"`` \| ``"Lv"`` \| ``"Ts"`` \| ``"Og"``

Copyright 2021 EPAM Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

#### Defined in

[packages/ketcher-core/src/domain/constants/element.types.ts:17](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/element.types.ts#L17)

___

### FormatterFactoryOptions

Ƭ **FormatterFactoryOptions**: `Partial`<[`MolSerializerOptions`](interfaces/MolSerializerOptions.md) & [`StructServiceOptions`](interfaces/StructServiceOptions.md)\>

#### Defined in

[packages/ketcher-core/src/application/formatters/structFormatter.types.ts:40](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/structFormatter.types.ts#L40)

___

### GenGroup

Ƭ **GenGroup**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `itemSets` | [`GenItemSet`](README.md#genitemset)[] |
| `title` | `string` |

#### Defined in

[packages/ketcher-core/src/domain/constants/generics.ts:27](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/generics.ts#L27)

___

### GenItem

Ƭ **GenItem**: `Object`

Copyright 2021 EPAM Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description?` | `string` |
| `label` | `string` |

#### Defined in

[packages/ketcher-core/src/domain/constants/generics.ts:17](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/generics.ts#L17)

___

### GenItemSet

Ƭ **GenItemSet**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `displayName?` | `string` |
| `items` | [`GenItem`](README.md#genitem)[] |

#### Defined in

[packages/ketcher-core/src/domain/constants/generics.ts:22](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/generics.ts#L22)

___

### GenericsType

Ƭ **GenericsType**: `Object`

#### Index signature

▪ [index: `string`]: [`GenGroup`](README.md#gengroup) & { `subGroups?`: [`GenericsType`](README.md#genericstype)  }

#### Defined in

[packages/ketcher-core/src/domain/constants/generics.ts:32](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/generics.ts#L32)

___

### Group

Ƭ **Group**: ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7`` \| ``8``

#### Defined in

[packages/ketcher-core/src/domain/constants/element.types.ts:138](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/element.types.ts#L138)

___

### MolfileFormat

Ƭ **MolfileFormat**: ``"v2000"`` \| ``"v3000"``

#### Defined in

[packages/ketcher-core/src/domain/serializers/mol/mol.types.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/serializers/mol/mol.types.ts#L25)

___

### Neighbor

Ƭ **Neighbor**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `aid` | `number` |
| `bid` | `number` |

#### Defined in

[packages/ketcher-core/src/domain/entities/struct.ts:38](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/struct.ts#L38)

___

### OutputFormatType

Ƭ **OutputFormatType**: ``"png"`` \| ``"svg"``

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structService.types.ts:127](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structService.types.ts#L127)

___

### Period

Ƭ **Period**: ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7``

#### Defined in

[packages/ketcher-core/src/domain/constants/element.types.ts:137](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/element.types.ts#L137)

___

### ServiceMode

Ƭ **ServiceMode**: ``"standalone"`` \| ``"remote"``

#### Defined in

[packages/ketcher-core/src/domain/services/struct/structServiceProvider.types.ts:19](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/services/struct/structServiceProvider.types.ts#L19)

___

### SupportedFormat

Ƭ **SupportedFormat**: ``"rxn"`` \| ``"rxnV3000"`` \| ``"mol"`` \| ``"molV3000"`` \| ``"smiles"`` \| ``"smilesExt"`` \| ``"smarts"`` \| ``"inChI"`` \| ``"inChIAuxInfo"`` \| ``"cml"`` \| ``"ket"`` \| ``"cdxml"``

#### Defined in

[packages/ketcher-core/src/application/formatters/structFormatter.types.ts:26](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/structFormatter.types.ts#L26)

## Variables

### ElementColor

• `Const` **ElementColor**: `ElementColorType`

#### Defined in

[packages/ketcher-core/src/domain/constants/elementColor.ts:23](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/elementColor.ts#L23)

___

### Elements

• `Const` **Elements**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `filter` | (`predicate`: (`element`: [`Element`](interfaces/Element.md)) => `boolean`) => [`Element`](interfaces/Element.md)[] |
| `get` | (`key`: `string` \| `number`) => `undefined` \| [`Element`](interfaces/Element.md) |

#### Defined in

[packages/ketcher-core/src/domain/constants/elements.ts:1314](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/elements.ts#L1314)

___

### Generics

• `Const` **Generics**: [`GenericsType`](README.md#genericstype)

#### Defined in

[packages/ketcher-core/src/domain/constants/generics.ts:36](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/constants/generics.ts#L36)

___

### Scale

• `Const` **Scale**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `obj2scaled` | (`v`: [`Vec2`](classes/Vec2.md), `options`: [`ScaleOptions`](interfaces/ScaleOptions.md)) => [`Vec2`](classes/Vec2.md) |
| `scaled2obj` | (`v`: [`Vec2`](classes/Vec2.md), `options`: [`ScaleOptions`](interfaces/ScaleOptions.md)) => [`Vec2`](classes/Vec2.md) |

#### Defined in

[packages/ketcher-core/src/domain/helpers/scale.ts:31](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/helpers/scale.ts#L31)

___

### SgContexts

• `Const` **SgContexts**: `Object`

Copyright 2021 EPAM Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Atom` | `string` |
| `Bond` | `string` |
| `Fragment` | `string` |
| `Group` | `string` |
| `Multifragment` | `string` |

#### Defined in

[packages/ketcher-core/src/application/editor/shared/constants.ts:17](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/editor/shared/constants.js#L17)

___

### StereoValidator

• `Const` **StereoValidator**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isCorrectStereoCenter` | (`bond`: [`Bond`](classes/Bond.md), `beginNeighs`: `undefined` \| [`Neighbor`](README.md#neighbor)[], `endNeighs`: `undefined` \| [`Neighbor`](README.md#neighbor)[], `struct`: [`Struct`](classes/Struct.md)) => `boolean` |

#### Defined in

[packages/ketcher-core/src/domain/helpers/stereoValidator.ts:62](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/helpers/stereoValidator.ts#L62)

___

### formatProperties

• `Const` **formatProperties**: `FormatPropertiesMap`

#### Defined in

[packages/ketcher-core/src/application/formatters/formatProperties.ts:25](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatProperties.ts#L25)

## Functions

### checkOverlapping

▸ **checkOverlapping**(`struct`, `atoms`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `struct` | `any` |
| `atoms` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ketcher-core/src/domain/entities/sgroupForest.ts:164](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/sgroupForest.ts#L164)

___

### getPropertiesByFormat

▸ **getPropertiesByFormat**(`format`): `SupportedFormatProperties`

#### Parameters

| Name | Type |
| :------ | :------ |
| `format` | [`SupportedFormat`](README.md#supportedformat) |

#### Returns

`SupportedFormatProperties`

#### Defined in

[packages/ketcher-core/src/application/formatters/formatProperties.ts:101](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatProperties.ts#L101)

___

### getPropertiesByImgFormat

▸ **getPropertiesByImgFormat**(`format`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `format` | `any` |

#### Returns

`any`

#### Defined in

[packages/ketcher-core/src/application/formatters/formatProperties.ts:97](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/formatProperties.ts#L97)

___

### identifyStructFormat

▸ **identifyStructFormat**(`stringifiedStruct`): [`SupportedFormat`](README.md#supportedformat)

#### Parameters

| Name | Type |
| :------ | :------ |
| `stringifiedStruct` | `string` |

#### Returns

[`SupportedFormat`](README.md#supportedformat)

#### Defined in

[packages/ketcher-core/src/application/formatters/identifyStructFormat.ts:19](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/application/formatters/identifyStructFormat.ts#L19)

___

### radicalElectrons

▸ **radicalElectrons**(`radical`): ``1`` \| ``2`` \| ``0``

#### Parameters

| Name | Type |
| :------ | :------ |
| `radical` | `any` |

#### Returns

``1`` \| ``2`` \| ``0``

#### Defined in

[packages/ketcher-core/src/domain/entities/atom.ts:36](https://github.com/epam/ketcher/blob/bf065756/packages/ketcher-core/src/domain/entities/atom.ts#L36)
