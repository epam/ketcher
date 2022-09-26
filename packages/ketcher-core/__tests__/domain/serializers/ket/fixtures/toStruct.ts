export const withoutHeaderKet = `{
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
                    "$ref": "mol3"
                },
                {
                    "$ref": "mol4"
                },
                {
                    "$ref": "mol5"
                },
                {
                    "$ref": "mol6"
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "H",
                    "location": [
                        11.95,
                        5.075,
                        0
                    ]
                }
            ]
        },
        "mol1": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "F",
                    "location": [
                        14.4,
                        6.775,
                        0
                    ]
                }
            ]
        },
        "mol2": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "Br",
                    "location": [
                        14.425,
                        5.1,
                        0
                    ]
                }
            ]
        },
        "mol3": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "I",
                    "location": [
                        14.425,
                        6,
                        0
                    ]
                }
            ]
        },
        "mol4": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "C",
                    "location": [
                        16.125,
                        5.15,
                        0
                    ]
                }
            ]
        },
        "mol5": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "N",
                    "location": [
                        16.125,
                        6.9,
                        0
                    ]
                }
            ]
        },
        "mol6": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "P",
                    "location": [
                        16.125,
                        5.975,
                        0
                    ]
                }
            ]
        }
    }`
export const moleculeRgroupKet = `{
        "root": {
            "nodes": [
                {
                    "$ref": "rg14"
                }
            ]
        },
        "rg14": {
            "rlogic": {
                "number": 14
            },
            "type": "rgroup",
            "atoms": [
                {
                    "label": "C",
                    "location": [
                        9.775,
                        -28.375,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.8500000000000005,
                        -26.5,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        10.525,
                        -26.35,
                        0
                    ]
                },
                {
                    "type": "rg-label",
                    "location": [
                        8.716025403784439,
                        -27,
                        0
                    ],
                    "$refs": [
                        "rg-5"
                    ]
                }
            ],
            "bonds": [
                {
                    "type": 1,
                    "atoms": [
                        1,
                        3
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        3,
                        0
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        3,
                        2
                    ]
                }
            ]
        }
    }`
export const rxnKet = `{
        "root": {
            "nodes": [
                {
                    "$ref": "mol0"
                },
                {
                    "type": "plus",
                    "location": [
                        7.049999999999999,
                        5.25,
                        0
                    ],
                    "prop": {}
                },
                {
                    "$ref": "mol1"
                },
                {
                    "type": "arrow",
                    "data": {
                        "mode": "open-angle",
                        "pos": [
                            {
                                "x": 9.2,
                                "y": 5.325,
                                "z": 0
                            },
                            {
                                "x": 11.2,
                                "y": 5.325,
                                "z": 0
                            }
                        ]
                    }
                },
                {
                    "$ref": "mol2"
                },
                {
                    "type": "plus",
                    "location": [
                        13.25,
                        5.275,
                        0
                    ],
                    "prop": {}
                },
                {
                    "$ref": "mol3"
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "O",
                    "location": [
                        6.299999999999999,
                        5.375,
                        0
                    ]
                }
            ],
            "stereoFlagPosition": {
                "x": 6.299999999999999,
                "y": 4.375,
                "z": 0
            }
        },
        "mol1": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "Na",
                    "location": [
                        7.899999999999999,
                        5.35,
                        0
                    ]
                }
            ],
            "stereoFlagPosition": {
                "x": 7.899999999999999,
                "y": 4.35,
                "z": 0
            }
        },
        "mol2": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "N",
                    "location": [
                        12.075,
                        5.325,
                        0
                    ]
                }
            ],
            "stereoFlagPosition": {
                "x": 12.075,
                "y": 4.325,
                "z": 0
            }
        },
        "mol3": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "H",
                    "location": [
                        14.125,
                        5.225,
                        0
                    ]
                }
            ],
            "stereoFlagPosition": {
                "x": 14.125,
                "y": 4.225,
                "z": 0
            }
        }
    }`
export const simpleObjectKet = `{
        "root": {
            "nodes": [
                {
                    "type": "simpleObject",
                    "data": {
                        "mode": "ellipse",
                        "pos": [
                            {
                                "x": 2.975,
                                "y": 0.8,
                                "z": 0
                            },
                            {
                                "x": 5.45,
                                "y": 2.475,
                                "z": 0
                            }
                        ]
                    }
                }
            ]
        }
    }`
export const textKet = `{
        "root": {
            "nodes": [
                {
                    "type": "text",
                    "data": {
                        "content": "{\\"blocks\\":[{\\"key\\":\\"5vn7d\\",\\"text\\":\\"Text Test\\",\\"type\\":\\"unstyled\\",\\"depth\\":0,\\"inlineStyleRanges\\":[{\\"offset\\":0,\\"length\\":4,\\"style\\":\\"CUSTOM_FONT_SIZE_20px\\"},{\\"offset\\":5,\\"length\\":4,\\"style\\":\\"BOLD\\"}],\\"entityRanges\\":[],\\"data\\":{}}],\\"entityMap\\":{}}",
                        "position": {
                            "x": 4.325,
                            "y": 0.325,
                            "z": 0
                        }
                    }
                }
            ]
        }
    }`
export const moleculeKet = `{
        "root": {
            "nodes": [
                {
                    "$ref": "mol0"
                },
                {
                    "$ref": "mol1"
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "type": "rg-label",
                    "location": [
                        3.875000000000001,
                        -12.375000000000002,
                        0
                    ],
                    "$refs": [
                        "rg-20"
                    ]
                }
            ]
        },
        "mol1": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "C",
                    "location": [
                        3.5999853329568783,
                        -12.075000000000001,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        4.09999266647844,
                        -12.941012701659345,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        5.100007333521562,
                        -12.941012701659345,
                        0
                    ],
                    "charge": 5
                },
                {
                    "label": "C",
                    "location": [
                        5.600014667043123,
                        -12.075000000000001,
                        0
                    ],
                    "stereoLabel": "abs"
                },
                {
                    "type": "atom-list",
                    "location": [
                        5.100007333521562,
                        -11.208987298340658,
                        0
                    ],
                    "elements": [
                        "Be",
                        "Li"
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        4.09999266647844,
                        -11.208987298340658,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        6.600014667043123,
                        -12.075000000000001,
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
                },
                {
                    "type": 2,
                    "atoms": [
                        1,
                        2
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        2,
                        3
                    ]
                },
                {
                    "type": 2,
                    "atoms": [
                        3,
                        4
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        4,
                        5
                    ]
                },
                {
                    "type": 2,
                    "atoms": [
                        5,
                        0
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        3,
                        6
                    ],
                    "stereo": 1
                }
            ]
        }
    }`
export const moleculeSgroupKet = `{
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
                    "$ref": "mol3"
                },
                {
                    "$ref": "mol4"
                },
                {
                    "$ref": "mol5"
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        5.175000000000001,
                        -24.450000000000003,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "GEN",
                    "atoms": [
                        0
                    ]
                }
            ]
        },
        "mol1": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        5.2,
                        -22.75,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "MUL",
                    "atoms": [
                        0
                    ],
                    "mul": 1
                }
            ]
        },
        "mol2": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        6.4,
                        -22.725,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "SRU",
                    "atoms": [
                        0
                    ],
                    "subscript": "n",
                    "connectivity": "HT"
                }
            ]
        },
        "mol3": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        6.775,
                        -24.525000000000002,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "MUL",
                    "atoms": [
                        0
                    ],
                    "mul": 3
                }
            ]
        },
        "mol4": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        7.95,
                        -24.425,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "SUP",
                    "atoms": [
                        0
                    ],
                    "name": "B"
                }
            ]
        },
        "mol5": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "S",
                    "location": [
                        8.1,
                        -22.450000000000003,
                        0
                    ]
                }
            ],
            "sgroups": [
                {
                    "type": "SRU",
                    "atoms": [
                        0
                    ],
                    "subscript": "n",
                    "connectivity": "HH"
                }
            ]
        }
    }`
export const preparedKet = `{
        "root": {
            "nodes": [
                {
                    "type": "simpleObject",
                    "data": {
                        "mode": "rectangle",
                        "pos": [
                            {
                                "x": 5.949999999999999,
                                "y": -11.3,
                                "z": 0
                            },
                            {
                                "x": 12.1,
                                "y": -6.750000000000001,
                                "z": 0
                            }
                        ]
                    }
                },
                {
                    "$ref": "mol0"
                },
                {
                    "type": "arrow",
                    "data": {
                        "mode": "open-angle",
                        "pos": [
                            {
                                "x": 9.05,
                                "y": -7.775000000000001,
                                "z": 0
                            },
                            {
                                "x": 11.05,
                                "y": -7.775000000000001,
                                "z": 0
                            }
                        ]
                    }
                },
                {
                    "type": "plus",
                    "location": [
                        9.725,
                        -9.025000000000002,
                        0
                    ],
                    "prop": {}
                },
                {
                    "type": "text",
                    "data": {
                        "content": "{\\"blocks\\":[{\\"key\\":\\"932pu\\",\\"text\\":\\"Test\\",\\"type\\":\\"unstyled\\",\\"depth\\":0,\\"inlineStyleRanges\\":[{\\"offset\\":0,\\"length\\":4,\\"style\\":\\"CUSTOM_FONT_SIZE_20px\\"},{\\"offset\\":0,\\"length\\":4,\\"style\\":\\"BOLD\\"}],\\"entityRanges\\":[],\\"data\\":{}}],\\"entityMap\\":{}}",
                        "pos": []
                    }
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "C",
                    "location": [
                        8,
                        -9.950014667043124,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        8.866012701659344,
                        -9.450007333521562,
                        0
                    ]
                },
                {
                    "type": "rg-label",
                    "location": [
                        8.866012701659344,
                        -8.44999266647844,
                        0
                    ],
                    "$refs": [
                        "rg-22"
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        8,
                        -7.949985332956879,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.133987298340656,
                        -8.44999266647844,
                        0
                    ]
                },
                {
                    "type": "rg-label",
                    "location": [
                        7.133987298340656,
                        -9.450007333521562,
                        0
                    ],
                    "$refs": [
                        "rg-10"
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
                },
                {
                    "type": 2,
                    "atoms": [
                        1,
                        2
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        2,
                        3
                    ]
                },
                {
                    "type": 2,
                    "atoms": [
                        3,
                        4
                    ]
                },
                {
                    "type": 1,
                    "atoms": [
                        4,
                        5
                    ]
                },
                {
                    "type": 2,
                    "atoms": [
                        5,
                        0
                    ]
                }
            ]
        }
    }`
export const errorKet = ` {
        "root": {
            "nodes": [
                {
                    "type": "simpleObject",
                    "data": {
                 "pos": [
                            {
                                "x": 5.800000000000001,
                                "y": -7.575,
                                "z": 0
                            },
                            {
                                "x": 8.875,
                                "y": -5.4,
                                "z": 0
                            }
                        ]
                    }
                }
            ]
        }
    }`
