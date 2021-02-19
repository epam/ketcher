export interface Pool<TValue = any> extends Map<number, TValue> {
  add: (item: TValue) => number
  newId: () => number
  keyOf: (item: TValue) => number | null
  find: (predicate: (key: number, value: TValue) => boolean) => number | null
  filter: (predicate: (key: number, value: TValue) => boolean) => Pool<TValue>
}

export interface SGroupForest {
  parent: Map<number, number>
  children: Map<number, number[]>
  atomSets: Map<number, any>

  getSGroupsBFS: () => number[]

  getAtomSetRelations: (
    newId,
    atoms
  ) => {
    children: number[]
    parent: number
  }

  getPathToRoot: (sgid) => number[]

  insert: (
    item: {
      id: number
      atoms: number
    },
    parent?: number,
    children?: number[]
  ) => {
    children: number[]
    parent: number
  }

  remove: (id: number) => void
}

export interface Pile<TValue = any> extends Set<TValue> {
  find: (expression: (TValue) => boolean) => TValue | null
  equals: (set: Set<TValue>) => boolean
  isSuperset: (subset: Set<TValue>) => boolean
  filter: (expression: (TValue) => boolean) => Pile<TValue>
  union: (set: Pile<TValue>) => Pile<TValue>
}

// todo: find out all signatures
export interface Struct {
  // properties

  atoms: Pool
  bonds: Pool
  sgroups: Pool
  halfBonds: Pool
  loops: Pool
  isReaction: boolean
  rxnArrows: Pool
  rxnPluses: Pool
  frags: Pool
  rgroups: Pool
  name: string
  sGroupForest: SGroupForest
  simpleObjects: Pool

  // methods

  hasRxnProps: () => number | null
  hasRxnArrow: () => boolean
  isBlank: () => boolean

  clone: (
    atomSet?: Pile<number>,
    bondSet?: Pile<number>,
    dropRxnSymbols?: boolean,
    aidMap?: Map<number, number>,
    simpleObjectsSet?: Pile<number>
  ) => Struct
  getScaffold: () => Struct
  getFragmentIds: (fid) => Pile
  getFragment: (fid) => Struct

  mergeInto: (
    cp: Struct,
    atomSet?: Pile<number>,
    bondSet?: Pile<number>,
    dropRxnSymbols?: boolean,
    keepAllRGroups?: boolean,
    aidMap?: Map<number, number>,
    simpleObjectsSet?: Pile<number>
  ) => Struct

  findBondId: (begin: number, end: number) => number | null
  initNeighbors: () => void
  bondInitHalfBonds: (bid, bond) => void
  halfBondUpdate: (hbid) => void
  initHalfBonds: () => void
  setHbNext: (hbid, next) => void
  halfBondSetAngle: (hbid, left) => void
  atomAddNeighbor: (hbid) => void
  atomSortNeighbors: (aid) => void
  sortNeighbors: (list) => void
  atomUpdateHalfBonds: (aid) => void
  updateHalfBonds: (list) => void
  sGroupsRecalcCrossBonds: () => void
  sGroupDelete: (sgid) => void

  atomSetPos: (id, pp) => void
  rxnPlusSetPos: (id, pp) => void
  rxnArrowSetPos: (id, pp) => void
  simpleObjectSetPos: (id, pp) => void

  getCoordBoundingBox: (
    atomSet
  ) => {
    min: number
    max: number
  }
  getCoordBoundingBoxObj: () => {
    min: number
    max: number
  } | null

  getBondLengthData: () => {
    cnt: number
    totalLength: number
  }
  getAvgBondLength: () => number

  getAvgClosestAtomDistance: () => number
  checkBondExists: (begin, end) => boolean
  findConnectedComponent: (firstaid) => Pile
  findConnectedComponents: (discardExistingFragments) => Pile[]

  markFragment: (idSet: Pile<number>) => void
  markFragments: () => void

  scale: (scale: number) => void
  rescale: () => void

  loopHasSelfIntersections: (hbs) => boolean
  partitionLoop: (loop: any[]) => any[]
  halfBondAngle: (hbid1, hbid2) => number
  loopIsConvex: (loop: any[]) => boolean
  loopIsInner: (loop: any[]) => boolean
  findLoops: () => {
    newLoops: number[]
    bondsToMark: number[]
  }
  prepareLoopStructure: () => void
  atomAddToSGroup: (sgid, aid) => void
  calcConn: (atom) => [number, boolean]
  calcImplicitHydrogen: (aid) => void
  setImplicitHydrogen: (list) => void
  getComponents: () => {
    reactants: Pile<number>[]
    products: Pile<number>[]
  }
  defineRxnFragmentTypeForAtomset: (atomset, arrowpos) => 1 | 2
  getBondFragment: (bid: number) => number
}
