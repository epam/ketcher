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

import { StereoFlag, Struct } from 'domain/entities'

import { Elements } from 'domain/constants'
import common from './common'
import utils from './utils'

const END_V2000 = '2D 1   1.00000     0.00000     0'

type Mapping = {
  [key in number]: number
}
type NumberTuple = [number, number]

export class Molfile {
  molecule: Struct | null
  molfile: string | null
  reaction: boolean
  mapping: Mapping
  bondMapping: Mapping

  constructor() {
    this.molecule = null
    this.molfile = null

    this.reaction = false
    this.mapping = {}
    this.bondMapping = {}
  }

  parseCTFile(molfileLines: string[], shouldReactionRelayout?: boolean) {
    let ret
    if (molfileLines[0].search('\\$RXN') === 0) {
      ret = common.parseRxn(molfileLines, shouldReactionRelayout)
    } else {
      ret = common.parseMol(molfileLines)
    }
    ret.initHalfBonds()
    ret.initNeighbors()
    ret.bindSGroupsToFunctionalGroups()

    return ret
  }

  prepareSGroups(skipErrors: boolean, preserveIndigoDesc?: boolean) {
    const mol = this.molecule
    const toRemove: any[] = []
    let errors = 0

    this.molecule?.sGroupForest
      .getSGroupsBFS()
      .reverse()
      .forEach((id) => {
        const sgroup = mol!.sgroups.get(id)!
        let errorIgnore = false

        try {
          common.prepareForSaving[sgroup.type](sgroup, mol)
        } catch (ex: any) {
          if (!skipErrors || typeof ex.id !== 'number') {
            throw new Error(`Error: ${ex.message}`)
          }
          errorIgnore = true
        }
        /* eslint-disable no-mixed-operators */
        if (
          errorIgnore ||
          (!preserveIndigoDesc &&
            /^INDIGO_.+_DESC$/i.test(sgroup.data.fieldName))
        ) {
          errors += +errorIgnore
          toRemove.push(sgroup.id)
        }
      }, this)

    if (errors) {
      throw new Error(
        'Warning: ' +
          errors +
          ' invalid S-groups were detected. They will be omitted.'
      )
    }

    for (let i = 0; i < toRemove.length; ++i) {
      mol?.sGroupDelete(toRemove[i])
    }
  }

  getCTab(molecule: Struct, rgroups?: Map<any, any>) {
    /* saver */
    this.molecule = molecule.clone()
    this.prepareSGroups(false, false)
    this.molfile = ''
    this.writeCTab2000(rgroups)
    return this.molfile
  }

  saveMolecule(
    molecule: Struct,
    skipSGroupErrors: boolean,
    norgroups?: boolean,
    preserveIndigoDesc?: boolean
  ) {
    // eslint-disable-line max-statements
    /* saver */
    this.reaction = molecule.hasRxnArrow()
    this.molfile = '' + molecule.name
    if (this.reaction) {
      if (molecule.rgroups.size > 0) {
        throw new Error(
          'Reactions with r-groups are not supported at the moment'
        )
      }
      const components = molecule.getComponents()

      const reactants = components.reactants
      const products = components.products
      const all = reactants.concat(products)
      this.molfile =
        '$RXN\n' +
        molecule.name +
        '\n\n\n' +
        utils.paddedNum(reactants.length, 3) +
        utils.paddedNum(products.length, 3) +
        utils.paddedNum(0, 3) +
        '\n'
      for (let i = 0; i < all.length; ++i) {
        const saver = new Molfile()
        const submol = molecule.clone(all[i], null, true)
        const molfile = saver.saveMolecule(submol, false, true)
        this.molfile += '$MOL\n' + molfile
      }
      return this.molfile
    }

    if (molecule.rgroups.size > 0) {
      if (norgroups) {
        molecule = molecule.getScaffold()
      } else {
        const scaffold = new Molfile().getCTab(
          molecule.getScaffold(),
          molecule.rgroups
        )
        this.molfile =
          '$MDL  REV  1\n$MOL\n$HDR\n' + molecule.name + '\n\n\n$END HDR\n'
        this.molfile += '$CTAB\n' + scaffold + '$END CTAB\n'

        molecule.rgroups.forEach((rg, rgid) => {
          this.molfile += '$RGP\n'
          this.writePaddedNumber(rgid, 3)
          this.molfile += '\n'
          rg.frags.forEach((fid) => {
            const group = new Molfile().getCTab(molecule.getFragment(fid))
            this.molfile += '$CTAB\n' + group + '$END CTAB\n'
          })
          this.molfile += '$END RGP\n'
        })
        this.molfile += '$END MOL\n'

        return this.molfile
      }
    }

    this.molecule = molecule.clone()

    this.prepareSGroups(skipSGroupErrors, preserveIndigoDesc)

    this.writeHeader()
    this.writeCTab2000()

    return this.molfile
  }

  writeHeader() {
    /* saver */

    const date = new Date()

    this.writeCR() // TODO: write structure name
    this.writeWhiteSpace(2)
    this.write('Ketcher')
    this.writeWhiteSpace()
    this.writeCR(
      (date.getMonth() + 1 + '').padStart(2) +
        (date.getDate() + '').padStart(2) +
        ((date.getFullYear() % 100) + '').padStart(2) +
        (date.getHours() + '').padStart(2) +
        (date.getMinutes() + '').padStart(2) +
        END_V2000
    )
    this.writeCR()
  }

  write(str: string) {
    /* saver */
    this.molfile += str
  }

  writeCR(str?: string) {
    /* saver */
    if (arguments.length === 0) {
      str = ''
    }

    this.molfile += str + '\n'
  }

  writeWhiteSpace(length = 0) {
    /* saver */
    if (arguments.length === 0) {
      length = 1
    }

    this.write(' '.repeat(Math.max(length, 0)))
  }

  writePadded(str: string, width: number) {
    /* saver */
    this.write(str)
    this.writeWhiteSpace(width - str.length)
  }

  writePaddedNumber(number: number, width: number) {
    /* saver */
    const str = (number - 0).toString()

    this.writeWhiteSpace(width - str.length)
    this.write(str)
  }

  writePaddedFloat(number: string | number, width: number, precision: number) {
    /* saver */
    this.write(utils.paddedNum(number, width, precision))
  }

  writeCTab2000Header() {
    /* saver */
    this.writePaddedNumber(this.molecule!.atoms.size, 3)
    this.writePaddedNumber(this.molecule!.bonds.size, 3)

    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    const isAbsFlag = Array.from(this.molecule!.frags.values()).some((fr) =>
      fr ? fr.enhancedStereoFlag === StereoFlag.Abs : false
    )
    this.writePaddedNumber(isAbsFlag ? 1 : 0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(999, 3)
    this.writeCR(' V2000')
  }

  writeCTab2000(rgroups?: Map<any, any>) {
    // eslint-disable-line max-statements
    /* saver */
    this.writeCTab2000Header()

    this.mapping = {}
    let i = 1

    const atomsIds: number[] = []
    const atomsProps: {
      id: number
      value: string
    }[] = []
    this.molecule!.atoms.forEach((atom, id) => {
      let label = atom.label
      if (atom.atomList != null) {
        label = 'L'
        atomsIds.push(id)
      } else if (atom.pseudo) {
        if (atom.pseudo.length > 3) {
          label = 'A'
          atomsProps.push({ id, value: `'${atom.pseudo}'` })
        }
      } else if (atom.alias) {
        atomsProps.push({ id, value: atom.alias })
      } else if (
        !Elements.get(atom.label) &&
        ['A', 'Q', 'X', '*', 'R#'].indexOf(atom.label) === -1
      ) {
        // search in generics?
        label = 'C'
        atomsProps.push({ id, value: atom.label })
      }

      this.writeAtom(atom, label)

      this.mapping[id] = i++
    }, this)

    this.bondMapping = {}
    i = 1
    this.molecule!.bonds.forEach((bond, id) => {
      this.bondMapping[id] = i++
      this.writeBond(bond)
    }, this)

    while (atomsProps.length > 0) {
      this.writeAtomProps(atomsProps[0])
      atomsProps.splice(0, 1)
    }

    const chargeList: NumberTuple[] = []
    const isotopeList: NumberTuple[] = []
    const radicalList: NumberTuple[] = []
    const rglabelList: NumberTuple[] = []
    const rglogicList: string[] = []
    const aplabelList: NumberTuple[] = []
    const rbcountList: NumberTuple[] = []
    const unsaturatedList: NumberTuple[] = []
    const substcountList: NumberTuple[] = []

    this.molecule!.atoms.forEach((atom, id) => {
      if (atom.charge !== 0) {
        chargeList.push([id, atom.charge])
      }
      if (atom.isotope !== 0) {
        isotopeList.push([id, atom.isotope])
      }
      if (atom.radical !== 0) {
        radicalList.push([id, atom.radical])
      }
      if (atom.rglabel != null && atom.label === 'R#') {
        // TODO need to force rglabel=null when label is not 'R#'
        for (let rgi = 0; rgi < 32; rgi++) {
          if ((atom.rglabel as any) & (1 << rgi)) {
            rglabelList.push([id, rgi + 1])
          }
        }
      }
      if (atom.attpnt != null) {
        aplabelList.push([id, atom.attpnt])
      }
      if (atom.ringBondCount !== 0) {
        rbcountList.push([id, atom.ringBondCount])
      }
      if (atom.substitutionCount !== 0) {
        substcountList.push([id, atom.substitutionCount])
      }
      if (atom.unsaturatedAtom !== 0) {
        unsaturatedList.push([id, atom.unsaturatedAtom])
      }
    })

    if (rgroups) {
      rgroups.forEach((rg, rgid) => {
        if (rg.resth || rg.ifthen > 0 || rg.range.length > 0) {
          const line =
            '  1 ' +
            utils.paddedNum(rgid, 3) +
            ' ' +
            utils.paddedNum(rg.ifthen, 3) +
            ' ' +
            utils.paddedNum(rg.resth ? 1 : 0, 3) +
            '   ' +
            rg.range
          rglogicList.push(line)
        }
      })
    }

    this.writeAtomPropList('M  CHG', chargeList)
    this.writeAtomPropList('M  ISO', isotopeList)
    this.writeAtomPropList('M  RAD', radicalList)
    this.writeAtomPropList('M  RGP', rglabelList)
    for (let j = 0; j < rglogicList.length; ++j) {
      this.write('M  LOG' + rglogicList[j] + '\n')
    }

    this.writeAtomPropList('M  APO', aplabelList)
    this.writeAtomPropList('M  RBC', rbcountList)
    this.writeAtomPropList('M  SUB', substcountList)
    this.writeAtomPropList('M  UNS', unsaturatedList)

    if (atomsIds.length > 0) {
      for (let j = 0; j < atomsIds.length; ++j) {
        const atomId = atomsIds[j]
        const atomList = this.molecule!.atoms.get(atomId)!.atomList!
        this.write('M  ALS')
        this.writePaddedNumber(atomId + 1, 4)
        this.writePaddedNumber(atomList.ids.length, 3)
        this.writeWhiteSpace()
        this.write(atomList.notList ? 'T' : 'F')

        const labelList = atomList.labelList()
        for (let k = 0; k < labelList.length; ++k) {
          this.writeWhiteSpace()
          this.writePadded(labelList[k], 3)
        }
        this.writeCR()
      }
    }

    const sgmap = {}
    let cnt = 1
    const sgmapback = {}
    const sgorder = this.molecule!.sGroupForest.getSGroupsBFS()
    sgorder.forEach((id) => {
      sgmapback[cnt] = id
      sgmap[id] = cnt++
    })
    for (let q = 1; q < cnt; ++q) {
      // each group on its own
      const id = sgmapback[q]
      const sgroup = this.molecule!.sgroups.get(id)!
      this.write('M  STY')
      this.writePaddedNumber(1, 3)
      this.writeWhiteSpace(1)
      this.writePaddedNumber(q, 3)
      this.writeWhiteSpace(1)
      this.writePadded(sgroup.type, 3)
      this.writeCR()

      // TODO: write subtype, M SST

      this.write('M  SLB')
      this.writePaddedNumber(1, 3)
      this.writeWhiteSpace(1)
      this.writePaddedNumber(q, 3)
      this.writeWhiteSpace(1)
      this.writePaddedNumber(q, 3)
      this.writeCR()

      const parentId = this.molecule!.sGroupForest.parent.get(id)!
      if (parentId >= 0) {
        this.write('M  SPL')
        this.writePaddedNumber(1, 3)
        this.writeWhiteSpace(1)
        this.writePaddedNumber(q, 3)
        this.writeWhiteSpace(1)
        this.writePaddedNumber(sgmap[parentId], 3)
        this.writeCR()
      }

      // connectivity
      if (sgroup.type === 'SRU' && sgroup.data.connectivity) {
        const connectivity = ` ${q.toString().padStart(3)} ${(
          sgroup.data.connectivity || ''
        ).padEnd(3)}`

        this.write('M  SCN')
        this.writePaddedNumber(1, 3)
        this.write(connectivity.toUpperCase())
        this.writeCR()
      }

      if (sgroup.type === 'SRU') {
        this.write('M  SMT ')
        this.writePaddedNumber(q, 3)
        this.writeWhiteSpace()
        this.write(sgroup.data.subscript || 'n')
        this.writeCR()
      }

      this.writeCR(
        common.saveToMolfile[sgroup.type](
          sgroup,
          this.molecule,
          sgmap,
          this.mapping,
          this.bondMapping
        )
      )
    }

    // TODO: write M  APO
    // TODO: write M  AAL
    // TODO: write M  RGP
    // TODO: write M  LOG

    const expandedGroups: number[] = []
    this.molecule!.sgroups.forEach((sg) => {
      if (sg.data.expanded) expandedGroups.push(sg.id + 1)
    })

    if (expandedGroups.length) {
      const expandedGroupsLine = `M  SDS EXP  ${
        expandedGroups.length
      }   ${expandedGroups.join('   ')}`
      this.writeCR(expandedGroupsLine)
    }

    this.writeCR('M  END')
  }

  private writeAtom(atom, atomLabel: string) {
    this.writePaddedFloat(atom.pp.x, 10, 4)
    this.writePaddedFloat(-atom.pp.y, 10, 4)
    this.writePaddedFloat(atom.pp.z, 10, 4)
    this.writeWhiteSpace()
    this.writePadded(atomLabel, 3)
    this.writePaddedNumber(0, 2)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)

    if (typeof atom.hCount === 'undefined') {
      atom.hCount = 0
    }
    this.writePaddedNumber(atom.hCount, 3)

    if (typeof atom.stereoCare === 'undefined') {
      atom.stereoCare = 0
    }
    this.writePaddedNumber(atom.stereoCare, 3)

    let number: number
    if (atom.explicitValence < 0) {
      number = 0
    } else if (atom.explicitValence === 0) {
      number = 15
    } else {
      number = atom.explicitValence
    }
    this.writePaddedNumber(number, 3)

    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)
    this.writePaddedNumber(0, 3)

    if (typeof atom.aam === 'undefined') {
      atom.aam = 0
    }
    this.writePaddedNumber(atom.aam, 3)

    if (typeof atom.invRet === 'undefined') {
      atom.invRet = 0
    }
    this.writePaddedNumber(atom.invRet, 3)

    if (typeof atom.exactChangeFlag === 'undefined') {
      atom.exactChangeFlag = 0
    }
    this.writePaddedNumber(atom.exactChangeFlag, 3)

    this.writeCR()
  }

  private writeBond(bond) {
    this.writePaddedNumber(this.mapping[bond.begin], 3)
    this.writePaddedNumber(this.mapping[bond.end], 3)
    this.writePaddedNumber(bond.type, 3)

    if (typeof bond.stereo === 'undefined') {
      bond.stereo = 0
    }
    this.writePaddedNumber(bond.stereo, 3)

    this.writePadded(bond.xxx, 3)

    if (typeof bond.topology === 'undefined') {
      bond.topology = 0
    }
    this.writePaddedNumber(bond.topology, 3)

    if (typeof bond.reactingCenterStatus === 'undefined') {
      bond.reactingCenterStatus = 0
    }
    this.writePaddedNumber(bond.reactingCenterStatus, 3)

    this.writeCR()
  }

  private writeAtomProps(props) {
    this.write('A  ')
    this.writePaddedNumber(props.id + 1, 3)
    this.writeCR()
    this.writeCR(props.value)
  }

  private writeAtomPropList(propId: string, values: NumberTuple[]) {
    while (values.length > 0) {
      const part: NumberTuple[] = []

      while (values.length > 0 && part.length < 8) {
        part.push(values[0])
        values.splice(0, 1)
      }

      this.write(propId)
      this.writePaddedNumber(part.length, 3)

      part.forEach((value) => {
        this.writeWhiteSpace()
        this.writePaddedNumber(this.mapping[value[0]], 3)
        this.writeWhiteSpace()
        this.writePaddedNumber(value[1], 3)
      })

      this.writeCR()
    }
  }
}
