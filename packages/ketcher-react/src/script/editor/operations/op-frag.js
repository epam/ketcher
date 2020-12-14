import Vec2 from '../../util/vec2'
import { Fragment } from '../../chem/struct'
import { ReFrag, ReEnhancedFlag } from '../../render/restruct'

import Base, { invalidateItem } from './base'

function FragmentAdd(frid) {
  this.frid = typeof frid === 'undefined' ? null : frid

  this.execute = function (restruct) {
    const struct = restruct.molecule
    const frag = new Fragment()

    if (this.frid === null) this.frid = struct.frags.add(frag)
    else struct.frags.set(this.frid, frag)

    restruct.frags.set(this.frid, new ReFrag(frag)) // TODO add ReStruct.notifyFragmentAdded
    restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag(null, null))
  }

  this.invert = function () {
    return new FragmentDelete(this.frid)
  }
}
FragmentAdd.prototype = new Base()

function FragmentDelete(frid) {
  this.frid = frid

  this.execute = function (restruct) {
    const struct = restruct.molecule
    if (!struct.frags.get(this.frid)) return
    invalidateItem(restruct, 'frags', this.frid, 1)
    restruct.frags.delete(this.frid)
    struct.frags.delete(this.frid) // TODO add ReStruct.notifyFragmentRemoved

    restruct.clearVisel(restruct.enhancedFlags.get(this.frid).visel)
    restruct.enhancedFlags.delete(this.frid)
  }

  this.invert = function () {
    return new FragmentAdd(this.frid)
  }
}
FragmentDelete.prototype = new Base()

function FragmentStereoFlag(frid, flag = false) {
  this.frid = frid
  this.flag = flag
  this.invert_flag = null

  this.execute = function (restruct) {
    const struct = restruct.molecule

    const frag = struct.frags.get(this.frid)
    if (!this.invert_flag) this.invert_flag = frag.enhancedStereoFlag
    frag.updateStereoFlag(struct, this.flag)

    invalidateEnhancedFlag(restruct, this.frid, frag.enhancedStereoFlag)
  }

  this.invert = function () {
    const ret = new FragmentStereoFlag(this.frid)
    ret.flag = this.invert_flag
    ret.invert_flag = this.flag
    return ret
  }
}
FragmentStereoFlag.prototype = new Base()

// todo : merge add and delete stereo atom
function FragmentAddStereoAtom(frid, aid) {
  this.data = { frid, aid }

  this.execute = function (restruct) {
    const frag = restruct.molecule.frags.get(this.data.frid)
    frag.updateStereoAtom(restruct.molecule, this.data.aid, true)

    invalidateEnhancedFlag(restruct, this.data.frid, frag.enhancedStereoFlag)
  }

  this.invert = function () {
    return new FragmentDeleteStereoAtom(this.data.frid, this.data.aid)
  }
}
FragmentAddStereoAtom.prototype = new Base()

function FragmentDeleteStereoAtom(frid, aid) {
  this.data = { frid, aid }

  this.execute = function (restruct) {
    const frag = restruct.molecule.frags.get(this.data.frid)
    frag.updateStereoAtom(restruct.molecule, this.data.aid, false)

    invalidateEnhancedFlag(restruct, this.data.frid, frag.enhancedStereoFlag)
  }

  this.invert = function () {
    return new FragmentAddStereoAtom(this.data.frid, this.data.aid)
  }
}
FragmentDeleteStereoAtom.prototype = new Base()

function invalidateEnhancedFlag(restruct, frid, flag) {
  const reEnhancedFlag = restruct.enhancedFlags.get(frid)
  if (reEnhancedFlag.flag === flag) return

  reEnhancedFlag.flag = flag
  invalidateItem(restruct, 'enhancedFlags', frid, 1)
}

function EnhancedFlagMove(frid, p) {
  this.data = { frid, p }

  this.execute = function (restruct) {
    if (!this.data.p) {
      const bb = restruct.molecule
        .getFragment(this.data.frid)
        .getCoordBoundingBox()
      this.data.p = new Vec2(bb.max.x, bb.min.y - 1)
    }
    const enhancedFlag = restruct.enhancedFlags.get(this.data.frid)
    if (enhancedFlag?.pp) {
      enhancedFlag.pp.add_(this.data.p)
    }

    this.data.p = this.data.p.negated()
    invalidateItem(restruct, 'enhancedFlags', this.data.frid, 1)
  }

  this.invert = function () {
    const ret = new EnhancedFlagMove()
    ret.data = this.data
    return ret
  }
}
EnhancedFlagMove.prototype = new Base()

export {
  FragmentAdd,
  FragmentDelete,
  FragmentStereoFlag,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
  EnhancedFlagMove
}
