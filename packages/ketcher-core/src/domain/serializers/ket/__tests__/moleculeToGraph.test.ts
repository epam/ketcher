import { Atom, Bond, SGroup, Struct, Vec2, Fragment } from '../../../entities/'
import {
  moleculeToGraph,
  bondToGraph,
  sgroupToGraph
} from '../toGraph/moleculeToGraph'

const graphTest = {
  atoms: [
    {
      key: 0,
      value: {
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
        neighbors: [0, 11],
        sgs: {},
        badConn: false,
        alias: 'alias',
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    },
    {
      key: 1,
      value: {
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
        neighbors: [1, 28, 2],
        sgs: {},
        badConn: false,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 1,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    },
    {
      key: 2,
      value: {
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
        valence: 6,
        implicitH: 0,
        neighbors: [3, 27, 4],
        sgs: {},
        badConn: true,
        alias: null,
        rglabel: null,
        aam: 0,
        invRet: 0,
        exactChangeFlag: 0,
        rxnFragmentType: -1,
        stereoLabel: null,
        stereoParity: 0,
        pseudo: ''
      }
    }
  ],
  bonds: [
    {
      key: 0,
      value: {
        begin: 0,
        end: 1,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 39.99970665913752,
        sb: 10,
        sa: 15.999853329568761,
        hb1: 0,
        hb2: 1,
        angle: 30.000727780827386,
        center: {
          x: 8.083006350829672,
          y: 3.874988999717658,
          z: 0
        }
      }
    },
    {
      key: 1,
      value: {
        begin: 1,
        end: 2,
        type: 1,
        xxx: '',
        stereo: 0,
        topology: 0,
        reactingCenterStatus: 0,
        len: 40.00058668172494,
        sb: 10,
        sa: 16.00029334086247,
        hb1: 2,
        hb2: 3,
        angle: 90,
        center: {
          x: 8.516012701659344,
          y: 4.625,
          z: 0
        }
      }
    },
    {
      key: 2,
      value: {
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
          x: 8.083006350829672,
          y: 5.375011000282342,
          z: 0
        }
      }
    }
  ],
  frags: [
    {
      key: 1,
      value: {
        stereoAtoms: [],
        stereoFlagPosition: new Vec2()
      }
    },
    {
      key: 4,
      value: {
        stereoAtoms: []
      }
    },
    {
      key: 5,
      value: {
        stereoAtoms: []
      }
    }
  ],
  sgroups: [
    {
      key: 0,
      value: {
        type: 'MUL',
        id: 0,
        label: -1,
        bracketBox: {
          p0: {
            x: 8.866012701659344,
            y: -0.8999926664784388,
            z: 0
          },
          p1: {
            x: 12.875,
            y: 3.349992666478439,
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
              x: 8.866012701659344,
              y: -0.8999926664784388,
              z: 0
            },
            p1: {
              x: 12.875,
              y: 3.349992666478439,
              z: 0
            }
          }
        ],
        highlight: false,
        highlighting: null,
        selected: false,
        selectionPlate: null,
        atoms: [
          1,
          6,
          7,
          12,
          17,
          19,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          31,
          36,
          39,
          40,
          41,
          76,
          77,
          81,
          82
        ],
        patoms: [],
        bonds: [],
        xBonds: [
          0,
          1,
          7,
          15,
          19,
          28,
          39,
          41,
          51,
          52,
          54,
          56,
          100,
          102,
          111,
          113
        ],
        neiAtoms: [0, 2, 8, 13, 16, 15, 32, 33, 37, 38, 75, 72, 83, 79],
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
      }
    }
  ],
  loops: [
    {
      key: 15,
      value: {
        hbs: [15, 25, 23, 21, 19, 17],
        dblBonds: 3,
        aromatic: false,
        convex: true
      }
    },
    {
      key: 4,
      value: {
        hbs: [4, 47, 33, 45, 24, 13],
        dblBonds: 4,
        aromatic: false,
        convex: true
      }
    }
  ],
  rgroups: {},
  rxnArrows: {},
  rxnPluses: {},
  sGroupForest: {},
  simpleObjects: {},
  isReaction: false,
  texts: {},
  name: '',
  halfBonds: {}
}

const struct = new Struct()
graphTest.atoms.forEach(atom => {
  struct.atoms.add(new Atom(atom.value))
})
graphTest.bonds.forEach(item => {
  struct.bonds.add(new Bond(item.value))
})
graphTest.sgroups.forEach(item => {
  const sgroup = new SGroup(item.value.type)
  Object.keys(item).forEach(i => {
    sgroup.setAttr(i, item[i])
  })
  struct.sgroups.add(sgroup)
})

const structToGraph = moleculeToGraph(struct)
describe('MoleculeToGraph function', () => {
  it('Should have atoms', () => {
    expect(structToGraph.atoms[0]).toBeDefined()
  })

  it('Should return graph of bonds if bonds exist', () => {
    const bond1 = struct.bonds.get(0)
    const toGraph = bondToGraph(bond1)
    expect(structToGraph.bonds[0]).toStrictEqual(toGraph)
  })

  it('Should return graph of sgroups if it exists', () => {
    const sgroups1 = struct.sgroups.get(0)
    const toGraph = sgroupToGraph(struct, sgroups1)
    expect(structToGraph.sgroups[0]).toStrictEqual(toGraph)
  })

  it('stereoFlagPosition should be instance of Vec2 if fragment is passed and it is defined', () => {
    struct.frags.add(new Fragment(new Vec2()))
    const structToGraphWithDefinedStereoFlagPosition = moleculeToGraph(struct)
    expect(
      structToGraphWithDefinedStereoFlagPosition.stereoFlagPosition
    ).toBeInstanceOf(Vec2)
  })

  it('Should return undefined for stereoFlagPosition if fragment is passed and it is undefined', () => {
    expect(structToGraph.stereoFlagPosition).toBeUndefined()
  })
})
