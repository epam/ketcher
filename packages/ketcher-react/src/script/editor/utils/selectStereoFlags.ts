export function selectStereoFlags(atoms: any, expAtoms: number[]): number[] {
  const atomsOfFragments = {}
  atoms.forEach((atom, atomId) => {
    atomsOfFragments[atom.fragment]
      ? atomsOfFragments[atom.fragment].push(atomId)
      : (atomsOfFragments[atom.fragment] = [atomId])
  })

  const stereoFlags: number[] = []

  Object.keys(atomsOfFragments).forEach((fragId) => {
    let shouldSelSFlag = true
    atomsOfFragments[fragId].forEach((atomId) => {
      if (!expAtoms.includes(atomId)) shouldSelSFlag = false
    })
    shouldSelSFlag && stereoFlags.push(Number(fragId))
  })
  return stereoFlags
}
