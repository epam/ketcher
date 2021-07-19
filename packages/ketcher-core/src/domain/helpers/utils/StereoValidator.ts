import { Bond } from '../../entities/Bond'
import { Struct, Neighbor } from '../../entities/Struct'

function isCorrectStereoCenter(
  bond: Bond,
  beginNeighs: Array<Neighbor> | undefined,
  endNeighs: Array<Neighbor> | undefined,
  struct: Struct
) {
  const beginAtom = struct.atoms.get(bond.begin)

  let EndAtomNeigh: number | undefined = NaN

  if (endNeighs?.length === 2) {
    EndAtomNeigh =
      endNeighs[0].aid === bond.begin ? endNeighs[1].aid : endNeighs[0].aid
  }

  if (bond.stereo > 0) {
    if (
      endNeighs?.length === 1 &&
      beginNeighs?.length === 2 &&
      Number(beginAtom?.implicitH) % 2 === 0
    ) {
      return false
    }

    if (
      endNeighs?.length === 2 &&
      beginNeighs?.length === 2 &&
      Number(beginAtom?.implicitH) % 2 === 0 &&
      struct.atomGetNeighbors(EndAtomNeigh)?.length === 1
    ) {
      return false
    }

    if (beginNeighs?.length === 1) {
      return false
    }

    return true
  } else {
    return false
  }
}

export const StereoValidator = {
  isCorrectStereoCenter
}
