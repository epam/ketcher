import {
  Atom,
  Bond,
  Fragment,
  HalfBond,
  Loop,
  RGroup,
  RxnArrow,
  RxnPlus,
  SGroup,
  SimpleObject,
  Struct,
  Text
} from '../../../../entities'

const structs = {
  prepareContent: {
    atoms: [
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 8,
          y: -9.950014667043124,
          z: 0
        },
        neighbors: [0, 11],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 8.866012701659344,
          y: -9.450007333521562,
          z: 0
        },
        neighbors: [1, 2],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'R#',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 0,
        implicitH: 0,
        pp: {
          x: 8.866012701659344,
          y: -8.44999266647844,
          z: 0
        },
        neighbors: [3, 4],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: 2097152,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 8,
          y: -7.949985332956879,
          z: 0
        },
        neighbors: [6, 5],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 7.133987298340656,
          y: -8.44999266647844,
          z: 0
        },
        neighbors: [8, 7],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'R#',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 0,
        implicitH: 0,
        pp: {
          x: 7.133987298340656,
          y: -9.450007333521562,
          z: 0
        },
        neighbors: [10, 9],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: 512,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    ],
    bonds: [
      {
        begin: 0,
        end: 1,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 0,
        hb2: 1,
        angle: 30.00072778082745,
        center: {
          x: 8.433006350829675,
          y: -9.700011000282347,
          z: 0
        }
      },
      {
        begin: 1,
        end: 2,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 40.00058668172488,
        sb: 10,
        sa: 16.00029334086244,
        hb1: 2,
        hb2: 3,
        angle: 90,
        center: {
          x: 8.866012701659347,
          y: -8.950000000000005,
          z: 0
        }
      },
      {
        begin: 2,
        end: 3,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 4,
        hb2: 5,
        angle: 149.99927221917258,
        center: {
          x: 8.433006350829675,
          y: -8.199988999717663,
          z: 0
        }
      },
      {
        begin: 3,
        end: 4,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 6,
        hb2: 7,
        angle: -149.99927221917264,
        center: {
          x: 7.566993649170332,
          y: -8.199988999717663,
          z: 0
        }
      },
      {
        begin: 4,
        end: 5,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 40.00058668172488,
        sb: 10,
        sa: 16.00029334086244,
        hb1: 8,
        hb2: 9,
        angle: -90,
        center: {
          x: 7.133987298340659,
          y: -8.950000000000005,
          z: 0
        }
      },
      {
        begin: 5,
        end: 0,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 10,
        hb2: 11,
        angle: -30.00072778082742,
        center: {
          x: 7.566993649170332,
          y: -9.700011000282347,
          z: 0
        }
      }
    ],
    frags: [
      {
        stereoAtoms: []
      }
    ],
    halfBonds: [
      {
        begin: 0,
        end: 1,
        bid: 0
      },
      {
        begin: 1,
        end: 0,
        bid: 0
      },
      {
        begin: 1,
        end: 2,
        bid: 1
      },
      {
        begin: 2,
        end: 1,
        bid: 1
      },
      {
        begin: 2,
        end: 3,
        bid: 2
      },
      {
        begin: 3,
        end: 2,
        bid: 2
      },
      {
        begin: 3,
        end: 4,
        bid: 3
      },
      {
        begin: 4,
        end: 3,
        bid: 3
      },
      {
        begin: 4,
        end: 5,
        bid: 4
      },
      {
        begin: 5,
        end: 4,
        bid: 4
      },
      {
        begin: 5,
        end: 0,
        bid: 5
      },
      {
        begin: 0,
        end: 5,
        bid: 5
      }
    ],
    loops: [
      {
        aromatic: false,
        convex: true,
        dblBonds: 3,
        hbs: [1, 11, 9, 7, 5, 3]
      }
    ],
    rxnArrows: [
      {
        mode: 'open-angle',
        pos: [
          {
            x: 9.05,
            y: -7.775000000000001,
            z: 0
          },
          {
            x: 11.05,
            y: -7.775000000000001,
            z: 0
          }
        ]
      }
    ],
    rxnPluses: [
      {
        pp: {
          x: 9.725,
          y: -9.025000000000002,
          z: 0
        }
      }
    ],
    simpleObjects: [
      {
        mode: 'rectangle',
        pos: [
          {
            x: 5.949999999999999,
            y: -11.3,
            z: 0
          },
          {
            x: 12.1,
            y: -6.750000000000001,
            z: 0
          }
        ]
      }
    ],
    texts: [
      {
        content:
          '{"blocks":[{"key":"932pu","text":"Test","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":4,"style":"CUSTOM_FONT_SIZE_20px"},{"offset":0,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{}}],"entityMap":{}}',
        position: {
          x: 11.575000000000001,
          y: -6.125000000000001,
          z: 0
        }
      }
    ]
  },
  moleculeSgroup: {
    atoms: [
      {
        label: 'S',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 3.841456392727846,
          y: -18.14948962361272,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'S',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 3.8600141530791876,
          y: -16.887561919721445,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'S',
        fragment: 2,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 4.750786649943616,
          y: -16.869004159370103,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'S',
        fragment: 3,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 5.029153055213749,
          y: -18.205162904666746,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'S',
        fragment: 4,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 5.901367791726835,
          y: -18.130931863261377,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'S',
        fragment: 5,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 2,
        implicitH: 2,
        pp: {
          x: 6.012714353834888,
          y: -16.664868795505342,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    ],
    frags: [{}, {}, {}, {}, {}, {}],
    sgroups: [
      {
        type: 'GEN',
        id: 0,
        label: -1,
        bracketBox: {
          p0: {
            x: 3.4914563927278457,
            y: -18.699489623612717,
            z: 0
          },
          p1: {
            x: 4.191456392727845,
            y: -17.599489623612723,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 3.4914563927278457,
              y: -18.699489623612717,
              z: 0
            },
            p1: {
              x: 4.191456392727845,
              y: -17.599489623612723,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [0],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 1,
          connectivity: 'ht',
          name: '',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      },
      {
        type: 'MUL',
        id: 1,
        label: -1,
        bracketBox: {
          p0: {
            x: 3.5100141530791875,
            y: -17.437561919721443,
            z: 0
          },
          p1: {
            x: 4.210014153079188,
            y: -16.33756191972145,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 3.5100141530791875,
              y: -17.437561919721443,
              z: 0
            },
            p1: {
              x: 4.210014153079188,
              y: -16.33756191972145,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [1],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 1,
          connectivity: 'ht',
          name: '',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      },
      {
        type: 'SRU',
        id: 2,
        label: -1,
        bracketBox: {
          p0: {
            x: 4.4007866499436155,
            y: -17.4190041593701,
            z: 0
          },
          p1: {
            x: 5.1007866499436165,
            y: -16.319004159370106,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 4.4007866499436155,
              y: -17.4190041593701,
              z: 0
            },
            p1: {
              x: 5.1007866499436165,
              y: -16.319004159370106,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [2],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 1,
          connectivity: 'ht',
          name: '',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      },
      {
        type: 'MUL',
        id: 3,
        label: -1,
        bracketBox: {
          p0: {
            x: 4.679153055213749,
            y: -18.755162904666744,
            z: 0
          },
          p1: {
            x: 5.37915305521375,
            y: -17.65516290466675,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 4.679153055213749,
              y: -18.755162904666744,
              z: 0
            },
            p1: {
              x: 5.37915305521375,
              y: -17.65516290466675,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [3],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 3,
          connectivity: 'ht',
          name: '',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      },
      {
        type: 'SUP',
        id: 4,
        label: -1,
        bracketBox: {
          p0: {
            x: 5.551367791726834,
            y: -18.680931863261375,
            z: 0
          },
          p1: {
            x: 6.251367791726835,
            y: -17.58093186326138,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 5.551367791726834,
              y: -18.680931863261375,
              z: 0
            },
            p1: {
              x: 6.251367791726835,
              y: -17.58093186326138,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [4],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 1,
          connectivity: 'ht',
          name: 'B',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      },
      {
        type: 'SRU',
        id: 5,
        label: -1,
        bracketBox: {
          p0: {
            x: 5.662714353834888,
            y: -17.21486879550534,
            z: 0
          },
          p1: {
            x: 6.362714353834889,
            y: -16.114868795505345,
            z: 0
          }
        },
        bracketDir: {
          x: 1,
          y: 0,
          z: 0
        },
        areas: [
          {
            p0: {
              x: 5.662714353834888,
              y: -17.21486879550534,
              z: 0
            },
            p1: {
              x: 6.362714353834889,
              y: -16.114868795505345,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [5],
        patoms: null,
        bonds: null,
        xBonds: [],
        neiAtoms: [],
        pp: null,
        data: {
          mul: 1,
          connectivity: 'hh',
          name: '',
          subscript: 'n',
          attached: false,
          absolute: true,
          showUnits: false,
          nCharsToDisplay: -1,
          tagChar: '',
          daspPos: 1,
          fieldType: 'F',
          fieldName: '',
          fieldValue: '',
          units: '',
          query: '',
          queryOp: ''
        }
      }
    ]
  },
  moleculeContent: {
    atoms: [
      {
        label: 'R#',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 0,
        implicitH: 0,
        pp: {
          x: 3.8750000000000027,
          y: -12.375000000000007,
          z: 0
        },
        neighbors: [],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: 524288,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 3.59998533295688,
          y: -12.075000000000006,
          z: 0
        },
        neighbors: [0, 11],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 4.099992666478442,
          y: -12.94101270165935,
          z: 0
        },
        neighbors: [2, 1],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 5,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 3,
        implicitH: 0,
        pp: {
          x: 5.100007333521565,
          y: -12.94101270165935,
          z: 0
        },
        neighbors: [4, 3],
        sgs: {},
        badConn: true,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 0,
        pp: {
          x: 5.6000146670431254,
          y: -12.075000000000006,
          z: 0
        },
        neighbors: [5, 12, 6],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: 'abs',
        stereoParity: 1,
        pseudo: ''
      },
      {
        label: 'L#',
        fragment: 1,
        atomList: {
          ids: [4, 3]
        },
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 0,
        implicitH: 0,
        pp: {
          x: 5.100007333521565,
          y: -11.208987298340663,
          z: 0
        },
        neighbors: [7, 8],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 1,
        pp: {
          x: 4.099992666478442,
          y: -11.208987298340663,
          z: 0
        },
        neighbors: [10, 9],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 1,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 3,
        pp: {
          x: 6.6000146670431254,
          y: -12.075000000000006,
          z: 0
        },
        neighbors: [13],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    ],
    bonds: [
      {
        begin: 1,
        end: 2,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 0,
        hb2: 1,
        angle: -59.9992722191726,
        center: {
          x: 3.849988999717661,
          y: -12.508006350829678,
          z: 0
        }
      },
      {
        begin: 2,
        end: 3,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 40.00058668172491,
        sb: 10,
        sa: 16.000293340862456,
        hb1: 2,
        hb2: 3,
        angle: 0,
        center: {
          x: 4.600000000000003,
          y: -12.94101270165935,
          z: 0
        }
      },
      {
        begin: 3,
        end: 4,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913752,
        sb: 10,
        sa: 15.999853329568761,
        hb1: 4,
        hb2: 5,
        angle: 59.99927221917264,
        center: {
          x: 5.350011000282345,
          y: -12.508006350829678,
          z: 0
        }
      },
      {
        begin: 4,
        end: 5,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913752,
        sb: 10,
        sa: 15.999853329568761,
        hb1: 6,
        hb2: 7,
        angle: 120.00072778082736,
        center: {
          x: 5.350011000282345,
          y: -11.641993649170335,
          z: 0
        }
      },
      {
        begin: 5,
        end: 6,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 40.00058668172491,
        sb: 10,
        sa: 16.000293340862456,
        hb1: 8,
        hb2: 9,
        angle: 180,
        center: {
          x: 4.600000000000003,
          y: -11.208987298340663,
          z: 0
        }
      },
      {
        begin: 6,
        end: 1,
        type: 2,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913754,
        sb: 10,
        sa: 15.999853329568769,
        hb1: 10,
        hb2: 11,
        angle: -120.00072778082742,
        center: {
          x: 3.849988999717661,
          y: -11.641993649170335,
          z: 0
        }
      },
      {
        begin: 4,
        end: 7,
        type: 1,
        xxx: '',
        stereo: 1,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99999999999997,
        sb: 10,
        sa: 15.999999999999986,
        hb1: 12,
        hb2: 13,
        angle: 0,
        center: {
          x: 6.1000146670431254,
          y: -12.075000000000006,
          z: 0
        }
      }
    ],
    frags: [{}, {}],
    halfBonds: [
      {
        begin: 1,
        end: 2,
        bid: 0,
        dir: {
          x: 0.5000110003630138,
          y: -0.8660190526287388,
          z: 0
        },
        norm: {
          x: 0.8660190526287388,
          y: 0.5000110003630138,
          z: 0
        },
        ang: -1.0471848490249267,
        p: {
          x: 143.9994133182752,
          y: -483.0000000000002,
          z: 0
        },
        loop: -2,
        contra: 1,
        next: 2,
        leftSin: -0.8660381056766504,
        leftCos: -0.4999779990319565,
        leftNeighbor: 11,
        rightSin: 0.8660381056766504,
        rightCos: -0.4999779990319565,
        rightNeighbor: 11
      },
      {
        begin: 2,
        end: 1,
        bid: 0,
        dir: {
          x: -0.5000110003630138,
          y: 0.8660190526287388,
          z: 0
        },
        norm: {
          x: -0.8660190526287388,
          y: -0.5000110003630138,
          z: 0
        },
        ang: 2.0944078045648666,
        p: {
          x: 163.99970665913767,
          y: -517.640508066374,
          z: 0
        },
        loop: 1,
        contra: 0,
        next: 11,
        leftSin: 0.8660190526287388,
        leftCos: -0.5000110003630138,
        leftNeighbor: 2,
        rightSin: -0.8660190526287388,
        rightCos: -0.5000110003630138,
        rightNeighbor: 2
      },
      {
        begin: 2,
        end: 3,
        bid: 1,
        dir: {
          x: 1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: 1,
          z: 0
        },
        ang: 0,
        p: {
          x: 163.99970665913767,
          y: -517.640508066374,
          z: 0
        },
        loop: -2,
        contra: 3,
        next: 4,
        leftSin: -0.8660190526287388,
        leftCos: -0.5000110003630138,
        leftNeighbor: 1,
        rightSin: 0.8660190526287388,
        rightCos: -0.5000110003630138,
        rightNeighbor: 1
      },
      {
        begin: 3,
        end: 2,
        bid: 1,
        dir: {
          x: -1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: -1,
          z: 0
        },
        ang: 3.141592653589793,
        p: {
          x: 195.296875,
          y: -517.640508066374,
          z: 0
        },
        loop: 1,
        contra: 2,
        next: 1,
        leftSin: 0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 4,
        rightSin: -0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 4
      },
      {
        begin: 3,
        end: 4,
        bid: 2,
        dir: {
          x: 0.5000110003630132,
          y: 0.8660190526287391,
          z: 0
        },
        norm: {
          x: -0.8660190526287391,
          y: 0.5000110003630132,
          z: 0
        },
        ang: 1.0471848490249274,
        p: {
          x: 210.73655269818875,
          y: -505.97330685948504,
          z: 0
        },
        loop: -2,
        contra: 5,
        next: 12,
        leftSin: -0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 3,
        rightSin: 0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 3
      },
      {
        begin: 4,
        end: 3,
        bid: 2,
        dir: {
          x: -0.5000110003630132,
          y: -0.8660190526287391,
          z: 0
        },
        norm: {
          x: 0.8660190526287391,
          y: -0.5000110003630132,
          z: 0
        },
        ang: -2.0944078045648657,
        p: {
          x: 224.00058668172503,
          y: -483.0000000000002,
          z: 0
        },
        loop: 1,
        contra: 4,
        next: 3,
        leftSin: 0.8660381056766496,
        leftCos: -0.4999779990319577,
        leftNeighbor: 6,
        rightSin: 0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 12
      },
      {
        begin: 4,
        end: 5,
        bid: 3,
        dir: {
          x: -0.5000110003630132,
          y: 0.8660190526287391,
          z: 0
        },
        norm: {
          x: -0.8660190526287391,
          y: -0.5000110003630132,
          z: 0
        },
        ang: 2.0944078045648657,
        p: {
          x: 224.00058668172503,
          y: -483.0000000000002,
          z: 0
        },
        loop: -2,
        contra: 7,
        next: 8,
        leftSin: 0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 12,
        rightSin: 0.8660381056766496,
        rightCos: -0.4999779990319577,
        rightNeighbor: 5
      },
      {
        begin: 5,
        end: 4,
        bid: 3,
        dir: {
          x: 0.5000110003630132,
          y: -0.8660190526287391,
          z: 0
        },
        norm: {
          x: 0.8660190526287391,
          y: 0.5000110003630132,
          z: 0
        },
        ang: -1.0471848490249274,
        p: {
          x: 210.1591179810984,
          y: -459.026576210515,
          z: 0
        },
        loop: 1,
        contra: 6,
        next: 5,
        leftSin: 0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 8,
        rightSin: -0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 8
      },
      {
        begin: 5,
        end: 6,
        bid: 4,
        dir: {
          x: -1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: -1,
          z: 0
        },
        ang: 3.141592653589793,
        p: {
          x: 192.7890625,
          y: -448.3594919336265,
          z: 0
        },
        loop: -2,
        contra: 9,
        next: 10,
        leftSin: -0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 7,
        rightSin: 0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 7
      },
      {
        begin: 6,
        end: 5,
        bid: 4,
        dir: {
          x: 1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: 1,
          z: 0
        },
        ang: 0,
        p: {
          x: 163.99970665913767,
          y: -448.3594919336265,
          z: 0
        },
        loop: 1,
        contra: 8,
        next: 7,
        leftSin: 0.8660190526287388,
        leftCos: -0.5000110003630138,
        leftNeighbor: 10,
        rightSin: -0.8660190526287388,
        rightCos: -0.5000110003630138,
        rightNeighbor: 10
      },
      {
        begin: 6,
        end: 1,
        bid: 5,
        dir: {
          x: -0.5000110003630138,
          y: -0.8660190526287388,
          z: 0
        },
        norm: {
          x: 0.8660190526287388,
          y: -0.5000110003630138,
          z: 0
        },
        ang: -2.0944078045648666,
        p: {
          x: 163.99970665913767,
          y: -448.3594919336265,
          z: 0
        },
        loop: -2,
        contra: 11,
        next: 0,
        leftSin: -0.8660190526287388,
        leftCos: -0.5000110003630138,
        leftNeighbor: 9,
        rightSin: 0.8660190526287388,
        rightCos: -0.5000110003630138,
        rightNeighbor: 9
      },
      {
        begin: 1,
        end: 6,
        bid: 5,
        dir: {
          x: 0.5000110003630138,
          y: 0.8660190526287388,
          z: 0
        },
        norm: {
          x: -0.8660190526287388,
          y: 0.5000110003630138,
          z: 0
        },
        ang: 1.0471848490249267,
        p: {
          x: 143.9994133182752,
          y: -483.0000000000002,
          z: 0
        },
        loop: 1,
        contra: 10,
        next: 9,
        leftSin: 0.8660381056766504,
        leftCos: -0.4999779990319565,
        leftNeighbor: 0,
        rightSin: -0.8660381056766504,
        rightCos: -0.4999779990319565,
        rightNeighbor: 0
      },
      {
        begin: 4,
        end: 7,
        bid: 6,
        dir: {
          x: 1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: 1,
          z: 0
        },
        ang: 0,
        p: {
          x: 224.00058668172503,
          y: -483.0000000000002,
          z: 0
        },
        loop: -2,
        contra: 13,
        next: 13,
        leftSin: 0.8660190526287391,
        leftCos: -0.5000110003630132,
        leftNeighbor: 5,
        rightSin: 0.8660190526287391,
        rightCos: -0.5000110003630132,
        rightNeighbor: 6
      },
      {
        begin: 7,
        end: 4,
        bid: 6,
        dir: {
          x: -1,
          y: 0,
          z: 0
        },
        norm: {
          x: 0,
          y: -1,
          z: 0
        },
        ang: 3.141592653589793,
        p: {
          x: 255.296875,
          y: -483.0000000000002,
          z: 0
        },
        loop: -2,
        contra: 12,
        next: 6,
        leftSin: 0,
        leftCos: 1,
        leftNeighbor: 13,
        rightSin: 0,
        rightCos: 1,
        rightNeighbor: 13
      }
    ],
    loops: [
      {
        hbs: [1, 11, 9, 7, 5, 3],
        dblBonds: 3,
        aromatic: false,
        convex: true
      }
    ]
  },
  contentRgroup: {
    atoms: [
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 3,
        pp: {
          x: 6.295977383084059,
          y: -18.276046879284927,
          z: 0
        },
        neighbors: [3],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 3,
        pp: {
          x: 5.0561045992030555,
          y: -17.068378583296937,
          z: 0
        },
        neighbors: [0],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'C',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 4,
        implicitH: 3,
        pp: {
          x: 6.779044701479256,
          y: -16.9717651196179,
          z: 0
        },
        neighbors: [5],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: false,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      },
      {
        label: 'R#',
        fragment: 0,
        atomList: null,
        attpnt: null,
        isotope: 0,
        hCount: 0,
        radical: 0,
        charge: 0,
        explicitValence: -1,
        ringBondCount: 0,
        unsaturatedAtom: 0,
        substitutionCount: 0,
        valence: 0,
        implicitH: 0,
        pp: {
          x: 5.61390269182741,
          y: -17.39042346222707,
          z: 0
        },
        neighbors: [2, 4, 1],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: 16,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    ],
    bonds: [
      {
        begin: 1,
        end: 3,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 25.763590314410468,
        sb: 10,
        sa: 10,
        hb1: 0,
        hb2: 1,
        angle: -30.000000000000107,
        center: {
          x: 5.335003645515233,
          y: -17.229401022762005,
          z: 0
        }
      },
      {
        begin: 3,
        end: 0,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 44.71339345286321,
        sb: 10,
        sa: 18.356696726431604,
        hb1: 2,
        hb2: 3,
        angle: -52.3978539651543,
        center: {
          x: 5.954940037455735,
          y: -17.833235170755998,
          z: 0
        }
      },
      {
        begin: 3,
        end: 2,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 49.52301623272636,
        sb: 10,
        sa: 20.76150811636318,
        hb1: 4,
        hb2: 5,
        angle: 19.764356704830575,
        center: {
          x: 6.196473696653333,
          y: -17.181094290922484,
          z: 0
        }
      }
    ],
    frags: [{}],
    halfBonds: [
      {
        begin: 1,
        end: 3,
        bid: 0,
        dir: {
          x: 0.8660254037844377,
          y: -0.5000000000000017,
          z: 0
        },
        norm: {
          x: 0.5000000000000017,
          y: 0.8660254037844377,
          z: 0
        },
        ang: -0.5235987755983007,
        p: {
          x: 210.62035161513774,
          y: -687.5711259776593,
          z: 0
        },
        loop: -2,
        contra: 1,
        next: 2,
        leftSin: 0,
        leftCos: 1,
        leftNeighbor: 0,
        rightSin: 0,
        rightCos: 1,
        rightNeighbor: 0
      },
      {
        begin: 3,
        end: 1,
        bid: 0,
        dir: {
          x: -0.8660254037844377,
          y: 0.5000000000000017,
          z: 0
        },
        norm: {
          x: -0.5000000000000017,
          y: -0.8660254037844377,
          z: 0
        },
        ang: 2.6179938779914926,
        p: {
          x: 212.77027338486224,
          y: -688.8123838901464,
          z: 0
        },
        loop: -2,
        contra: 0,
        next: 0,
        leftSin: 0.7633943462491906,
        leftCos: -0.6459327148509905,
        leftNeighbor: 4,
        rightSin: 0.3810357468655825,
        rightCos: -0.9245603060972215,
        rightNeighbor: 2
      },
      {
        begin: 3,
        end: 0,
        bid: 1,
        dir: {
          x: 0.6101748389781176,
          y: -0.7922667895841831,
          z: 0
        },
        norm: {
          x: 0.7922667895841831,
          y: 0.6101748389781176,
          z: 0
        },
        ang: -0.9145150726711087,
        p: {
          x: 232.55059853710614,
          y: -705.9971921583367,
          z: 0
        },
        loop: -2,
        contra: 3,
        next: 3,
        leftSin: 0.3810357468655825,
        leftCos: -0.9245603060972215,
        leftNeighbor: 1,
        rightSin: 0.9519275648692003,
        rightCos: 0.3063232136848175,
        rightNeighbor: 4
      },
      {
        begin: 0,
        end: 3,
        bid: 1,
        dir: {
          x: -0.6101748389781176,
          y: 0.7922667895841831,
          z: 0
        },
        norm: {
          x: -0.7922667895841831,
          y: -0.6101748389781176,
          z: 0
        },
        ang: 2.2270775809186847,
        p: {
          x: 244.69992564408753,
          y: -721.772192646355,
          z: 0
        },
        loop: -2,
        contra: 2,
        next: 4,
        leftSin: 0,
        leftCos: 1,
        leftNeighbor: 3,
        rightSin: 0,
        rightCos: 1,
        rightNeighbor: 3
      },
      {
        begin: 3,
        end: 2,
        bid: 2,
        dir: {
          x: 0.9410913133210036,
          y: 0.3381525395317158,
          z: 0
        },
        norm: {
          x: -0.3381525395317158,
          y: 0.9410913133210036,
          z: 0
        },
        ang: 0.34495309903791055,
        p: {
          x: 236.639365253284,
          y: -691.2751873978551,
          z: 0
        },
        loop: -2,
        contra: 5,
        next: 5,
        leftSin: 0.9519275648692003,
        leftCos: 0.3063232136848175,
        leftNeighbor: 2,
        rightSin: 0.7633943462491906,
        rightCos: -0.6459327148509905,
        rightNeighbor: 1
      },
      {
        begin: 2,
        end: 3,
        bid: 2,
        dir: {
          x: -0.9410913133210036,
          y: -0.3381525395317158,
          z: 0
        },
        norm: {
          x: 0.3381525395317158,
          y: -0.9410913133210036,
          z: 0
        },
        ang: -2.7966395545518825,
        p: {
          x: 262.68875974671596,
          y: -681.9151297960772,
          z: 0
        },
        loop: -2,
        contra: 4,
        next: 1,
        leftSin: 0,
        leftCos: 1,
        leftNeighbor: 5,
        rightSin: 0,
        rightCos: 1,
        rightNeighbor: 5
      }
    ],
    rgroups: [
      {
        frags: {},
        resth: false,
        range: '',
        ifthen: 0
      }
    ]
  }
}

const initStruct = structName => {
  const structData = structs[structName]
  const struct = new Struct()
  Object.keys(structData).forEach(key => {
    switch (key) {
      case 'atoms':
        structData.atoms.forEach(props => struct.atoms.add(new Atom(props)))
        break
      case 'bonds':
        structData.bonds.forEach(props => struct.bonds.add(new Bond(props)))
        break
      case 'frags':
        structData.frags.forEach(props =>
          struct.frags.add(new Fragment(props.stereoAtoms))
        )
        break
      case 'halfBonds':
        structData.halfBonds.forEach(props =>
          struct.halfBonds.add(new HalfBond(props.begin, props.end, props.bid))
        )
        break
      case 'loops':
        structData.loops.forEach(props =>
          struct.loops.add(new Loop(props.hbs, struct, props.convex))
        )
        break
      case 'rxnArrows':
        structData.rxnArrows.forEach(props =>
          struct.rxnArrows.add(new RxnArrow(props))
        )
        break
      case 'rxnPluses':
        structData.rxnPluses.forEach(props =>
          struct.rxnPluses.add(new RxnPlus(props))
        )
        break
      case 'simpleObjects':
        structData.simpleObjects.forEach(props =>
          struct.simpleObjects.add(new SimpleObject(props))
        )
        break
      case 'sgroups':
        structData.sgroups.forEach(props =>
          struct.sgroups.add(new SGroup(props.type))
        )
        break
      case 'rgroups':
        structData.rgroups.forEach(props =>
          struct.rgroups.add(new RGroup(props))
        )
        break
      case 'texts':
        structData.texts.forEach(props => struct.texts.add(new Text(props)))
        break
    }
  })
  return struct
}

export const baseContent = ` {
        "root": {
            "nodes": [
                {
                    "$ref": "mol0"
                }
            ]
        },
        "mol0": {
            "type": "molecule",
            "atoms": [
                {
                    "label": "C",
                    "location": [
                        7.125,
                        5.774985332956876,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.991012701659344,
                        6.274992666478439,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.991012701659344,
                        7.27500733352156,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.125,
                        7.775014667043123,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        6.2589872983406565,
                        7.27500733352156,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        6.2589872983406565,
                        6.274992666478439,
                        0
                    ],
                    "stereoLabel": "abs"
                },
                {
                    "label": "C",
                    "location": [
                        5.392958719030766,
                        5.774998166690199,
                        0
                    ]
                },
                {
                    "label": "C",
                    "location": [
                        7.125,
                        4.774985332956876,
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
                        5,
                        6
                    ],
                    "stereo": 1
                },
                {
                    "type": 1,
                    "atoms": [
                        0,
                        7
                    ]
                }
            ],
            "stereoFlagPosition": {
                "x": 7.991012701659344,
                "y": 3.7749853329568763,
                "z": 0
            }
        }
    }`
export const contentWithoutHeader = `{
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
export const contentRgroup = `{
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
export const newContentRgroup = initStruct('contentRgroup')
export const rxnContent = `{
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
export const simpleObjectContent = `{
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
export const textContent = `{
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
export const moleculeContent = `{
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
export const newMoleculeContent = initStruct('moleculeContent')
export const moleculeSgroup = `{
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
export const newMoleculeSgroup = initStruct('moleculeSgroup')
export const prepareContent = `{
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
                        "position": {
                            "x": 11.575000000000001,
                            "y": -6.125000000000001,
                            "z": 0
                        }
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
export const newPrepareStruct = initStruct('prepareContent')
export const errorContent = ` {
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
