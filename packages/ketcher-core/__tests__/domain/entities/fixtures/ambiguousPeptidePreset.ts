// Trimmed KET content for a single "ambiguous monomer" (alternatives: Alanine / Cysteine),
// derived from the reproduction file attached to https://github.com/epam/ketcher/issues/9866.
// Alanine exposes attachment points R1/R2; Cysteine exposes R1/R2/R3 - the common set
// across all options is R1 and R2, at different real atom indices in each candidate
// monomer's own structure.
export const ambiguousPeptidePresetKet = `{
    "root": {
        "nodes": [
            {
                "$ref": "monomer1604"
            }
        ],
        "connections": [],
        "templates": [
            {
                "$ref": "ambiguousMonomerTemplate-alternatives__A___Alanine__C___Cysteine_"
            },
            {
                "$ref": "monomerTemplate-A___Alanine"
            },
            {
                "$ref": "monomerTemplate-C___Cysteine"
            }
        ]
    },
    "monomer1604": {
        "type": "ambiguousMonomer",
        "id": "1604",
        "position": {
            "x": 21.2,
            "y": -11.97
        },
        "alias": "X",
        "templateId": "alternatives__A___Alanine__C___Cysteine_"
    },
    "ambiguousMonomerTemplate-alternatives__A___Alanine__C___Cysteine_": {
        "type": "ambiguousMonomerTemplate",
        "id": "alternatives__A___Alanine__C___Cysteine_",
        "alias": "X",
        "subtype": "alternatives",
        "options": [
            {
                "templateId": "A___Alanine"
            },
            {
                "templateId": "C___Cysteine"
            }
        ]
    },
    "monomerTemplate-A___Alanine": {
        "type": "monomerTemplate",
        "atoms": [
            { "label": "N", "location": [-1.2549, -0.392, 0] },
            { "label": "C", "location": [-0.272, 0.2633, 0], "stereoLabel": "abs" },
            { "label": "C", "location": [-0.3103, 1.7393, 0] },
            { "label": "C", "location": [1.0523, -0.392, 0] },
            { "label": "O", "location": [1.0829, -1.5722, 0] },
            { "label": "O", "location": [2.0353, 0.2633, 0] },
            { "label": "H", "location": [-2.3334, 0.0905, 0] }
        ],
        "bonds": [
            { "type": 1, "atoms": [1, 0] },
            { "type": 1, "atoms": [1, 2], "stereo": 1 },
            { "type": 1, "atoms": [1, 3] },
            { "type": 2, "atoms": [3, 4] },
            { "type": 1, "atoms": [3, 5] },
            { "type": 1, "atoms": [0, 6] }
        ],
        "class": "AminoAcid",
        "classHELM": "PEPTIDE",
        "id": "A___Alanine",
        "fullName": "Alanine",
        "alias": "A",
        "attachmentPoints": [
            { "attachmentAtom": 0, "leavingGroup": { "atoms": [6] }, "type": "left" },
            { "attachmentAtom": 3, "leavingGroup": { "atoms": [5] }, "type": "right" }
        ],
        "naturalAnalogShort": "A"
    },
    "monomerTemplate-C___Cysteine": {
        "type": "monomerTemplate",
        "atoms": [
            { "label": "C", "location": [1.4457, -1.1333, 0] },
            { "label": "C", "location": [0.1453, -0.384, 0], "stereoLabel": "abs" },
            { "label": "C", "location": [0.143, 1.1168, 0] },
            { "label": "S", "location": [-1.1573, 1.8661, 0] },
            { "label": "N", "location": [-1.1551, -1.1333, 0] },
            { "label": "O", "location": [1.4475, -2.3333, 0] },
            { "label": "O", "location": [2.4842, -0.532, 0] },
            { "label": "H", "location": [-2.1942, -0.5331, 0] },
            { "label": "H", "location": [-1.1591, 3.0661, 0] }
        ],
        "bonds": [
            { "type": 2, "atoms": [5, 0] },
            { "type": 1, "atoms": [0, 1] },
            { "type": 1, "atoms": [0, 6] },
            { "type": 1, "atoms": [1, 4] },
            { "type": 1, "atoms": [1, 2], "stereo": 1 },
            { "type": 1, "atoms": [2, 3] },
            { "type": 1, "atoms": [4, 7] },
            { "type": 1, "atoms": [3, 8] }
        ],
        "class": "AminoAcid",
        "classHELM": "PEPTIDE",
        "id": "C___Cysteine",
        "fullName": "Cysteine",
        "alias": "C",
        "attachmentPoints": [
            { "attachmentAtom": 4, "leavingGroup": { "atoms": [7] }, "type": "left" },
            { "attachmentAtom": 0, "leavingGroup": { "atoms": [6] }, "type": "right" },
            { "attachmentAtom": 3, "leavingGroup": { "atoms": [8] }, "type": "side" }
        ],
        "naturalAnalogShort": "C"
    }
}`;
