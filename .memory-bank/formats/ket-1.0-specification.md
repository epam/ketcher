# KET 1.0 specification

## General Structure

KET format is represented by JSON, with the following structure (object properties are defined below).

```json
{
    "root": {
        "nodes": [
            ### references to molecule definitions
            {
                "$ref": "mol0"
            },
            ...
            {
                "$ref": "mol<N>"
            },

            ### references to R-Group definitions
            {
                "$ref": "rg1"
            },
            ...
            {
                "$ref": "rg<N>"
            },

            ### references to monomer definitions
            {
                "$ref": "monomer1"
            },
            ...
            {
                "$ref": "monomer<N>"
            },

            ### references to group definitions
            {
                "$ref": "group1"
            },
            ...
            {
                "$ref": "group<N>"
            },

            ### references to monomerShape definitions
            {
                "$ref": "monomerShape1"
            },
            ...
            {
                "$ref": "monomerShape<N>"
            },

            ### reaction arrow object definitions ###
            {
                "type": "arrow",
                ### reaction #1 object properties
            },
            ...
            {
                "type": "arrow",
                ### reaction #N object properties
            },

            ### reaction 'plus' object definitions ###
            {
                "type": "plus",
                ### plus #1 object properties
            },
            ...
            {
                "type": "plus",
                ### plus #N object properties
            },

            ### simple static shape definitions: lines, rectangles, ellipses ###
            {
                "type": "simpleObject",
                ### simple object #1 properties
            },
            ...
            {
                "type": "simpleObject",
                ### simple object #N properties
            },

            ### styled text object definitions ###
            {
                "type": "text",
                ### styled text object #1 properties
            },
            ...
            {
                "type": "text",
                ### styled text object #N properties
            },

            ### raster images object definitions ###
            {
                "type": "image",
                ### image #1 properties
            },
            ...
            {
                "type": "image",
                ### image #N properties
            },

            ### Multi-tailed arrow object definitions ###
            {
                "type": "multi-tailed-arrow",
                ### multi-tailed arrow #1 object properties
            },
            ...
            {
                "type": "multi-tailed-arrow",
                ### multi-tailed arrow #N object properties
            }
        ],

        ### connections/bonds between monomers ###
        "connections": [
            {
                ### connection #1 properties
            },
            ...
            {
                ### connection #N properties
            }
        ],

        ### monomer and group template definitions ###
        "templates": [
            {
                "$ref": "monomerTemplate-<template-id-1>"
                ### monomer template #1 properties
            },
            ...
            {
                "$ref": "monomerTemplate-<template-id-N>"
                ### monomer template #N properties
            },
            {
                "$ref": "groupTemplate-<template-id-1>"
                ### group template #1 properties
            },
            ...
            {
                "$ref": "groupTemplate-<template-id-N>"
                ### group template #N properties
            }
        ]
    },

    ### molecule object definitions
    "mol0": {
        ### molecule #1 properties
    },
    ...
    "mol<N>": {
        ### molecule #N properties
    },

    ### r-group object definitions
    "rg1": {
        ### r-group #1 properties
    },
    ...
    "rg<N>": {
        ### r-group #N properties
    },

    ### monomer instance object definitions
    "monomer1": {
        ### monomer instance #1 properties
    },
    ...
    "monomer<N>": {
        ### monomer instance #N properties
    },

    ### group objects definitions
    "group1": {
        ### group #1 properties
    },
    ...
    "group<N>": {
        ### group #N properties
    },

    ### monomerShape objects definitions
    "monomerShape1": {
        ### monomerShape #1 properties
    },
    ...
    "monomerShape<N>": {
        ### monomerShape #N properties
    }
}
```

## Molecule Object Properties

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| type | yes | string | molecule | | |
| atoms | yes | array of objects | | specifies a list of atoms within the molecule | |
| &bull; location | no | 2 or 3 elements array of floats | | specifies atom, rg-label, or atom-list coordinates | `"location": [ 6.875, -8.275, 0 ]` |
| &bull; type | no | string | atom, rg-label, atom-list. | default value is "atom" | `"type":"atom-list"` |

### Fields for "atom" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; label | yes | string | any non empty string | atom name | `"label":"C"` |
| &bull; alias | no | string | any non empty string | a special atom label, which can be used to refer to a superatom, as specified in CXSMILES. | `"alias":"Am"` |
| &bull; charge | no | integer | integer in range: [-15,15] | atom charge. 0 - uncharged atom. | `"charge":"1"` |
| &bull; explicitValence | no | integer | integer in range: [-1,12] | abnormal valence | `"explicitValence":"6"` |
| &bull; isotope | no | integer | integer > 1 | absolute mass of the atom isotope. | `"isotope":"1"` |
| &bull; radical | no | integer | integer in range: [0, 3] | 0 - no radical, 1 - singlet (:), 2 - doublet (.  or ^), 3 - triplet (^^) | `"radical":"3"` |
| &bull; attachmentPoints | no | integer | integer in range: [0, 3] | if > 0 atom has attachment points: 1 - first attachment point, 2 - second attachment point, 3 - two attachment points | `"attachmentPoints":"3"` |
| &bull; stereoLabel | no | string | abs \&<n> or<n> | where n is a positive enhanced stereochemistry group number | `"stereoLabel":"&1"` |
| &bull; stereoParity | no | integer | integer in range: [0, 3] | 0 - not stereo, 1 - odd, 2 - even, 3 - either or unmarked stereo center | `"stereoParity":"3"` |
| &bull; ringBondCount | no | integer | integer in ranges: [-2, 0], [2, 4] | query ring bond count: number of ring bonds allowed: 0 - off, -1 - no ring bonds, -2 - as drawn (r*) 2 - (r2), 3 - (r3), 4 or more - (r4). | `"ringBondCount":"4"` |
| &bull; substitutionCount | no | integer | integer in range: [-2, 6] | query substitution count | `"substitutionCount":"3"` |
| &bull; unsaturatedAtom | no | boolean | | query unsaturation flag | `"unsaturatedAtom":"true"` |
| &bull; hCount | no | integer | integer in range: [-1, 5] | query hydrogen count: -1 - H0, 0 - not specified, 1 - H1, 2 - H2, 3 - H3, 4 - H4. | `"hCount":"4"` |
| &bull; implicitHCount | no | integer | integer in range: [0, 5] | implicit hydrogen count (supported in SMILES) | `"implicitHCount":"3"` |
| &bull; mapping | no | integer | integer >= 0 | > 0 - mapped atom | `"mapping:":"1"` |
| &bull; invRet | no | integer | integer in range: [0, 2] | configuration inversion | `"invRet":"1"` |
| &bull; exactChangeFlag | no | boolean | | true - exact change as displayed in the reaction | `"exactChangeFlag":"true"` |
| &bull; cip | no | string | R, S | Cahn–Ingold–Prelog descriptor | `"cip":"R"` |
| &bull; queryProperties | no | object | | | |
| &nbsp;&nbsp;&deg; customQuery | no | string | SMARTS string | if defined - no one other property of atom could be used | |
| &nbsp;&nbsp;&deg; aromaticity | no | string | aromatic aliphatic | | |
| &nbsp;&nbsp;&deg; degree | no | integer | integer in range [0, 6] | number of explicit connections | |
| &nbsp;&nbsp;&deg; ringMembership | no | integer | integer in range [0, 5] | | |
| &nbsp;&nbsp;&deg; ringSize | no | integer | integer in range [0, 5] | | |
| &nbsp;&nbsp;&deg; connectivity | no | integer | integer in range [0, 5] | | |
| &nbsp;&nbsp;&deg; ringConnectivity | no | integer | integer in range [0, 5] | | |
| &nbsp;&nbsp;&deg; atomicMass | no | integer | integer in range [0, 1000] | | |
| &nbsp;&nbsp;&deg; chirality | no | string | clockwise anticlockwise | | |

### Fields for "rg-label" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; attachmentOrder | no | array of objects | | | |
| &nbsp;&nbsp;&deg; attachmentAtom | yes | integer | integer >= 0 | index of attachment atom | |
| &nbsp;&nbsp;&deg; attachmentId | yes | integer | integer >= 0 | 1 - first attachment, 2 - second attachment, 3 - both. | |
| &bull; $refs | no | array of strings | | references to r-group definitions | |

### Fields for "atom-list" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; notlist | no | boolean | | If true, the elements list is treated as an excluded elements list. | |
| &bull; elements | yes | array of strings | | list of atom labels | |
| &bull; (all other fields) | | | | all fields from description of "atom" type except label | |

### bonds

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| bonds | no | array of objects | | | |
| &bull; type | yes | integer | integer in range: [1, 10] | bond order: 1 - single, 2 - double, 3 - triple, 4 - aromatic, 5 - single or aromatic, 6 - single or aromatic, 7 - double or aromatic, 8 - any, 9 - coordination, 10 - hydrogen | |
| &bull; atoms | yes | array[2] of integers | integer >= 0 | pair of atom indexes connected with the bond | |
| &bull; stereo | no | integer | 0, 1, 3, 4, 6 | bond stereo: 0 - no stereo, 1 - up, 3 - double cis-trans, 4 - either, 6 - down | |
| &bull; topology | no | integer | integer in range: [0, 2] | bond topology: 0 - not specified, 1 - ring, 2 - chain | |
| &bull; center | no | integer | possible values: 0, -1, 1, 2, 4, 8, 9, 12, 13 | reaction center: 0 - unmarked (default), -1 - not a reacting center, 1 - generic reacting center, 2 - no change, 4 - bond made or broken, 8 - bond order changes, 12 - bond made or broken and change ( 4 + 8 ) the following combinations are also possible: 5 - (4 + 1), 9 - (8 + 1), 13 - (12 + 1) | `"center":"13"` |
| &bull; stereobox | no | integer | 0 or 1 | 0 - ignore the configuration of this double bond, 1 - consider the stereo configuration of this double bond | `"stereobox":"1"` |
| &bull; cip | no | string | Z, E | atom cip configuration | `"cip":"Z"` |
| stereoFlagPosition | no | coordinates | | position of the label that defines stereochemistry flag: ABS, AND, OR, MIXED. | `"stereoFlagPosition": { "x": 19.0, "y": 16.0, "z": 0 }` |

### sgroups

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| sgroups | no | array of objects | | | |
| &bull; type | yes | string | GEN MUL SRU SUP DAT | "GEN" - generic S-group, "MUL" - multiple S-group, "SRU" - S-group repetition unit, "SUP" - superatom, "DAT"- data S-group | |
| &bull; atoms | yes | array of integers | integer >= 0 | Indices of atoms that belong to this group. | |

#### Fields for "MUL" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; mul | yes | integer | integer in range: [1, 1000] | | |

#### Fields for "SRU" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; subscript | no | string | a string of latin characters. | | |
| &bull; connectivity | yes | string | possible values: "HT", "HH", "EU" | | |

#### Fields for "SUP" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; name | yes | string | | the name of the superatom. | |
| &bull; expanded | no | boolean | | true - expanded, false - contracted | |
| &bull; attachmentPoints | no | array of objects | | | |
| &nbsp;&nbsp;&deg; attachmentAtom | yes | integer | | atom in the superatom capable of bonding externally. | |
| &nbsp;&nbsp;&deg; leavingAtom | no | integer | | atom attached to the superatom, which departs when external bonding with the attachment atom occurs | |
| &nbsp;&nbsp;&deg; attachmentId | no | string | | 2 letters attachment identifier | |

#### Fields for "DAT" type

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| &bull; fieldName | yes | string | | user key | |
| &bull; fieldData | yes | string | | user string associated with a fieldName | |
| &bull; context | no | string | Fragment, Multifragment, Bond, Atom, Group | | |
| &bull; display | no | boolean | | display units | |
| &bull; placement | no | boolean | | | |
| &bull; bonds | no | array of integers | integer >= 0 | | |

## R-Group Object Properties

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| type | yes | string | rgroup | | |
| rlogic | no | object | | | |
| &bull; number | yes | integer | integer >= 1 | R-Group number | |
| &bull; ifthen | no | integer | integer >= 1 | Number of another Rgroup which must only be satisfied if "number" is satisfied (IF "number" THEN "ifthen"). | |
| &bull; range | no | string | Range of Rgroup occurrence required: n = exactly n, n - m = n through m,> n = greater than n, < n = fewer than n, default (blank) is > 0. Any non-contradictory combination of the preceding values is also allowed default: ">0" | String specifying number (range) of Rgroup occurrence sites that need to be satisfied. | `"range":"1, 3-7, 9, >11"` |
| &bull; resth | no | bool | | RestH property of Rgroup rrr; default is false. If this property is applied (true), sites labeled with Rgroup "number" can only be substituted with a member of the Rgroup or with H. | |
| molecule description fields: atoms, bonds, etc. | no | | | see "Molecules definition in KET" | |
| fragments | no | array of objects | | this array appears if R-Group consists of several non-connected molecules so every array element has the same fields as a molecule description: atoms, bonds, etc. | |

## Simple Object Properties

### Fields for "simpleObject" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &deg; mode | yes | string | rectangle, line, ellipse | specifies graphic primitive type | `"mode":"rectangle"` |
| &deg; pos | yes | 2 elements array of coordinates | | Specifies the coordinates of two opposite corners of a rectangle, the coordinates of the start and end points of a line segment, or the coordinates of the rectangle's corners for the ellipse inscribed in it. | `"pos": [ { "x": 5, "y": -6, "z": 0 }, { "x": 9, "y": -8, "z": 0 } ]` |

### Fields for "text" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &deg; position | yes | coordinates | | left top text coordinates | `"position": { "x": 10.5, "y": -9.5, "z": 0 }` |
| &deg; pos | no | 2 elements array of coordinates | | text bounding box: left top, right bottom. | `"pos": [ { "x": 5, "y": -6, "z": 0 }, { "x": 9, "y": -8, "z": 0 } ]` |
| &deg; content | yes | string | styled text content object serialised into escaped json-string | JSON description of a multiline text object with specified text styles and sizes. | `"content":"{\"blocks\":[{\"key\":\"e0mho\",\"text\":\"MY TEXT\",\"inlineStyleRanges\":[{\"offset\":0,\"length\":2,\"style\":\"ITALIC\"},{\"offset\":3,\"length\":4,\"style\":\"BOLD\"}]}]}"` |
| &#9632; blocks | yes | array of objects | | nodes list | `"blocks": [ { "key":"fj44u", "text":"mytext", "inlineStyleRanges":[ { "offset":1, "length":2, "style":"ITALIC" } ] } ]` |
| &bull; key | no | string | unique string identifier | unique key in the blocks array | `"key":"fj44u"` |
| &bull; text | yes | string | any utf-8 string | text string | `"text":"mytext"` |
| &bull; inlineStyleRanges | no | array of objects | | text styles | `"inlineStyleRanges":[ { "offset":1, "length":2, "style":"ITALIC" } ]` |
| &#9632; offset | yes | integer | integer >= 0 | offset of the substring where the style applies | `"offset":1` |
| &#9632; length | yes | integer | integer > 0 | length of the substring where the style applies | `"length":2` |
| &#9632; style | string | string | BOLD, ITALIC, SUPERSCRIPT, SUBSCRIPT, CUSTOM_FONT_SIZE_\<N\>_px, where N is an integer in the following range: [4, 144] | specifies font style and size for any substring of the text | `"style":"ITALIC"` |

### Fields for "arrow" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &deg; mode | yes | string | open-angle, filled-triangle, filled-bow, dashed-open-angle-failed, both-ends-filled-triangle, equilibrium-filled-half-bow, equilibrium-filled-triangle, equilibrium-open-angle, unbalanced-equilibrium-filled-half-bow, unbalanced-equilibrium-large-filled-half-bow, unbalanced-equilibrium-open-half-angle, unbalanced-equilibrium-filled-half-triangle, elliptical-arc-arrow-filled-bow, elliptical-arc-arrow-filled-triangle, elliptical-arc-arrow-open-angle, elliptical-arc-arrow-open-half-angle | arrow type | `"mode":"open-angle"` |
| &deg; pos | yes | 2 elements array of objects | | two coordinates: pos[0] - for arrow tail pos[1] - for arrow head | `"pos": [ { "x": 6.425, "y": -6.775, "z": 0 }, { "x": 15.064, "y": -6.775, "z": 0 } ]` |

### Fields for "plus" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &bull; location | yes | 2 or 3 elements array of floats | | coordinate of the plus sign center. x - location[0], y - location[1], z - location[2] (optional) | `"location": [ 6.875, -8.275, 0 ]` |

### Fields for "image" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &bull; bounding_box | yes | object | | image bounding box where x, and y - top left coordinates. and z coordinate is optional. | `"bounding_box": { "x": 0.0, "y": 0.0, "z": 0.0, "width": 320, "height": 200 }` |
| &bull; data | yes | string | | base64 encoded image data | `"data":"image/png;base64,iVBORw0KGgoAAAAN"` |

### Fields for "multi-tailed arrow" type

| Key | Required | Type | Values | Description | Usage |
|---|---|---|---|---|---|
| &bull; head | yes | object | | position is coordinates of the head end. x, y, z | `"position":{ "x": 18.275, "y": -10, "z": 0 }` |
| &bull; spine | yes | array of two objects | | positions of the top and bottom end respectively | `"pos": [ { "x": 17.474999999999998, "y": -8.825000000000001, "z": 0 }, { "x": 17.474999999999998, "y": -11.325000000000001, "z": 0 } ]` |
| &bull; tails | yes | array of at least two objects | | positions of all tails | `"pos": [ { "x": 17.075, "y": -8.825000000000001, "z": 0 }, { "x": 17.075, "y": -11.325000000000001, "z": 0 } ]` |

## Monomer Template Properties

| Field | Required | Type | Value | Description | Usage | Comments |
|---|---|---|---|---|---|---|
| type | yes | string | "monomerTemplate" | | | |
| class | yes | string | AminoAcid, Sugar, Phosphate, Base, Terminator, Linker, Unknown, Chem, DNA, RNA | monomer class similar to MOLv3000 specification. can be unspecified. | `"class": "AminoAcid"` | |
| classHELM | no | string | PEPTIDE, RNA, CHEM | monomer class in terms of HELM and ketcher. | | |
| id | yes | string | any non empty unique string among monomers defined in the KET | monomer identifier | `"id": "Ala"` / `"id": "#1"` | for the standard monomers corresponding 3-letter designations; inline monomers starts from '#' symbol; for all other cases it should be non empty unique string among other monomers defined in the current KET. |
| fullName | no | string | any non empty string | monomer full name | `"fullName":"alanine"` | |
| alias | no | string | any non empty string | monomer display alias. If not specified, the value of id should be used instead. | `"symbol":"A"` / `"symbol":"meA"` | It is recommended to use corresponding 1-letter designations for standard monomers. As this value is used for labeling the monomer icon, it should be as short as possible. |
| naturalAnalog | no | string | Ala,Arg,Asn,Asp,Cys,Gln,Glu,Gly,His,Ile,Leu,Lys,Met,Phe,Pro,Ser,Thr,Trp,Tyr,Val; Pi; Rib, dRib; Ade,Cyt,Gua,Thy,Ura; if not defined - the monomer has no natural analog | specified for monomers that are modified versions of standard ones. refers to unmodified monomer identifier. for a standard monomer the value matches with the label. | `"naturalAnalog": "Ala"` | In the current conventions, the value can only be a three-letter identifier for a standard monomer. However, when expanding the classes of monomers, longer identifiers can be used. |
| naturalAnalogShort | no | string | | | | |
| idtAliases | no | object | | | | |
| &bull; base | yes | string | | IDT alias base. standard modifications 5+base, i+base, 3+base | `"idtAliases": { "base": "ZEN", "modifications": { "internal": "ZEN", "endpoint3": "3ZEN", "endpoint5": "5ZEN" } }` | |
| &bull; modifications | no | object | | specified for nonstandard modifications, should contains all modifiations defined for IDT monomer | | |
| &nbsp;&nbsp;&deg; internal | no | string | | | | |
| &nbsp;&nbsp;&deg; endpoint3 | no | string | | | | |
| &nbsp;&nbsp;&deg; endpoint5 | no | string | | | | |
| attachmentPoints | no | array of objects | | array of attachment points of the monomer | `"attachmentPoints":[{ "type": "right", "label": "Br", "attachmentAtom": 0, "leavingGroup": { "atoms":[9,10] } }]` | |
| &bull; type | no | string | the optional type which can be one of: "left", "right", "side". if the field not specified there are following defaults: attachmentPoints[ 0 ]   left, attachmentPoints[ 1 ]   right, attachmentPoints[ 2..n ]   side | attachment point type | | |
| &bull; label | no | string | if defined, the value should be unique in the attachmentPoints array, if the value it's not defined the defaults are: type = left  label = "R1", type = right  label = "R2", first attachment point of a "side" type appeared in attachmentPoints array label = "R3", second,  label = "R4", etc. | attachment point label | `"label" : "R2"` | |
| &bull; attachmentAtom | yes | integer | >=0 | index of an attachment atom in the atoms array of the monomer | `"attachmentAtom" : 0` | |
| &bull; leavingGroup | no | object | | | `"leavingGroup" : { "atoms":[ 9 ,10 ] }` | |
| &nbsp;&nbsp;&deg; atoms | yes | array of integers | atoms[i] >= 0 | array of indexes of the atoms to be removed when the corresponding attachment point is in use. | `"atoms":[ 9 ,10 ]` | |
| molecule description fields: atoms, bonds, etc. | | | | see "Molecules definition in KET" | | |

## Monomer Instance Properties

Monomer instance may appear as an element of nodes array on root level or inside a group.

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| type | yes | string | "type": "monomer" | object type | `"type": "monomer"` |
| id | yes | string | any non-empty string | unique monomer instance id | `"id": "mon1"` |
| seqid | no | integer | seqid > 0, i.e. starts from 1 | monomer numerations in the group. it's not always straight from left to right. | `"seqid": 1` |
| position | no | object | | monomer position | `"origin": { "x": 1.5, "y": 0.5 }` |
| &bull; x | yes | number | | x position | `"x": 1.5` |
| &bull; y | yes | number | | y position | `"y": 0,5` |
| alias | yes | string | any non empty string | it is possible to rename the display alias for a monomer instance | `"symbol": "A1"` |
| templateId | yes | string | same as for id in the monomerTemplate | refers to id of a monomerTemplate | `"templateId": "Ala"` |

## Ambiguous Monomer Template Properties

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| type | yes | string | ambiguousMonomerTemplate | object type | `"type": "ambiguousMonomerTemplate"` |
| subtype | yes | string | alternatives, mixture | group class. | `"subtype": "alternatives"` |
| id | yes | string | any non empty unique string among ambiguous monomer templates defined in the KET | ambiguous monomer template id | |
| alias | yes | string | name of ambiguous monomer | | |
| options | yes | array of object | | array of monomers options. For alternatives coulbe set probability, for mixture could be set ration, for equimolarMixture only templateId could be set - all monomers in equimolar ratio. | `options:[ { templateId: mon1, ratio: 3}, { templateId: mon2, ratio: 2}, { templateId: mon1, ratio:1 }, ]` |
| &bull; templateId | yes | string | same as for id in the monomerTemplate | refers to id of a monomerTemplate | |
| &bull; probability | no | float | >=0 | Probability of this monomer for alternatives. If not specified - means that value unknown. | 10.5 |
| &bull; ratio | no | float | >=0 | The ratio of this monomer for mixture. If not specified - means that value unknown. | 33.3333 |
| idtAliases | no | object | | | |
| &bull; base | yes | string | | IDT alias base. standard modifications 5+base, i+base, 3+base | `"idtAliases": { "base": "ZEN", "modifications": { "internal": "ZEN", "endpoint3": "3ZEN", "endpoint5": "5ZEN" } }` |
| &bull; modifications | no | object | | specified for nonstandard modifications, should contains all modifiations defined for IDT monomer | |
| &nbsp;&nbsp;&deg; internal | no | string | | | |
| &nbsp;&nbsp;&deg; endpoint3 | no | string | | | |
| &nbsp;&nbsp;&deg; endpoint5 | no | string | | | |

## Ambiguous Monomer Instance Properties

Monomer instance may appear as an element of nodes array on root level or inside a group.

| Field | Required | Type | Value | Description | Example |
|---|---|---|---|---|---|
| type | yes | string | ambiguousMonomer | object type | `"type": "ambiguousMonomer"` |
| id | yes | string | any non-empty string | unique ambiguous monomer instance id | `"id": "mon1"` |
| position | no | object | | monomer position | `"origin": { "x": 1.5, "y": 0.5 }` |
| &bull; x | yes | number | | x position | `"x": 1.5` |
| &bull; y | yes | number | | y position | `"y": 0,5` |
| alias | yes | string | any non empty string | it is possible to rename the display alias for a ambiguous monomer instance | `"symbol": "A1"` |
| templateId | yes | string | same as for id in the monomerTemplate | refers to id of a monomerTemplate | `"templateId": "Ala"` |

## Group Properties

Group is a series of monomers, where each monomer can be connected to other monomers using their attachment points.

| Field | Required | Type | Value | Description | Example | Comment |
|---|---|---|---|---|---|---|
| type | yes | string | group | object type | `"type": "group"` | |
| groupClass | yes | string | generic, ambiguous, repeatUnit | group class | `"type": "ambiguous"` | |
| id | yes | string | any non-empty unique string | group unique id | `"id": "grp1"` | |
| label | no | string | any non-empty string | group display label | `"label": "oxytocine"` | |
| attachmentPoints | no | array of objects | | optional attachment point for ambiguous connection | | |
| &bull; id | yes | string | | attachment point Id | | R1...Rn or custom label |
| &bull; ambiguousList | yes | object | | group with "type"="ambiguous" | | |
| nodes | yes | array of objects | | list of included groups and monomer instances | `"nodes": [ "monomer1", "monomer2", "group2" ]` | |

### Fields for "generic" groupClass

| Field | Required | Type | Value | Description | Example | Comment |
|---|---|---|---|---|---|---|
| connections | no | array of connections | | connections definitions | | |

### Fields for "ambiguous" groupClass

| Field | Required | Type | Value | Description | Example | Comment |
|---|---|---|---|---|---|---|
| operator | yes | string | and, or, xor | logic operator: defines relationship between elements in the nodes array. | | |
| ratio | no | integer | | proportion value | | |

### Fields for "repeatUnit" groupClass

| Field | Required | Type | Value | Description | Example | Comment |
|---|---|---|---|---|---|---|
| repeatRange | yes | object | to >= from | repetition range.  from = to means fixed repletion count. | `"repeatRange": { "from": "5", "to": "10" }` | |
| &bull; from | yes | integer | | | | |
| &bull; to | yes | integer | | | | |

## Connection Properties

Connections can be defined outside the root block using reference connection\<N\> or straight as element of nodes array on root level. Also local connections can be defined inside groups.

| Field | Required | Type | Value | Description | Usage |
|---|---|---|---|---|---|
| connectionType | yes | string | single, hydrogen | bond type | `"connectionType":"single"` |
| label | no | string | any string | optional connection label | `"label":"my comment"` |
| endpoint1 | yes | object | | connection endpoint (at least one field should present) | `"endPoint1": { "groupId": "group1", "monomerId":"monomer1", "attachmentPointId":"R3" }` |
| &bull; groupId | no | string | same as for group\<N\> | group to be connected | `"groupId": "group1"` |
| &bull; monomerId | no | string | same as for monomer\<N\> | monomer inside the group. currently ketcher send monomer ref instead of monomer id - should be fixed | `"monomerId":" monomer1"` |
| &bull; attachmentPointId | no | string | R1..Rn for monomer's attachment point. | monomer or group attachment point | `"attachmentPointId":"R3"` |
| &bull; moleculeId | no | string | same as for mol\<N\> | | `"moleculeId":"mol0"` |
| &bull; atomId | no | string | Id of atom | | `"atomId":"2"` |
| endpoint2 | yes | object | | same field should be specified as for endPoint1 | `"endPoint2": { "groupId": "group2", "monomerId":"monomer3", "attachmentPointId":"R2" }` |
| &bull; groupId | no | string | same as for group\<N\> | group to be connected | `"groupId": "group1"` |
| &bull; monomerId | no | string | same as for monomer\<N\> | monomer inside the group. currently ketcher send monomer ref instead of monomer id - should be fixed | `"monomerId":" monomer1"` |
| &bull; attachmentPointId | no | string | R1..Rn for monomer's attachment point. | monomer or group attachment point | `"attachmentPointId":"R3"` |
| &bull; moleculeId | no | string | same as for mol\<N\> | | `"moleculeId":"mol0"` |
| &bull; atomId | no | string | Id of atom | | `"atomId":"2"` |

## Monomer Group Template Properties

| Field | Required | Type | Value | Description | Usage | Comments |
|---|---|---|---|---|---|---|
| type | yes | string | "monomerGroupTemplate" | | | |
| id | yes | string | | | | |
| name | yes | string | | | | |
| class | no | string | RNA | class of templates group | `"class": "RNA"` | |
| templates | yes | array of string | | | | |
| idtAliases | no | object | | | | |
| &bull; base | yes | string | | IDT alias base. standard modifications: 5+base, i+base, 3+base | `"idtAliases": { "base": "ZEN", "modifications": { "internal": "ZEN", "endpoint3": "3ZEN", "endpoint5": "5ZEN" } }` | |
| &bull; modifications | no | object | | specified for nonstandard modifications, should contains all modifiations defined for IDT monomer | | |
| &nbsp;&nbsp;&deg; internal | no | string | | | | |
| &nbsp;&nbsp;&deg; endpoint3 | no | string | | | | |
| &nbsp;&nbsp;&deg; endpoint5 | no | string | | | | |

## Monomer Shape Properties

| Field | Required | Type | Value | Description | Usage |
|---|---|---|---|---|---|
| type | yes | string | "monomerShape" | | |
| id | yes | string | | | |
| collapsed | yes | boolean | "true", "false" | | `"collapsed":"true"` |
| shape | yes | string | "generic", "antibody", "double helix", "globular protein" | | `"shape": "generic"` |
| position | yes | object | | position | `"position": { "x": 1.5, "y": 0.5 }` |
| &bull; x | yes | number | | x position | `"x": 1.5` |
| &bull; y | yes | number | | y position | `"y": 0,5` |
| monomers | yes | array of strings | | array of monomers ids | `monomers: ["mon1", "mon2", "mon3"]` |

## System of Coordinates

Object coordinates can be represented as a structure `{ x: <X>, y: <Y>, z:<Z> }` or array `[ <X>, <Y>, <Z> ]`, where X, Y and Z are floating point numbers (positive and negative).

Center of coordinates (0, 0, 0) corresponds to the center of view port.  Z-coordinate is currently not used and always set to 0.

Coordinates are defined in angstroms (commonly used in MOL format). As an example, in simple hydrocarbons the distance between adjacent carbon atoms is approximately 1.5, while between carbon and hydrogen it is 1.0.

## Examples

Single molecule with two atoms connected with single bond: CH3-CH3

```json
{
    "root": {
        "nodes": [
            {
                "$ref": "mol0"
            }
        ],
        "connections": [],
        "templates": []
    },
    "mol0": {
        "type": "molecule",
        "atoms": [
            {
                "label": "C",
                "location": [
                    4.225,
                    -5.575,
                    0
                ]
            },
            {
                "label": "C",
                "location": [
                    5.225,
                    -5.575,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 1,
                "atoms": [
                    0,
                    1
                ]
            }
        ]
    }
}
```

Simple reaction NH3 + H2O  NH=O

```json
{
    "root": {
        "nodes": [
            {
                "$ref": "mol0"
            },
            {
                "$ref": "mol1"
            },
            {
                "$ref": "mol2"
            },
            {
                "type": "arrow",
                "data": {
                    "mode": "open-angle",
                    "pos": [
                        {
                            "x": 8.450,
                            "y": -6.5,
                            "z": 0
                        },
                        {
                            "x": 9.950,
                            "y": -6.5,
                            "z": 0
                        }
                    ]
                }
            },
            {
                "type": "plus",
                "location": [
                    5.850,
                    -6.475,
                    0
                ],
                "prop": {}
            }
        ],
        "connections": [],
        "templates": []
    },
    "mol0": {
        "type": "molecule",
        "atoms": [
            {
                "label": "N",
                "location": [
                    4.275,
                    -6.4,
                    0
                ]
            }
        ]
    },
    "mol1": {
        "type": "molecule",
        "atoms": [
            {
                "label": "O",
                "location": [
                    7.150,
                    -6.575,
                    0
                ]
            }
        ]
    },
    "mol2": {
        "type": "molecule",
        "atoms": [
            {
                "label": "N",
                "location": [
                    10.925,
                    -6.475,
                    0
                ]
            },
            {
                "label": "O",
                "location": [
                    11.925,
                    -6.475,
                    0
                ]
            }
        ],
        "bonds": [
            {
                "type": 2,
                "atoms": [
                    0,
                    1
                ]
            }
        ]
    }
}
```

RNA preset template

```json
{
  "root": {
    "templates": [
      {
        "$ref": "monomerGroupTemplate-1"
      },
      {
        "$ref": "monomerTemplate-Ribose"
      },
      {
        "$ref": "monomerTemplate-Alanine"
      },
      {
        "$ref": "monomerTemplate-Phosphate"
      }
    ]
  },
  "monomerGroupTemplate-1": {
    "type": "monomerGroupTemplate",
    "id": "1",
    "name": "A",
    "idtAliases": {
      "base": "ZEN",
      "modifications": {
        "internal": "ZEN",
        "endpoint3": "3ZEN",
        "endpoint5": "5ZEN"
      }
    },
    "class": "RNA",
    "templates": [
      {
        "$ref": "monomerTemplate-Ribose"
      },
      {
        "$ref": "monomerTemplate-Alanine"
      },
      {
        "$ref": "monomerTemplate-Phosphate"
      }
    ]
  },
  "monomerTemplate-Alanine": {"..."},
  "monomerTemplate-Ribose": {"..."},
  "monomerTemplate-Phosphate": {"..."}
}
```
