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
} from 'domain/entities'

import { getNodeWithInvertedYCoord } from 'domain/serializers/ket/helpers'

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
          '{"blocks":[{"key":"dikr0","text":"Test text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        position: {
          x: 6.1250433921813965,
          y: -9.850043392181398,
          z: 0
        },
        pos: [
          {
            x: 6.1250433921813965,
            y: -9.850043392181398,
            z: 0
          },
          {
            x: 6.1250433921813965,
            y: -10.211157727241517,
            z: 0
          },
          {
            x: 7.334906673431396,
            y: -10.211157727241517,
            z: 0
          },
          {
            x: 7.334906673431396,
            y: -9.850043392181398,
            z: 0
          }
        ]
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
        type: 'GEN'
      },
      {
        type: 'MUL'
      },
      {
        type: 'SRU'
      },
      {
        type: 'MUL'
      },
      {
        type: 'SUP'
      },
      {
        type: 'SRU'
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
        bid: 0
      },
      {
        begin: 2,
        end: 1,
        bid: 0
      },
      {
        begin: 2,
        end: 3,
        bid: 1
      },
      {
        begin: 3,
        end: 2,
        bid: 1
      },
      {
        begin: 3,
        end: 4,
        bid: 2
      },
      {
        begin: 4,
        end: 3,
        bid: 2
      },
      {
        begin: 4,
        end: 5,
        bid: 3
      },
      {
        begin: 5,
        end: 4,
        bid: 3
      },
      {
        begin: 5,
        end: 6,
        bid: 4
      },
      {
        begin: 6,
        end: 5,
        bid: 4
      },
      {
        begin: 6,
        end: 1,
        bid: 5
      },
      {
        begin: 1,
        end: 6,
        bid: 5
      },
      {
        begin: 4,
        end: 7,
        bid: 6
      },
      {
        begin: 7,
        end: 4,
        bid: 6
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
    halfBonds: [
      {
        begin: 1,
        end: 3,
        bid: 0
      },
      {
        begin: 3,
        end: 1,
        bid: 0
      },
      {
        begin: 3,
        end: 0,
        bid: 1
      },
      {
        begin: 0,
        end: 3,
        bid: 1
      },
      {
        begin: 3,
        end: 2,
        bid: 2
      },
      {
        begin: 2,
        end: 3,
        bid: 2
      }
    ],
    frags: [{}],
    rgroups: [
      {
        id: 14,
        resth: false,
        range: '',
        ifthen: 0
      }
    ]
  }
}

const initStruct = (structName) => {
  const structData = structs[structName]
  const struct = new Struct()
  Object.keys(structData).forEach((key) => {
    switch (key) {
      case 'atoms':
        structData.atoms.forEach((props) => struct.atoms.add(new Atom(props)))
        break
      case 'bonds':
        structData.bonds.forEach((props) => struct.bonds.add(new Bond(props)))
        break
      case 'frags':
        structData.frags.forEach((props) =>
          struct.frags.add(new Fragment(props.stereoAtoms))
        )
        break
      case 'halfBonds':
        structData.halfBonds.forEach((props) =>
          struct.halfBonds.add(new HalfBond(props.begin, props.end, props.bid))
        )
        break
      case 'loops':
        structData.loops.forEach((props) =>
          struct.loops.add(new Loop(props.hbs, struct, props.convex))
        )
        break
      case 'rxnArrows':
        structData.rxnArrows.forEach((props) =>
          struct.rxnArrows.add(new RxnArrow(getNodeWithInvertedYCoord(props)))
        )
        break
      case 'rxnPluses':
        structData.rxnPluses.forEach((props) =>
          struct.rxnPluses.add(new RxnPlus(getNodeWithInvertedYCoord(props)))
        )
        break
      case 'simpleObjects':
        structData.simpleObjects.forEach((props) =>
          struct.simpleObjects.add(
            new SimpleObject(getNodeWithInvertedYCoord(props))
          )
        )
        break
      case 'sgroups':
        structData.sgroups.forEach((props) =>
          struct.sgroups.add(new SGroup(props.type))
        )
        break
      case 'rgroups':
        structData.rgroups.forEach(({ id, ...props }) => {
          const rGroup = new RGroup(props)
          struct.rgroups.set(id, rGroup)
          rGroup.frags.add(0)
        })
        break
      case 'texts':
        structData.texts.forEach((props) =>
          struct.texts.add(new Text(getNodeWithInvertedYCoord(props)))
        )
        break
    }
  })
  return struct
}

export const moleculeSgroupStruct = initStruct('moleculeSgroup')
export const contentRgroupStruct = initStruct('contentRgroup')
export const moleculeContentStruct = initStruct('moleculeContent')
export const prepareStruct = initStruct('prepareContent')
