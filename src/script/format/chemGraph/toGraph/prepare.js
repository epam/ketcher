import Pile from '../../../util/pile'
import Vec2 from '../../../util/vec2'

export function prepareStructForGraph(struct) {
  const graphNodes = []

  const rgFrags = new Set() // skip this when writing molecules
  for (const [rgnumber, rgroup] of struct.rgroups.entries()) {
    // RGroups writing
    rgroup.frags.forEach(frid => rgFrags.add(frid))

    const fragsAtoms = Array.from(rgroup.frags.values()).reduce(
      (res, frid) => res.union(struct.getFragmentIds(frid)),
      new Pile()
    )

    graphNodes.push({
      type: 'rgroup',
      fragment: struct.clone(fragsAtoms),
      center: getFragmentCenter(struct, fragsAtoms),
      data: { rgnumber, rgroup }
    })
  }

  const molFrags = Array.from(struct.frags.keys()).filter(
    fid => !rgFrags.has(fid)
  )
  for (const fid of molFrags) {
    // Molecules writing
    const fragsAtoms = struct.getFragmentIds(fid)

    graphNodes.push({
      type: 'molecule',
      fragment: struct.clone(fragsAtoms),
      center: getFragmentCenter(struct, fragsAtoms)
    })
  }

  struct.rxnArrows.forEach(item => {
    graphNodes.push({
      type: 'arrow',
      center: item.pp,
      data: {}
    })
  })

  struct.rxnPluses.forEach(item => {
    graphNodes.push({
      type: 'plus',
      center: item.pp,
      data: {}
    })
  })

  return graphNodes.sort((a, b) => a.center.x - b.center.x)
}

function getFragmentCenter(struct, atomSet) {
  const bb = struct.getCoordBoundingBox(atomSet)
  return Vec2.centre(bb.min, bb.max)
}
