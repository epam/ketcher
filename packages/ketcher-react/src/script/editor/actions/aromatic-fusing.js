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

import { Bond, MolSerializer } from 'ketcher-core'

import Action from '../shared/action'
import { BondAttr } from '../operations'

/**
 * @param ReStruct { ReStruct }
 * @param events { Array<PipelineSubscription> }
 * @param bid { number }
 * @param template {{
 * 		molecule: Struct,
 * 		bid: number
 *  }}
 * @param simpleFusing { Function }
 * @returns { Promise }
 */
export function fromAromaticTemplateOnBond(
  ReStruct,
  template,
  bid,
  events,
  simpleFusing
) {
  const tmpl = template.molecule
  const struct = ReStruct.molecule

  const frid = struct.getBondFragment(bid)
  const beforeMerge = getFragmentWithBondMap(struct, frid)
  let afterMerge = null
  let pasteItems = null

  let action = new Action()

  if (true) {
    action = simpleFusing(ReStruct, template, bid)
    return Promise.resolve(action)
  }

  const molSerialzer = new MolSerializer()

  return Promise.all([
    events.aromatizeStruct
      .dispatch(beforeMerge.frag)
      .then(res => molSerialzer.deserialize(res.struct)),
    events.aromatizeStruct
      .dispatch(tmpl)
      .then(res => molSerialzer.deserialize(res.struct))
  ])
    .then(([astruct, atmpl]) => {
      // aromatize ReStruct fragment
      const aromatizeAction = fromAromatize(
        ReStruct,
        astruct,
        beforeMerge.bondMap
      )
      // merge template with fragment
      const aromTemplate = { bid: template.bid, molecule: atmpl }
      const templateFusingAction = simpleFusing(ReStruct, aromTemplate, bid)
      pasteItems = templateFusingAction[1]

      action = templateFusingAction[0].mergeWith(aromatizeAction)

      afterMerge = getFragmentWithBondMap(ReStruct.molecule, frid)

      return events.dearomatizeStruct
        .dispatch(afterMerge.frag)
        .then(res => molSerialzer.deserialize(res.struct))
    })
    .then(destruct => {
      destruct.bonds.forEach(bond => {
        if (bond.type === Bond.PATTERN.TYPE.AROMATIC)
          throw Error('Bad dearomatize')
      })

      // dearomatize ReStruct fragment
      const dearomatizeAction = fromDearomatize(
        ReStruct,
        destruct,
        afterMerge.bondMap
      )
      action = dearomatizeAction.mergeWith(action)

      return [action, pasteItems]
    })
    .catch(err => {
      console.info(err.message)
      action.perform(ReStruct) // revert actions if error

      return simpleFusing(ReStruct, template, bid)
    })
}

function fromAromatize(ReStruct, astruct, bondMap) {
  const action = new Action()

  astruct.bonds.forEach((bond, bid) => {
    if (bond.type !== Bond.PATTERN.TYPE.AROMATIC) return
    action.addOp(
      new BondAttr(
        bondMap.get(bid),
        'type',
        Bond.PATTERN.TYPE.AROMATIC
      ).perform(ReStruct)
    )
  })

  return action
}

/**
 * @param ReStruct { ReStruct }
 * @param dastruct { ReStruct }
 * @param bondMap { Map<number, number> }
 * @returns { Action }
 */
function fromDearomatize(ReStruct, dastruct, bondMap) {
  const action = new Action()

  dastruct.bonds.forEach((bond, bid) => {
    action.addOp(
      new BondAttr(bondMap.get(bid), 'type', bond.type).perform(ReStruct)
    )
  })

  return action
}

/* UTILS */

function canBeAromatized(struct) {
  // TODO correct this checking && move to chem.Struct ??
  if (struct.loops.size === 0) struct.prepareLoopStructure()

  const hasAromLoop = struct.loops.find((id, loop) => loop.aromatic)
  if (struct.loops.size === 0 || hasAromLoop) return false

  const correctDblBonds = struct.loops.find(
    (id, loop) => loop.dblBonds === loop.hbs.length / 2
  )

  return correctDblBonds !== undefined
}

/**
 * @param struct { Struct }
 * @param frid { number }
 * @returns {{
 * 		frag: Struct,
 * 		bondMap: Map<number, number>
 *  }}
 */
function getFragmentWithBondMap(struct, frid) {
  const atomSet = struct.getFragmentIds(frid)
  const atomsInStruct = Array.from(atomSet)

  const frag = struct.clone(atomSet)
  const bondMap = new Map()
  frag.bonds.forEach((bond, bid) => {
    bondMap.set(
      bid,
      struct.findBondId(atomsInStruct[bond.begin], atomsInStruct[bond.end])
    )
  })

  return { frag, bondMap }
}
