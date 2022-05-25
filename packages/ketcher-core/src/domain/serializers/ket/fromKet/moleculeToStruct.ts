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

import { Atom, Bond, SGroup, Struct } from 'domain/entities'

import { Elements } from 'domain/constants'
import { ifDef } from 'utilities'

export function toRlabel(values) {
  let res = 0
  values.forEach((val) => {
    const rgi = val - 1
    res |= 1 << rgi
  })
  return res
}

export function moleculeToStruct(ketItem: any): Struct {
  const struct = new Struct()
  ketItem.atoms.forEach((atom) => {
    if (atom.type === 'rg-label') struct.atoms.add(rglabelToStruct(atom))
    if (atom.type === 'atom-list') struct.atoms.add(atomListToStruct(atom))
    if (!atom.type) struct.atoms.add(atomToStruct(atom))
  })

  if (ketItem.bonds) {
    ketItem.bonds.forEach((bond) => struct.bonds.add(bondToStruct(bond)))
  }

  if (ketItem.sgroups) {
    ketItem.sgroups.forEach((sgroup) =>
      struct.sgroups.add(sgroupToStruct(sgroup))
    )
  }

  struct.initHalfBonds()
  struct.initNeighbors()
  struct.markFragments()
  struct.bindSGroupsToFunctionalGroups()

  return struct
}

export function atomToStruct(source) {
  const params: any = {}

  ifDef(params, 'label', source.label)
  ifDef(params, 'alias', source.alias)
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  })
  ifDef(params, 'charge', source.charge)
  ifDef(params, 'explicitValence', source.explicitValence)
  ifDef(params, 'isotope', source.isotope)
  ifDef(params, 'radical', source.radical)
  ifDef(params, 'attpnt', source.attachmentPoints)
  // stereo
  ifDef(params, 'stereoLabel', source.stereoLabel)
  ifDef(params, 'stereoParity', source.stereoParity)
  ifDef(params, 'weight', source.weight)
  // query
  ifDef(params, 'ringBondCount', source.ringBondCount)
  ifDef(params, 'substitutionCount', source.substitutionCount)
  ifDef(params, 'unsaturatedAtom', +source.unsaturatedAtom)
  ifDef(params, 'hCount', source.hCount)
  // reaction
  ifDef(params, 'aam', source.mapping)
  ifDef(params, 'invRet', source.invRet)
  ifDef(params, 'exactChangeFlag', +source.exactChangeFlag)
  return new Atom(params)
}

export function rglabelToStruct(source) {
  const params: any = {}
  params.label = 'R#'
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  })
  ifDef(params, 'attpnt', source.attachmentPoints)
  const rglabel = toRlabel(source.$refs.map((el) => parseInt(el.slice(3))))
  ifDef(params, 'rglabel', rglabel)
  return new Atom(params)
}

export function atomListToStruct(source) {
  const params: any = {}
  params.label = 'L#'
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  })
  ifDef(params, 'attpnt', source.attachmentPoints)
  const ids = source.elements
    .map((el) => Elements.get(el)?.number)
    .filter((id) => id)
  ifDef(params, 'atomList', {
    ids,
    notList: source.notList
  })
  return new Atom(params)
}

export function bondToStruct(source) {
  const params: any = {}

  ifDef(params, 'type', source.type)
  ifDef(params, 'topology', source.topology)
  ifDef(params, 'reactingCenterStatus', source.center)
  ifDef(params, 'stereo', source.stereo)
  // if (params.stereo)
  // 	params.stereo = params.stereo > 1 ? params.stereo * 2 : params.stereo;
  // params.xxx = 0;
  ifDef(params, 'begin', source.atoms[0])
  ifDef(params, 'end', source.atoms[1])

  return new Bond(params)
}

export function sgroupToStruct(source) {
  const sgroup = new SGroup(source.type)
  ifDef(sgroup, 'atoms', source.atoms)
  switch (source.type) {
    case 'GEN':
      break
    case 'MUL': {
      ifDef(sgroup.data, 'mul', source.mul)
      break
    }
    case 'SRU': {
      ifDef(sgroup.data, 'subscript', source.subscript)
      ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase())
      break
    }
    case 'SUP': {
      ifDef(sgroup.data, 'name', source.name)
      ifDef(sgroup.data, 'expanded', source.expanded)
      ifDef(sgroup, 'id', source.id)
      break
    }
    case 'DAT': {
      ifDef(sgroup.data, 'absolute', source.placement)
      ifDef(sgroup.data, 'attached', source.display)
      ifDef(sgroup.data, 'context', source.context)
      ifDef(sgroup.data, 'fieldName', source.fieldName)
      ifDef(sgroup.data, 'fieldValue', source.fieldData)
      break
    }
    default:
      break
  }
  return sgroup
}
