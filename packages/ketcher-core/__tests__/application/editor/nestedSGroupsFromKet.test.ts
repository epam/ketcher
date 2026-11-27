/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { KetSerializer } from 'domain/serializers/ket/ketSerializer';

type KetSGroup = { type: string; atoms: number[] } & Record<string, unknown>;

const ATOMS_PER_FRAGMENT = 2;
const FRAGMENT_STEP = 3;

// The x coordinate of an atom gives its index in the source KET after loading
const xOfAtom = (atomIndex: number) =>
  Math.floor(atomIndex / ATOMS_PER_FRAGMENT) * FRAGMENT_STEP +
  (atomIndex % ATOMS_PER_FRAGMENT);

const atomIndexOfX = (x: number) => {
  const roundedX = Math.round(x);
  return (
    Math.floor(roundedX / FRAGMENT_STEP) * ATOMS_PER_FRAGMENT +
    (roundedX % FRAGMENT_STEP)
  );
};

const buildKet = (fragmentsCount: number, sgroups: KetSGroup[]) => {
  const atoms: { label: string; location: number[] }[] = [];
  const bonds: { type: number; atoms: number[] }[] = [];

  for (let fragment = 0; fragment < fragmentsCount; fragment++) {
    const firstAtom = fragment * ATOMS_PER_FRAGMENT;
    atoms.push(
      { label: 'C', location: [xOfAtom(firstAtom), 0, 0] },
      { label: 'O', location: [xOfAtom(firstAtom + 1), 0, 0] },
    );
    bonds.push({ type: 1, atoms: [firstAtom, firstAtom + 1] });
  }

  return JSON.stringify({
    root: { nodes: [{ $ref: 'mol0' }] },
    mol0: { type: 'molecule', atoms, bonds, sgroups },
  });
};

const load = (fragmentsCount: number, sgroups: KetSGroup[]) => {
  const struct = new KetSerializer().deserialize(
    buildKet(fragmentsCount, sgroups),
  );
  const sourceIndexOf = (atomId: number) => {
    const atom = struct.atoms.get(atomId);
    if (!atom) throw new Error(`S-group refers to missing atom ${atomId}`);
    return atomIndexOfX(atom.pp.x);
  };

  return {
    atoms: [...struct.atoms.keys()].map(sourceIndexOf).sort((a, b) => a - b),
    bondsCount: struct.bonds.size,
    sgroups: [...struct.sgroups.values()]
      .map((sgroup) => ({
        type: sgroup.type,
        atoms: sgroup.atoms.map(sourceIndexOf).sort((a, b) => a - b),
      }))
      .sort(
        (a, b) =>
          a.atoms.length - b.atoms.length ||
          a.atoms[0] - b.atoms[0] ||
          a.type.localeCompare(b.type),
      ),
  };
};

const atomsOfFragments = (fragmentsCount: number) =>
  Array.from({ length: fragmentsCount * ATOMS_PER_FRAGMENT }, (_, i) => i);

describe('Loading nested S-groups that span several fragments from KET', () => {
  it('keeps a structure without S-groups unchanged', () => {
    expect(load(2, [])).toEqual({
      atoms: [0, 1, 2, 3],
      bondsCount: 2,
      sgroups: [],
    });
  });

  it('loads an inner generic group listed before the outer copolymer', () => {
    expect(
      load(2, [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
      ]),
    ).toEqual({
      atoms: [0, 1, 2, 3],
      bondsCount: 2,
      sgroups: [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
      ],
    });
  });

  it('loads an outer copolymer listed before the inner generic group', () => {
    expect(
      load(2, [
        { type: 'COP', atoms: [0, 1, 2, 3] },
        { type: 'GEN', atoms: [0, 1] },
      ]),
    ).toEqual({
      atoms: [0, 1, 2, 3],
      bondsCount: 2,
      sgroups: [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
      ],
    });
  });

  it('loads an inner SRU listed before the outer MUL', () => {
    expect(
      load(2, [
        { type: 'SRU', atoms: [0, 1], subscript: 'n', connectivity: 'HT' },
        { type: 'MUL', atoms: [0, 1, 2, 3], mul: 2 },
      ]),
    ).toEqual({
      atoms: [0, 1, 2, 3],
      bondsCount: 2,
      sgroups: [
        { type: 'SRU', atoms: [0, 1] },
        { type: 'MUL', atoms: [0, 1, 2, 3] },
      ],
    });
  });

  it('loads two sibling groups over different fragments inside one outer group', () => {
    expect(
      load(3, [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'GEN', atoms: [4, 5] },
        { type: 'COP', atoms: atomsOfFragments(3) },
      ]),
    ).toEqual({
      atoms: atomsOfFragments(3),
      bondsCount: 3,
      sgroups: [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'GEN', atoms: [4, 5] },
        { type: 'COP', atoms: atomsOfFragments(3) },
      ],
    });
  });

  it('loads three levels of nesting listed innermost first', () => {
    expect(
      load(3, [
        { type: 'SRU', atoms: [0, 1], subscript: 'n', connectivity: 'HT' },
        { type: 'GEN', atoms: [0, 1, 2, 3] },
        { type: 'COP', atoms: atomsOfFragments(3) },
      ]),
    ).toEqual({
      atoms: atomsOfFragments(3),
      bondsCount: 3,
      sgroups: [
        { type: 'SRU', atoms: [0, 1] },
        { type: 'GEN', atoms: [0, 1, 2, 3] },
        { type: 'COP', atoms: atomsOfFragments(3) },
      ],
    });
  });

  it('loads two groups with the identical atom set', () => {
    expect(
      load(2, [
        { type: 'GEN', atoms: [0, 1, 2, 3] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
      ]),
    ).toEqual({
      atoms: [0, 1, 2, 3],
      bondsCount: 2,
      sgroups: [
        { type: 'COP', atoms: [0, 1, 2, 3] },
        { type: 'GEN', atoms: [0, 1, 2, 3] },
      ],
    });
  });

  it('keeps fragments of unrelated S-groups apart from a nested pair', () => {
    expect(
      load(4, [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
        { type: 'GEN', atoms: [6, 7] },
      ]),
    ).toEqual({
      atoms: atomsOfFragments(4),
      bondsCount: 4,
      sgroups: [
        { type: 'GEN', atoms: [0, 1] },
        { type: 'GEN', atoms: [6, 7] },
        { type: 'COP', atoms: [0, 1, 2, 3] },
      ],
    });
  });
});
