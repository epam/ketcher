import Vec2 from '../../util/vec2'
import { Fragment } from '../../chem/struct'
import { ReFrag, ReEnhancedFlag } from '../../render/restruct'

import Base, { invalidateItem } from './base'

function FragmentAdd(frid) {
  this.frid = typeof frid === 'undefined' ? null : frid
}

FragmentAdd.prototype = new Base('Add fragment')

FragmentAdd.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  const frag = new Fragment()

  if (this.frid === null) this.frid = struct.frags.add(frag)
  else struct.frags.set(this.frid, frag)

  restruct.frags.set(this.frid, new ReFrag(frag)) // TODO add ReStruct.notifyFragmentAdded
  restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag(null, null))
}

FragmentAdd.prototype.invert = function () {
  return new FragmentDelete(this.frid)
}

function FragmentDelete(frid) {
  this.frid = frid
}

FragmentDelete.prototype = new Base('Delete fragment')

FragmentDelete.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  if (!struct.frags.get(this.frid)) return
  invalidateItem(restruct, 'frags', this.frid, 1)
  restruct.frags.delete(this.frid)
  struct.frags.delete(this.frid) // TODO add ReStruct.notifyFragmentRemoved

  restruct.clearVisel(restruct.enhancedFlags.get(this.frid).visel)
  restruct.enhancedFlags.delete(this.frid)
}

FragmentDelete.prototype.invert = function () {
  return new FragmentAdd(this.frid)
}

function FragmentStereoFlag(frid, flag = false) {
  this.frid = frid
  this.flag = flag
  this.invert_flag = null
}

FragmentStereoFlag.prototype = new Base('Add fragment stereo flag')

FragmentStereoFlag.prototype.execute = function (restruct) {
  const struct = restruct.molecule

  const frag = struct.frags.get(this.frid)
  if (!this.invert_flag) this.invert_flag = frag.enhancedStereoFlag
  frag.updateStereoFlag(struct, this.flag)

  invalidateEnhancedFlag(restruct, this.frid, frag.enhancedStereoFlag)
}

FragmentStereoFlag.prototype.invert = function () {
  const ret = new FragmentStereoFlag(this.frid)
  ret.flag = this.invert_flag
  ret.invert_flag = this.flag
  return ret
}

// todo : merge add and delete stereo atom
function FragmentAddStereoAtom(frid, aid) {
  this.data = { frid, aid }
}

FragmentAddStereoAtom.prototype = new Base('Add stereo atom to fragment')

FragmentAddStereoAtom.prototype.execute = function (restruct) {
  const frag = restruct.molecule.frags.get(this.data.frid)
  frag.updateStereoAtom(restruct.molecule, this.data.aid, true)

  invalidateEnhancedFlag(restruct, this.data.frid, frag.enhancedStereoFlag)
}

FragmentAddStereoAtom.prototype.invert = function () {
  return new FragmentDeleteStereoAtom(this.data.frid, this.data.aid)
}

function FragmentDeleteStereoAtom(frid, aid) {
  this.data = { frid, aid }
}

FragmentDeleteStereoAtom.prototype = new Base(
  'Delete stereo atom from fragment'
)

FragmentDeleteStereoAtom.prototype.execute = function (restruct) {
  const frag = restruct.molecule.frags.get(this.data.frid)
  frag.updateStereoAtom(restruct.molecule, this.data.aid, false)

  invalidateEnhancedFlag(restruct, this.data.frid, frag.enhancedStereoFlag)
}

FragmentDeleteStereoAtom.prototype.invert = function () {
  return new FragmentAddStereoAtom(this.data.frid, this.data.aid)
}

function invalidateEnhancedFlag(restruct, frid, flag) {
  const reEnhancedFlag = restruct.enhancedFlags.get(frid)
  if (reEnhancedFlag.flag === flag) return

  reEnhancedFlag.flag = flag
  invalidateItem(restruct, 'enhancedFlags', frid, 1)
}

function EnhancedFlagMove(frid, p) {
  this.data = { frid, p }
}

EnhancedFlagMove.prototype = new Base('Move enhanced flag')

EnhancedFlagMove.prototype.execute = function (restruct) {
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

EnhancedFlagMove.prototype.invert = function () {
  const ret = new EnhancedFlagMove()
  ret.data = this.data
  return ret
}

export {
  FragmentAdd,
  FragmentDelete,
  FragmentStereoFlag,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
  EnhancedFlagMove
}
