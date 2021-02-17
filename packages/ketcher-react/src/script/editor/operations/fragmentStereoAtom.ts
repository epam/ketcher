import Restruct from '../../render/restruct'
import { BaseOperation } from './base'
import { OperationType } from './OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  frid: any
  aid: any
}

// todo : merge add and delete stereo atom
class FragmentAddStereoAtom extends BaseOperation {
  data: Data

  constructor(fragmentId: any, atomId: any) {
    super(OperationType.FRAGMENT_ADD_STEREO_ATOM)
    this.data = { frid: fragmentId, aid: atomId }
  }

  execute(restruct: Restruct) {
    const { aid, frid } = this.data

    const frag = restruct.molecule.frags.get(frid)
    frag.updateStereoAtom(restruct.molecule, aid, true)

    BaseOperation.invalidateEnhancedFlag(
      restruct,
      frid,
      frag.enhancedStereoFlag
    )
  }

  invert() {
    return new FragmentDeleteStereoAtom(this.data.frid, this.data.aid)
  }
}

class FragmentDeleteStereoAtom extends BaseOperation {
  data: Data

  constructor(fragmentId: any, atomId: any) {
    super(OperationType.FRAGMENT_DELETE_STEREO_ATOM)
    this.data = { frid: fragmentId, aid: atomId }
  }

  execute(restruct: Restruct) {
    const { aid, frid } = this.data

    const frag = restruct.molecule.frags.get(frid)
    frag.updateStereoAtom(restruct.molecule, aid, false)

    BaseOperation.invalidateEnhancedFlag(
      restruct,
      frid,
      frag.enhancedStereoFlag
    )
  }

  invert() {
    const { aid, frid } = this.data
    return new FragmentAddStereoAtom(frid, aid)
  }
}

export { FragmentAddStereoAtom, FragmentDeleteStereoAtom }
