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

import { Atom, Bond, Pile, SGroup } from 'domain/entities'

import CisTrans from './cis_trans'
import Dfs from './dfs'
import Stereocenters from './stereocenters'

export function Smiles() {
  this.smiles = ''
  this.writtenAtoms = []
  this.writtenComponents = 0

  this.ignoreErrors = false
}

Smiles._Atom = function (hCount) {
  // eslint-disable-line no-underscore-dangle
  this.neighbours = [] // Array of integer pairs {a, b}
  this.aromatic = false // has aromatic bond
  this.lowercase = false // aromatic and has to be written lowercase
  this.chirality = 0 // 0 means no chirality, 1 means CCW pyramid, 2 means CW pyramid
  this.branch_cnt = 0 // runs from 0 to (branches - 1)
  this.paren_written = false
  this.h_count = hCount
  this.parent = -1
}

// NB: only loops of length up to 6 are included here
Smiles.prototype.isBondInRing = function (bid) {
  return this.inLoop[bid]
}

Smiles.prototype.saveMolecule = function (struct, ignoreErrors) {
  // eslint-disable-line max-statements
  let i, j, k

  if (!ignoreErrors) this.ignoreErrors = ignoreErrors

  // [RB]: KETCHER-498 (Incorrect smile-string for multiple Sgroup)
  // TODO the fix is temporary, still need to implement error handling/reporting
  // BEGIN
  struct = struct.clone(
    undefined,
    undefined,
    !struct.hasRxnArrow(), // make it drop multiple reactions
    undefined,
    undefined,
    undefined
  )
  struct.initHalfBonds()
  struct.initNeighbors()
  struct.sortNeighbors()
  struct.setImplicitHydrogen()
  struct.sgroups.forEach((sg) => {
    if (sg.type === 'MUL') {
      try {
        SGroup.prepareMulForSaving(sg, struct)
      } catch (ex) {
        throw Error('Bad s-group (' + ex.message + ')')
      }
    }
    // 'SMILES data format doesn\'t support s-groups'
  })
  // END

  this.atoms = new Array(struct.atoms.size)

  struct.atoms.forEach((atom, aid) => {
    this.atoms[aid] = new Smiles._Atom(atom.implicitH) // eslint-disable-line no-underscore-dangle
  })

  // From the SMILES specification:
  // Please note that only atoms on the following list
  // can be considered aromatic: C, N, O, P, S, As, Se, and * (wildcard).
  const allowedLowercase = ['B', 'C', 'N', 'O', 'P', 'S', 'Se', 'As']

  // Detect atoms that have aromatic bonds and count neighbours
  struct.bonds.forEach((bond, bid) => {
    if (bond.type === Bond.PATTERN.TYPE.AROMATIC) {
      this.atoms[bond.begin].aromatic = true
      if (allowedLowercase.indexOf(struct.atoms.get(bond.begin).label) !== -1) {
        this.atoms[bond.begin].lowercase = true
      }
      this.atoms[bond.end].aromatic = true
      if (allowedLowercase.indexOf(struct.atoms.get(bond.end).label) !== -1) {
        this.atoms[bond.end].lowercase = true
      }
    }
    this.atoms[bond.begin].neighbours.push({ aid: bond.end, bid })
    this.atoms[bond.end].neighbours.push({ aid: bond.begin, bid })
  })

  this.inLoop = (function () {
    struct.prepareLoopStructure()
    let bondsInLoops = new Pile()
    struct.loops.forEach((loop) => {
      if (loop.hbs.length <= 6) {
        const hbids = loop.hbs.map((hbid) => struct.halfBonds.get(hbid).bid)
        bondsInLoops = bondsInLoops.union(new Pile(hbids))
      }
    })
    const inLoop = {}
    bondsInLoops.forEach((bid) => {
      inLoop[bid] = 1
    })
    return inLoop
  })()

  this.touchedCistransbonds = 0
  this.markCisTrans(struct)

  const components = struct.getComponents()
  const componentsAll = components.reactants.concat(components.products)

  const walk = new Dfs(
    struct,
    this.atoms,
    componentsAll,
    components.reactants.length
  )

  walk.walk()
  this.atoms.forEach((atom) => {
    atom.neighbours = []
  })

  // fill up neighbor lists for the stereocenters calculation
  for (i = 0; i < walk.v_seq.length; i++) {
    var seqEl = walk.v_seq[i]
    var vIdx = seqEl.idx
    var eIdx = seqEl.parent_edge
    var vPrevIdx = seqEl.parent_vertex

    if (eIdx >= 0) {
      const atom = this.atoms[vIdx]

      var openingCycles = walk.numOpeningCycles(eIdx)

      for (j = 0; j < openingCycles; j++) {
        this.atoms[vPrevIdx].neighbours.push({ aid: -1, bid: -1 })
      }

      if (walk.edgeClosingCycle(eIdx)) {
        for (k = 0; k < atom.neighbours.length; k++) {
          if (atom.neighbours[k].aid === -1) {
            // eslint-disable-line max-depth
            atom.neighbours[k].aid = vPrevIdx
            atom.neighbours[k].bid = eIdx
            break
          }
        }
        if (k === atom.neighbours.length) {
          throw new Error('internal: can not put closing bond to its place')
        }
      } else {
        atom.neighbours.push({ aid: vPrevIdx, bid: eIdx })
        atom.parent = vPrevIdx
      }
      this.atoms[vPrevIdx].neighbours.push({ aid: vIdx, bid: eIdx })
    }
  }

  try {
    // detect chiral configurations
    const stereocenters = new Stereocenters(
      struct,
      function (idx) {
        return this.atoms[idx].neighbours
      },
      this
    )
    stereocenters.buildFromBonds(this.ignoreErrors)

    stereocenters.each((sc, atomIdx) => {
      // eslint-disable-line max-statements
      // if (sc.type < MoleculeStereocenters::ATOM_AND)
      //    continue;

      let implicitHIdx = -1

      if (sc.pyramid[3] === -1) implicitHIdx = 3
      /*
			else for (j = 0; j < 4; j++)
				if (ignored_vertices[pyramid[j]])
				{
					implicit_h_idx = j;
					break;
				}
				*/

      const pyramidMapping = []
      let counter = 0

      const atom = this.atoms[atomIdx]

      if (atom.parent !== -1) {
        for (k = 0; k < 4; k++) {
          if (sc.pyramid[k] === atom.parent) {
            pyramidMapping[counter++] = k
            break
          }
        }
      }

      if (implicitHIdx !== -1) pyramidMapping[counter++] = implicitHIdx

      for (j = 0; j !== atom.neighbours.length; j++) {
        if (atom.neighbours[j].aid === atom.parent) continue // eslint-disable-line no-continue

        for (k = 0; k < 4; k++) {
          if (atom.neighbours[j].aid === sc.pyramid[k]) {
            if (counter >= 4) throw new Error('internal: pyramid overflow')
            pyramidMapping[counter++] = k
            break
          }
        }
      }

      if (counter === 4) {
        // move the 'from' atom to the end
        counter = pyramidMapping[0]
        pyramidMapping[0] = pyramidMapping[1]
        pyramidMapping[1] = pyramidMapping[2]
        pyramidMapping[2] = pyramidMapping[3]
        pyramidMapping[3] = counter
      } else if (counter !== 3) {
        throw new Error('cannot calculate chirality')
      }

      if (Stereocenters.isPyramidMappingRigid(pyramidMapping)) {
        this.atoms[atomIdx].chirality = 1
      } else this.atoms[atomIdx].chirality = 2
    })
  } catch (ex) {
    // TODO: add error handler call
  }

  // write the SMILES itself

  // cycle_numbers[i] == -1 means that the number is available
  // cycle_numbers[i] == n means that the number is used by vertex n
  const cycleNumbers = []

  cycleNumbers.push(0) // never used

  let firstComponent = true

  for (i = 0; i < walk.v_seq.length; i++) {
    seqEl = walk.v_seq[i]
    vIdx = seqEl.idx
    eIdx = seqEl.parent_edge
    vPrevIdx = seqEl.parent_vertex
    let writeAtom = true

    if (vPrevIdx >= 0) {
      if (walk.numBranches(vPrevIdx) > 1) {
        if (
          this.atoms[vPrevIdx].branch_cnt > 0 &&
          this.atoms[vPrevIdx].paren_written
        ) {
          this.smiles += ')'
        }
      }

      openingCycles = walk.numOpeningCycles(eIdx)

      for (j = 0; j < openingCycles; j++) {
        for (k = 1; k < cycleNumbers.length; k++) {
          if (cycleNumbers[k] === -1) {
            // eslint-disable-line max-depth
            break
          }
        }
        if (k === cycleNumbers.length) cycleNumbers.push(vPrevIdx)
        else cycleNumbers[k] = vPrevIdx

        this.writeCycleNumber(k)
      }

      if (vPrevIdx >= 0) {
        const branches = walk.numBranches(vPrevIdx)

        if (branches > 1 && this.atoms[vPrevIdx].branch_cnt < branches - 1) {
          if (walk.edgeClosingCycle(eIdx)) {
            // eslint-disable-line max-depth
            this.atoms[vPrevIdx].paren_written = false
          } else {
            this.smiles += '('
            this.atoms[vPrevIdx].paren_written = true
          }
        }

        this.atoms[vPrevIdx].branch_cnt++

        if (this.atoms[vPrevIdx].branch_cnt > branches) {
          throw new Error('unexpected branch')
        }
      }

      const bond = struct.bonds.get(eIdx)

      let dir = 0

      if (bond.type === Bond.PATTERN.TYPE.SINGLE) {
        dir = this.calcBondDirection(struct, eIdx, vPrevIdx)
      }

      if (
        (dir === 1 && vIdx === bond.end) ||
        (dir === 2 && vIdx === bond.begin)
      ) {
        this.smiles += '/'
      } else if (
        (dir === 2 && vIdx === bond.end) ||
        (dir === 1 && vIdx === bond.begin)
      ) {
        this.smiles += '\\'
      } else if (bond.type === Bond.PATTERN.TYPE.ANY) {
        this.smiles += '~'
      } else if (bond.type === Bond.PATTERN.TYPE.DOUBLE) {
        this.smiles += '='
      } else if (bond.type === Bond.PATTERN.TYPE.TRIPLE) {
        this.smiles += '#'
      } else if (bond.type === Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC) {
        this.smiles += '-,:'
      } else if (bond.type === Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC) {
        this.smiles += '=,:'
      } else if (bond.type === Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE) {
        this.smiles += '-,='
      } else if (
        bond.type === Bond.PATTERN.TYPE.AROMATIC &&
        (!this.atoms[bond.begin].lowercase ||
          !this.atoms[bond.end].lowercase ||
          !this.isBondInRing(eIdx))
      ) {
        this.smiles += ':'
      }
      // TODO: Check if this : is needed
      else if (
        bond.type === Bond.PATTERN.TYPE.SINGLE &&
        this.atoms[bond.begin].aromatic &&
        this.atoms[bond.end].aromatic
      ) {
        this.smiles += '-'
      }

      if (walk.edgeClosingCycle(eIdx)) {
        for (j = 1; j < cycleNumbers.length; j++) {
          if (cycleNumbers[j] === vIdx) break
        }

        if (j === cycleNumbers.length) throw new Error('cycle number not found')

        this.writeCycleNumber(j)

        cycleNumbers[j] = -1
        writeAtom = false
      }
    } else {
      if (!firstComponent) {
        this.smiles +=
          this.writtenComponents === walk.nComponentsInReactants &&
          walk.nReactants !== 0
            ? '>>'
            : '.' // when walk.nReactants === 0 - not reaction
      }
      firstComponent = false
      this.writtenComponents++
    }
    if (writeAtom) {
      this.writeAtom(
        struct,
        vIdx,
        this.atoms[vIdx].aromatic,
        this.atoms[vIdx].lowercase,
        this.atoms[vIdx].chirality
      )
      this.writtenAtoms.push(seqEl.idx)
    }
  }

  this.comma = false

  // this._writeStereogroups(mol, atoms);
  this.writeRadicals(struct)
  // this._writePseudoAtoms(mol);
  // this._writeHighlighting();

  if (this.comma) this.smiles += '|'

  return this.smiles
}

Smiles.prototype.writeCycleNumber = function (n) {
  if (n > 0 && n < 10) this.smiles += n
  else if (n >= 10 && n < 100) this.smiles += '%' + n
  else if (n >= 100 && n < 1000) this.smiles += '%%' + n
  else throw new Error('bad cycle number: ' + n)
}

Smiles.prototype.writeAtom = function (
  mol,
  idx,
  aromatic,
  lowercase,
  chirality
) {
  // eslint-disable-line max-params, max-statements
  const atom = mol.atoms.get(idx)
  let needBrackets = false
  let hydro = -1
  let aam = 0

  /*
	if (mol.haveQueryAtoms())
	{
	  query_atom = &mol.getQueryAtom(idx);

	  if (query_atom->type == QUERY_ATOM_RGROUP)
	  {
		 if (mol.getRGroups()->isRGroupAtom(idx))
		 {
			const Array<int> &rg = mol.getRGroups()->getSiteRGroups(idx);

			if (rg.length != 1)
			   throw Error("rgroup count %d", rg.length);

			_output.printf("[&%d]", rg[0] + 1);
		 }
		 else
			_output.printf("[&%d]", 1);

		 return;
	  }
	}
	*/

  if (atom.label === 'A') {
    this.smiles += '*'
    return
  }

  if (atom.label === 'R' || atom.label === 'R#') {
    this.smiles += '[*]'
    return
  }

  // KETCHER-598 (Ketcher does not save AAM into reaction SMILES)
  // BEGIN
  //    if (this.atom_atom_mapping)
  //        aam = atom_atom_mapping[idx];
  aam = atom.aam
  // END

  if (
    atom.label !== 'C' &&
    atom.label !== 'P' &&
    atom.label !== 'N' &&
    atom.label !== 'S' &&
    atom.label !== 'O' &&
    atom.label !== 'Cl' &&
    atom.label !== 'F' &&
    atom.label !== 'Br' &&
    atom.label !== 'B' &&
    atom.label !== 'I'
  ) {
    needBrackets = true
  }

  if (
    atom.explicitValence >= 0 ||
    atom.radical !== 0 ||
    chirality > 0 ||
    (aromatic && atom.label !== 'C' && atom.label !== 'O') ||
    (aromatic &&
      atom.label === 'C' &&
      this.atoms[idx].neighbours.length < 3 &&
      this.atoms[idx].h_count === 0)
  ) {
    hydro = this.atoms[idx].h_count
  }

  let label = atom.label
  if (atom.atomList && !atom.atomList.notList) {
    label = atom.atomList.label()
    needBrackets = false // atom list label already has brackets
  } else if (atom.isPseudo() || (atom.atomList && atom.atomList.notList)) {
    label = '*'
    needBrackets = false
  } else if (
    chirality ||
    atom.charge !== 0 ||
    atom.isotope > 0 ||
    hydro >= 0 ||
    aam > 0
  ) {
    needBrackets = true
  }

  if (needBrackets) {
    if (hydro === -1) hydro = this.atoms[idx].h_count
    this.smiles += '['
  }

  if (atom.isotope > 0) this.smiles += atom.isotope

  if (lowercase) this.smiles += label.toLowerCase()
  else this.smiles += label

  if (chirality > 0) {
    if (chirality === 1) this.smiles += '@'
    // chirality == 2
    else this.smiles += '@@'

    if (atom.implicitH > 1) {
      throw new Error(atom.implicitH + ' implicit H near stereocenter')
    }
  }

  if (atom.label !== 'H') {
    if (hydro > 1 || (hydro === 0 && !needBrackets)) this.smiles += 'H' + hydro
    else if (hydro === 1) this.smiles += 'H'
  }

  if (atom.charge > 1) this.smiles += '+' + atom.charge
  else if (atom.charge < -1) this.smiles += atom.charge
  else if (atom.charge === 1) this.smiles += '+'
  else if (atom.charge === -1) this.smiles += '-'

  if (aam > 0) this.smiles += ':' + aam

  if (needBrackets) this.smiles += ']'

  /*
	if (mol.getRGroupFragment() != 0)
	{
	  for (i = 0; i < 2; i++)
	  {
		 int j;

		 for (j = 0; mol.getRGroupFragment()->getAttachmentPoint(i, j) != -1; j++)
			if (idx == mol.getRGroupFragment()->getAttachmentPoint(i, j))
			{
			   _output.printf("([*])");
			   break;
			}

		 if (mol.getRGroupFragment()->getAttachmentPoint(i, j) != -1)
			break;
	  }
	}
	*/
}

Smiles.prototype.markCisTrans = function (mol) {
  this.cis_trans = new CisTrans(
    mol,
    function (idx) {
      return this.atoms[idx].neighbours
    },
    this
  )
  this.cis_trans.build()
  this.dbonds = new Array(mol.bonds.size)

  mol.bonds.forEach((bond, bid) => {
    this.dbonds[bid] = {
      ctbond_beg: -1,
      ctbond_end: -1,
      saved: 0
    }
  })

  this.cis_trans.each((ct, bid) => {
    const bond = mol.bonds.get(bid)

    if (ct.parity !== 0 && !this.isBondInRing(bid)) {
      const neiBeg = this.atoms[bond.begin].neighbours
      const neiEnd = this.atoms[bond.end].neighbours
      let aromFailBeg = true
      let aromFailEnd = true

      neiBeg.forEach((nei) => {
        if (
          nei.bid !== bid &&
          mol.bonds.get(nei.bid).type === Bond.PATTERN.TYPE.SINGLE
        ) {
          aromFailBeg = false
        }
      })

      neiEnd.forEach((nei) => {
        if (
          nei.bid !== bid &&
          mol.bonds.get(nei.bid).type === Bond.PATTERN.TYPE.SINGLE
        ) {
          aromFailEnd = false
        }
      })

      if (aromFailBeg || aromFailEnd) return

      neiBeg.forEach((nei) => {
        if (nei.bid === bid) return
        if (mol.bonds.get(nei.bid).begin === bond.begin) {
          this.dbonds[nei.bid].ctbond_beg = bid
        } else this.dbonds[nei.bid].ctbond_end = bid
      })

      neiEnd.forEach((nei) => {
        if (nei.bid === bid) return
        if (mol.bonds.get(nei.bid).begin === bond.end) {
          this.dbonds[nei.bid].ctbond_beg = bid
        } else this.dbonds[nei.bid].ctbond_end = bid
      })
    }
  })
}

Smiles.prototype.updateSideBonds = function (mol, bondIdx) {
  // eslint-disable-line max-statements
  const bond = mol.bonds.get(bondIdx)
  const subst = this.cis_trans.getSubstituents(bondIdx)
  const parity = this.cis_trans.getParity(bondIdx)

  const sidebonds = [-1, -1, -1, -1]

  sidebonds[0] = mol.findBondId(subst[0], bond.begin)
  if (subst[1] !== -1) sidebonds[1] = mol.findBondId(subst[1], bond.begin)

  sidebonds[2] = mol.findBondId(subst[2], bond.end)
  if (subst[3] !== -1) sidebonds[3] = mol.findBondId(subst[3], bond.end)

  let n1 = 0
  let n2 = 0
  let n3 = 0
  let n4 = 0

  if (this.dbonds[sidebonds[0]].saved !== 0) {
    if (
      (this.dbonds[sidebonds[0]].saved === 1 &&
        mol.bonds.get(sidebonds[0]).begin === bond.begin) ||
      (this.dbonds[sidebonds[0]].saved === 2 &&
        mol.bonds.get(sidebonds[0]).end === bond.begin)
    ) {
      n1++
    } else n2++
  }
  if (sidebonds[1] !== -1 && this.dbonds[sidebonds[1]].saved !== 0) {
    if (
      (this.dbonds[sidebonds[1]].saved === 2 &&
        mol.bonds.get(sidebonds[1]).begin === bond.begin) ||
      (this.dbonds[sidebonds[1]].saved === 1 &&
        mol.bonds.get(sidebonds[1]).end === bond.begin)
    ) {
      n1++
    } else n2++
  }
  if (this.dbonds[sidebonds[2]].saved !== 0) {
    if (
      (this.dbonds[sidebonds[2]].saved === 1 &&
        mol.bonds.get(sidebonds[2]).begin === bond.end) ||
      (this.dbonds[sidebonds[2]].saved === 2 &&
        mol.bonds.get(sidebonds[2]).end === bond.end)
    ) {
      n3++
    } else n4++
  }
  if (sidebonds[3] !== -1 && this.dbonds[sidebonds[3]].saved !== 0) {
    if (
      (this.dbonds[sidebonds[3]].saved === 2 &&
        mol.bonds.get(sidebonds[3]).begin === bond.end) ||
      (this.dbonds[sidebonds[3]].saved === 1 &&
        mol.bonds.get(sidebonds[3]).end === bond.end)
    ) {
      n3++
    } else n4++
  }

  if (parity === CisTrans.PARITY.CIS) {
    n1 += n3
    n2 += n4
  } else {
    n1 += n4
    n2 += n3
  }

  if (n1 > 0 && n2 > 0) throw new Error('incompatible cis-trans configuration')

  if (n1 === 0 && n2 === 0) return false

  if (n1 > 0) {
    this.dbonds[sidebonds[0]].saved =
      mol.bonds.get(sidebonds[0]).begin === bond.begin ? 1 : 2
    if (sidebonds[1] !== -1) {
      this.dbonds[sidebonds[1]].saved =
        mol.bonds.get(sidebonds[1]).begin === bond.begin ? 2 : 1
    }

    this.dbonds[sidebonds[2]].saved =
      (mol.bonds.get(sidebonds[2]).begin === bond.end) ===
      (parity === CisTrans.PARITY.CIS)
        ? 1
        : 2
    if (sidebonds[3] !== -1) {
      this.dbonds[sidebonds[3]].saved =
        (mol.bonds.get(sidebonds[3]).begin === bond.end) ===
        (parity === CisTrans.PARITY.CIS)
          ? 2
          : 1
    }
  }
  if (n2 > 0) {
    this.dbonds[sidebonds[0]].saved =
      mol.bonds.get(sidebonds[0]).begin === bond.begin ? 2 : 1
    if (sidebonds[1] !== -1) {
      this.dbonds[sidebonds[1]].saved =
        mol.bonds.get(sidebonds[1]).begin === bond.begin ? 1 : 2
    }

    this.dbonds[sidebonds[2]].saved =
      (mol.bonds.get(sidebonds[2]).begin === bond.end) ===
      (parity === CisTrans.PARITY.CIS)
        ? 2
        : 1
    if (sidebonds[3] !== -1) {
      this.dbonds[sidebonds[3]].saved =
        (mol.bonds.get(sidebonds[3]).begin === bond.end) ===
        (parity === CisTrans.PARITY.CIS)
          ? 1
          : 2
    }
  }

  return true
}

Smiles.prototype.calcBondDirection = function (mol, idx, vprev) {
  let ntouched

  if (
    this.dbonds[idx].ctbond_beg === -1 &&
    this.dbonds[idx].ctbond_end === -1
  ) {
    return 0
  }

  if (mol.bonds.get(idx).type !== Bond.PATTERN.TYPE.SINGLE) {
    throw new Error('internal: directed bond type ' + mol.bonds.get(idx).type)
  }

  while (true) {
    // eslint-disable-line no-constant-condition
    ntouched = 0
    this.cis_trans.each((ct, bid) => {
      if (ct.parity !== 0 && !this.isBondInRing(bid)) {
        if (this.updateSideBonds(mol, bid)) ntouched++
      }
    })
    if (ntouched === this.touchedCistransbonds) break
    this.touchedCistransbonds = ntouched
  }

  if (this.dbonds[idx].saved === 0) {
    if (vprev === mol.bonds.get(idx).begin) this.dbonds[idx].saved = 1
    else this.dbonds[idx].saved = 2
  }

  return this.dbonds[idx].saved
}

Smiles.prototype.writeRadicals = function (mol) {
  // eslint-disable-line max-statements
  const marked = new Array(this.writtenAtoms.length)
  let i, j

  for (i = 0; i < this.writtenAtoms.length; i++) {
    if (marked[i]) continue // eslint-disable-line no-continue

    const radical = mol.atoms.get(this.writtenAtoms[i]).radical

    if (radical === 0) continue // eslint-disable-line no-continue

    if (this.comma) {
      this.smiles += ','
    } else {
      this.smiles += ' |'
      this.comma = true
    }

    if (radical === Atom.PATTERN.RADICAL.SINGLET) this.smiles += '^3:'
    else if (radical === Atom.PATTERN.RADICAL.DOUPLET) this.smiles += '^1:'
    // RADICAL_TRIPLET
    else this.smiles += '^4:'

    this.smiles += i

    for (j = i + 1; j < this.writtenAtoms.length; j++) {
      if (mol.atoms.get(this.writtenAtoms[j]).radical === radical) {
        marked[j] = true
        this.smiles += ',' + j
      }
    }
  }
}
