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

import { Bond, Pile, Pool, Vec2 } from 'domain/entities';

function Stereocenters(mol, neighborsFunc, context) {
  this.molecule = mol;
  this.atoms = new Pool();
  this.getNeighbors = neighborsFunc;
  this.context = context;
}

Stereocenters.prototype.each = function (func, context) {
  this.atoms.forEach(func, context);
};

Stereocenters.prototype.buildFromBonds = function (
  /* const int *atom_types, const int *atom_groups, const int *bond_orientations, */ ignoreErrors,
) {
  const atoms = this.molecule.atoms;
  const bonds = this.molecule.bonds;

  /*
		this is a set of atoms that are likely to belong to allene structures and
		therefore should not be considered as potential stereocenters in the code below,
		as allenes cannot be encoded in the SMILES notation
	*/

  const alleneMask = new Pile();
  atoms.forEach((atom, aid) => {
    const neiList = this.getNeighbors.call(this.context, aid);
    if (neiList.length !== 2) return false;
    const nei1 = neiList[0];
    const nei2 = neiList[1];
    // check atom labels
    if (
      [aid, nei1.aid, nei2.aid].findIndex(
        (aid) => ['C', 'Si'].indexOf(atoms.get(aid).label) < 0,
        this,
      ) >= 0
    ) {
      return false;
    }

    // check adjacent bond types
    if (
      [nei1.bid, nei2.bid].findIndex(
        (bid) => bonds.get(bid).type !== Bond.PATTERN.TYPE.DOUBLE,
        this,
      ) >= 0
    ) {
      return false;
    }

    // get the other neighbors of the two adjacent atoms except for the central atom
    const nei1nei = this.getNeighbors
      .call(this.context, nei1.aid)
      .filter((nei) => nei.aid !== aid);
    const nei2nei = this.getNeighbors
      .call(this.context, nei2.aid)
      .filter((nei) => nei.aid !== aid);
    if (
      nei1nei.length < 1 ||
      nei1nei.length > 2 ||
      nei2nei.length < 1 ||
      nei2nei.length > 2
    ) {
      return false;
    }

    if (
      nei1nei
        .concat(nei2nei)
        .findIndex(
          (nei) => bonds.get(nei.bid).type !== Bond.PATTERN.TYPE.SINGLE,
          this,
        ) >= 0
    ) {
      return false;
    }

    if (
      nei1nei
        .concat(nei2nei)
        .findIndex(
          (nei) => bonds.get(nei.bid).stereo === Bond.PATTERN.STEREO.EITHER,
          this,
        ) >= 0
    ) {
      return false;
    }
    alleneMask.add(nei1.aid).add(nei2.aid);
    return true;
  });

  if (alleneMask.size > 0) {
    // TODO: add error handler call
    // legacy message: This structure may contain allenes, which cannot be represented in the SMILES notation. Relevant stereo-information will be discarded.

    atoms.forEach((atom, aid) => {
      if (alleneMask.has(aid)) return;
      /*
      if (atom_types[atom_idx] == 0)
         continue;
         */
      const neiList = this.getNeighbors.call(this.context, aid);
      let stereocenter = false;

      neiList.find(function (nei) {
        const bond = this.molecule.bonds.get(nei.bid);

        if (bond.type === Bond.PATTERN.TYPE.SINGLE && bond.begin === aid) {
          if (
            bond.stereo === Bond.PATTERN.STEREO.UP ||
            bond.stereo === Bond.PATTERN.STEREO.DOWN
          ) {
            stereocenter = true;
            return true;
          }
        }
        return false;
      }, this);

      if (!stereocenter) return;

      if (ignoreErrors) {
        this.buildOneCenter(
          aid /* , atom_groups[atom_idx], atom_types[atom_idx], bond_orientations */,
        );
      } else {
        this.buildOneCenter(
          aid /* , atom_groups[atom_idx], atom_types[atom_idx], bond_orientations */,
        );
      }
    });
  }
};

Stereocenters.allowed_stereocenters = [
  { elem: 'C', charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'C', charge: 0, degree: 4, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'Si', charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'Si', charge: 0, degree: 4, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'N', charge: 1, degree: 3, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'N', charge: 1, degree: 4, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'N', charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 3 },
  { elem: 'S', charge: 0, degree: 4, n_double_bonds: 2, implicit_degree: 4 },
  { elem: 'S', charge: 1, degree: 3, n_double_bonds: 0, implicit_degree: 3 },
  { elem: 'S', charge: 0, degree: 3, n_double_bonds: 1, implicit_degree: 3 },
  { elem: 'P', charge: 0, degree: 3, n_double_bonds: 0, implicit_degree: 3 },
  { elem: 'P', charge: 1, degree: 4, n_double_bonds: 0, implicit_degree: 4 },
  { elem: 'P', charge: 0, degree: 4, n_double_bonds: 1, implicit_degree: 4 },
];

Stereocenters.prototype.buildOneCenter = function (
  atomIdx /* , int group, int type, const int *bond_orientations */,
) {
  // eslint-disable-line max-statements
  const atom = this.molecule.atoms.get(atomIdx);

  const neiList = this.getNeighbors.call(this.context, atomIdx);
  const degree = neiList.length;
  let implicitDegree = -1;

  const stereocenter = {
    group: 0, // = group;
    type: 0, // = type;
    pyramid: [],
  };

  const edgeIds = [];

  let lastAtomDir = 0;
  let nDoubleBonds = 0;

  stereocenter.pyramid[0] = -1;
  stereocenter.pyramid[1] = -1;
  stereocenter.pyramid[2] = -1;
  stereocenter.pyramid[3] = -1;

  let nPureHydrogens = 0;

  if (degree > 4) {
    throw new Error('stereocenter with %d bonds are not supported' + degree);
  }

  neiList.forEach((nei, neiIdx) => {
    const neiAtom = this.molecule.atoms.get(nei.aid);
    const bond = this.molecule.bonds.get(nei.bid);
    edgeIds[neiIdx] = {
      edge_idx: nei.bid,
      nei_idx: nei.aid,
      rank: nei.aid,
      vec: Vec2.diff(neiAtom.pp, atom.pp).yComplement(),
    };

    if (neiAtom.pureHydrogen()) {
      nPureHydrogens++;
      edgeIds[neiIdx].rank = 10000;
    } else if (neiAtom.label === 'H') {
      edgeIds[neiIdx].rank = 5000;
    }

    if (!edgeIds[neiIdx].vec.normalize()) throw new Error('zero bond length');

    if (bond.type === Bond.PATTERN.TYPE.TRIPLE) {
      throw new Error('non-single bonds not allowed near stereocenter');
    } else if (bond.type === Bond.PATTERN.TYPE.AROMATIC) {
      throw new Error('aromatic bonds not allowed near stereocenter');
    } else if (bond.type === Bond.PATTERN.TYPE.DOUBLE) nDoubleBonds++;
  });

  Stereocenters.allowed_stereocenters.find((as) => {
    if (
      as.elem === atom.label &&
      as.charge === atom.charge &&
      as.degree === degree &&
      as.n_double_bonds === nDoubleBonds
    ) {
      implicitDegree = as.implicit_degree;
      return true;
    }
    return false;
  });

  if (implicitDegree === -1) {
    throw new Error(
      'unknown stereocenter configuration: ' +
        atom.label +
        ', charge ' +
        atom.charge +
        ', ' +
        degree +
        ' bonds (' +
        nDoubleBonds +
        ' double)',
    );
  }

  if (degree === 4 && nPureHydrogens > 1) {
    throw new Error(nPureHydrogens + ' hydrogens near stereocenter');
  }

  if (degree === 3 && implicitDegree === 4 && nPureHydrogens > 0) {
    throw new Error(
      'have hydrogen(s) besides implicit hydrogen near stereocenter',
    );
  }

  if (degree === 4) {
    // sort by neighbor atom index (ascending)
    if (edgeIds[0].rank > edgeIds[1].rank) swap(edgeIds, 0, 1);
    if (edgeIds[1].rank > edgeIds[2].rank) swap(edgeIds, 1, 2);
    if (edgeIds[2].rank > edgeIds[3].rank) swap(edgeIds, 2, 3);
    if (edgeIds[1].rank > edgeIds[2].rank) swap(edgeIds, 1, 2);
    if (edgeIds[0].rank > edgeIds[1].rank) swap(edgeIds, 0, 1);
    if (edgeIds[1].rank > edgeIds[2].rank) swap(edgeIds, 1, 2);

    var main1 = -1;
    let main2 = -1;
    var side1 = -1;
    var side2 = -1;
    var mainDir = 0;

    for (var neiIdx = 0; neiIdx < 4; neiIdx++) {
      const stereo = this.getBondStereo(atomIdx, edgeIds[neiIdx].edge_idx);

      if (
        stereo === Bond.PATTERN.STEREO.UP ||
        stereo === Bond.PATTERN.STEREO.DOWN
      ) {
        main1 = neiIdx;
        mainDir = stereo;
        break;
      }
    }

    if (main1 === -1) {
      throw new Error('none of 4 bonds going from stereocenter is stereobond');
    }

    let xyz1, xyz2;

    // find main2 as opposite to main1
    if (main2 === -1) {
      xyz1 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 1) % 4].vec,
        edgeIds[(main1 + 2) % 4].vec,
      );
      xyz2 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 1) % 4].vec,
        edgeIds[(main1 + 3) % 4].vec,
      );

      if (xyz1 + xyz2 === 3 || xyz1 + xyz2 === 12) {
        main2 = (main1 + 1) % 4;
        side1 = (main1 + 2) % 4;
        side2 = (main1 + 3) % 4;
      }
    }
    if (main2 === -1) {
      xyz1 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 2) % 4].vec,
        edgeIds[(main1 + 1) % 4].vec,
      );
      xyz2 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 2) % 4].vec,
        edgeIds[(main1 + 3) % 4].vec,
      );

      if (xyz1 + xyz2 === 3 || xyz1 + xyz2 === 12) {
        main2 = (main1 + 2) % 4;
        side1 = (main1 + 1) % 4;
        side2 = (main1 + 3) % 4;
      }
    }
    if (main2 === -1) {
      xyz1 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 3) % 4].vec,
        edgeIds[(main1 + 1) % 4].vec,
      );
      xyz2 = Stereocenters.xyzzy(
        edgeIds[main1].vec,
        edgeIds[(main1 + 3) % 4].vec,
        edgeIds[(main1 + 2) % 4].vec,
      );

      if (xyz1 + xyz2 === 3 || xyz1 + xyz2 === 12) {
        main2 = (main1 + 3) % 4;
        side1 = (main1 + 2) % 4;
        side2 = (main1 + 1) % 4;
      }
    }

    if (main2 === -1) {
      throw new Error('internal error: can not find opposite bond');
    }

    if (
      mainDir === Bond.PATTERN.STEREO.UP &&
      this.getBondStereo(atomIdx, edgeIds[main2].edge_idx) ===
        Bond.PATTERN.STEREO.DOWN
    ) {
      throw new Error('stereo types of the opposite bonds mismatch');
    }
    if (
      mainDir === Bond.PATTERN.STEREO.DOWN &&
      this.getBondStereo(atomIdx, edgeIds[main2].edge_idx) ===
        Bond.PATTERN.STEREO.UP
    ) {
      throw new Error('stereo types of the opposite bonds mismatch');
    }

    if (mainDir === this.getBondStereo(atomIdx, edgeIds[side1].edge_idx)) {
      throw new Error('stereo types of non-opposite bonds match');
    }
    if (mainDir === this.getBondStereo(atomIdx, edgeIds[side2].edge_idx)) {
      throw new Error('stereo types of non-opposite bonds match');
    }

    if (main1 === 3 || main2 === 3) lastAtomDir = mainDir;
    else {
      lastAtomDir =
        mainDir === Bond.PATTERN.STEREO.UP
          ? Bond.PATTERN.STEREO.DOWN
          : Bond.PATTERN.STEREO.UP;
    }

    const sign = Stereocenters.sign(
      edgeIds[0].vec,
      edgeIds[1].vec,
      edgeIds[2].vec,
    );

    if (
      (lastAtomDir === Bond.PATTERN.STEREO.UP && sign > 0) ||
      (lastAtomDir === Bond.PATTERN.STEREO.DOWN && sign < 0)
    ) {
      stereocenter.pyramid[0] = edgeIds[0].nei_idx;
      stereocenter.pyramid[1] = edgeIds[1].nei_idx;
      stereocenter.pyramid[2] = edgeIds[2].nei_idx;
    } else {
      stereocenter.pyramid[0] = edgeIds[0].nei_idx;
      stereocenter.pyramid[1] = edgeIds[2].nei_idx;
      stereocenter.pyramid[2] = edgeIds[1].nei_idx;
    }

    stereocenter.pyramid[3] = edgeIds[3].nei_idx;
  } else if (degree === 3) {
    // sort by neighbor atom index (ascending)
    if (edgeIds[0].rank > edgeIds[1].rank) swap(edgeIds, 0, 1);
    if (edgeIds[1].rank > edgeIds[2].rank) swap(edgeIds, 1, 2);
    if (edgeIds[0].rank > edgeIds[1].rank) swap(edgeIds, 0, 1);

    const stereo0 = this.getBondStereo(atomIdx, edgeIds[0].edge_idx);
    const stereo1 = this.getBondStereo(atomIdx, edgeIds[1].edge_idx);
    const stereo2 = this.getBondStereo(atomIdx, edgeIds[2].edge_idx);

    let nUp = 0;
    let nDown = 0;

    nUp += stereo0 === Bond.PATTERN.STEREO.UP ? 1 : 0;
    nUp += stereo1 === Bond.PATTERN.STEREO.UP ? 1 : 0;
    nUp += stereo2 === Bond.PATTERN.STEREO.UP ? 1 : 0;

    nDown += stereo0 === Bond.PATTERN.STEREO.DOWN ? 1 : 0;
    nDown += stereo1 === Bond.PATTERN.STEREO.DOWN ? 1 : 0;
    nDown += stereo2 === Bond.PATTERN.STEREO.DOWN ? 1 : 0;

    if (implicitDegree === 4) {
      // have implicit hydrogen
      if (nUp === 3) throw new Error('all 3 bonds up near stereoatom');
      if (nDown === 3) throw new Error('all 3 bonds down near stereoatom');

      if (nUp === 0 && nDown === 0) {
        throw new Error('no up/down bonds near stereoatom -- indefinite case');
      }
      if (nUp === 1 && nDown === 1) {
        throw new Error('one bond up, one bond down -- indefinite case');
      }

      mainDir = 0;

      if (nUp === 2) {
        lastAtomDir = Bond.PATTERN.STEREO.DOWN;
      } else if (nDown === 2) {
        lastAtomDir = Bond.PATTERN.STEREO.UP;
      } else {
        main1 = -1;
        side1 = -1;
        side2 = -1;

        for (neiIdx = 0; neiIdx < 3; neiIdx++) {
          const dir = this.getBondStereo(atomIdx, edgeIds[neiIdx].edge_idx);

          if (
            dir === Bond.PATTERN.STEREO.UP ||
            dir === Bond.PATTERN.STEREO.DOWN
          ) {
            // eslint-disable-line max-depth
            main1 = neiIdx;
            mainDir = dir;
            side1 = (neiIdx + 1) % 3;
            side2 = (neiIdx + 2) % 3;
            break;
          }
        }

        if (main1 === -1) {
          throw new Error('internal error: can not find up or down bond');
        }

        const xyz = Stereocenters.xyzzy(
          edgeIds[side1].vec,
          edgeIds[side2].vec,
          edgeIds[main1].vec,
        );

        if (xyz === 3 || xyz === 4) {
          throw new Error('degenerate case for 3 bonds near stereoatom');
        }

        if (xyz === 1) lastAtomDir = mainDir;
        else {
          lastAtomDir =
            mainDir === Bond.PATTERN.STEREO.UP
              ? Bond.PATTERN.STEREO.DOWN
              : Bond.PATTERN.STEREO.UP;
        }
      }

      const sign = Stereocenters.sign(
        edgeIds[0].vec,
        edgeIds[1].vec,
        edgeIds[2].vec,
      );

      if (
        (lastAtomDir === Bond.PATTERN.STEREO.UP && sign > 0) ||
        (lastAtomDir === Bond.PATTERN.STEREO.DOWN && sign < 0)
      ) {
        stereocenter.pyramid[0] = edgeIds[0].nei_idx;
        stereocenter.pyramid[1] = edgeIds[1].nei_idx;
        stereocenter.pyramid[2] = edgeIds[2].nei_idx;
      } else {
        stereocenter.pyramid[0] = edgeIds[0].nei_idx;
        stereocenter.pyramid[1] = edgeIds[2].nei_idx;
        stereocenter.pyramid[2] = edgeIds[1].nei_idx;
      }

      stereocenter.pyramid[3] = -1;
    } else {
      // 3-connected P, N or S; no implicit hydrogens
      let dir;

      if (nDown > 0 && nUp > 0) {
        throw new Error('one bond up, one bond down -- indefinite case');
      } else if (nDown === 0 && nUp === 0) {
        throw new Error('no up-down bonds attached to stereocenter');
      } else if (nUp > 0) dir = 1;
      else dir = -1;

      if (
        Stereocenters.xyzzy(edgeIds[0].vec, edgeIds[1].vec, edgeIds[2].vec) ===
          1 ||
        Stereocenters.xyzzy(edgeIds[0].vec, edgeIds[2].vec, edgeIds[1].vec) ===
          1 ||
        Stereocenters.xyzzy(edgeIds[2].vec, edgeIds[1].vec, edgeIds[0].vec) ===
          1
      ) {
        // all bonds belong to the same half-plane
        dir = -dir;
      }

      const sign = Stereocenters.sign(
        edgeIds[0].vec,
        edgeIds[1].vec,
        edgeIds[2].vec,
      );

      if (sign === dir) {
        stereocenter.pyramid[0] = edgeIds[0].nei_idx;
        stereocenter.pyramid[1] = edgeIds[2].nei_idx;
        stereocenter.pyramid[2] = edgeIds[1].nei_idx;
      } else {
        stereocenter.pyramid[0] = edgeIds[0].nei_idx;
        stereocenter.pyramid[1] = edgeIds[1].nei_idx;
        stereocenter.pyramid[2] = edgeIds[2].nei_idx;
      }
      stereocenter.pyramid[3] = -1;
    }
  }
  this.atoms.set(atomIdx, stereocenter);
};

Stereocenters.prototype.getBondStereo = function (centerIdx, edgeIdx) {
  const bond = this.molecule.bonds.get(edgeIdx);

  if (centerIdx !== bond.begin) {
    // TODO: check this
    return 0;
  }

  return bond.stereo;
};

// 1 -- in the smaller angle, 2 -- in the bigger angle,
// 4 -- in the 'positive' straight angle, 8 -- in the 'negative' straight angle
Stereocenters.xyzzy = function (v1, v2, u) {
  const eps = 0.001;

  const sine1 = Vec2.cross(v1, v2);
  const cosine1 = Vec2.dot(v1, v2);

  const sine2 = Vec2.cross(v1, u);
  const cosine2 = Vec2.dot(v1, u);

  if (Math.abs(sine1) < eps) {
    if (Math.abs(sine2) < eps) {
      throw new Error('degenerate case -- bonds overlap');
    }

    return sine2 > 0 ? 4 : 8;
  }

  if (sine1 * sine2 < -eps * eps) return 2;

  if (cosine2 < cosine1) return 2;

  return 1;
};

Stereocenters.sign = function (v1, v2, v3) {
  const res = (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x); // eslint-disable-line no-mixed-operators
  const eps = 0.001;

  if (res > eps) return 1;
  if (res < -eps) return -1;

  throw new Error('degenerate triangle');
};

Stereocenters.isPyramidMappingRigid = function (mapping) {
  const arr = mapping.slice();
  let rigid = true;

  if (arr[0] > arr[1]) {
    swap(arr, 0, 1);
    rigid = !rigid;
  }
  if (arr[1] > arr[2]) {
    swap(arr, 1, 2);
    rigid = !rigid;
  }
  if (arr[2] > arr[3]) {
    swap(arr, 2, 3);
    rigid = !rigid;
  }
  if (arr[1] > arr[2]) {
    swap(arr, 1, 2);
    rigid = !rigid;
  }
  if (arr[0] > arr[1]) {
    swap(arr, 0, 1);
    rigid = !rigid;
  }
  if (arr[1] > arr[2]) {
    swap(arr, 1, 2);
    rigid = !rigid;
  }

  return rigid;
};

function swap(arr, i1, i2) {
  const tmp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = tmp;
}

export default Stereocenters;
