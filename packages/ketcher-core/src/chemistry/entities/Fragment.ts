/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
function calcStereoFlag(struct: any, stereoAids: Array<number>) {
  if (!stereoAids || stereoAids.length === 0) return null
  const stereoLabel = struct.atoms.get(stereoAids[0]).stereoLabel // {string | null} "<abs|and|or>-<group>"

  const hasAnotherLabel = stereoAids
    .map(aid => struct.atoms.get(aid))
    .some(atom => atom.stereoLabel !== stereoLabel)

  return hasAnotherLabel ? 'Mixed' : stereoLabel?.split('-')[0]
}
export class Fragment {
  static STEREO_FLAG = {
    Mixed: 'Mixed',
    abs: 'ABS (Chiral)',
    and: 'AND Enantiomer',
    or: 'OR Enantiomer',
    null: null
    // todo: custom in the future
  }

  stereoAtoms: Array<number>
  enhancedStereoFlag?: any

  constructor(flag?: any) {
    this.stereoAtoms = []
    this.enhancedStereoFlag = flag
  }

  clone(aidMap: Map<number, number>) {
    const fr = new Fragment(this.enhancedStereoFlag)
    fr.stereoAtoms = this.stereoAtoms.map(aid => aidMap.get(aid)!)
    return fr
  }

  updateStereoFlag(struct: any, flag = false) {
    this.enhancedStereoFlag =
      flag !== false ? flag : calcStereoFlag(struct, this.stereoAtoms)
    return this.enhancedStereoFlag
  }

  updateStereoAtom(struct: any, aid: number, isAdd: boolean) {
    if (isAdd && !this.stereoAtoms.includes(aid)) this.stereoAtoms.push(aid)
    if (!isAdd) this.stereoAtoms = this.stereoAtoms.filter(item => item !== aid)

    this.enhancedStereoFlag = calcStereoFlag(struct, this.stereoAtoms)
  }
}
