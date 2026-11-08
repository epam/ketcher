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

import { fromTemplateOnBondAction } from 'application/editor/actions/template';
import type { EditorTemplate } from 'application/editor/actions/template.types';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import { Atom, Bond, Fragment, Struct, Vec2 } from 'domain/entities';

// https://github.com/epam/ketcher/issues/9739
// When a template is fused onto a bond and one of its atoms lands on an
// existing atom of another fragment, the two structures become connected,
// so their fragments must be merged (the same rule as bond addition and
// atom merge).

function buildReStruct(struct: Struct) {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  const reStruct = new ReStruct(struct, render);
  reStruct.assignConnectedComponents();
  // Atom collision lookup only sees visible atoms, which the editor fills in
  // on render.
  reStruct.recalculateVisibleAtomsAndBonds();
  return reStruct;
}

function addAtom(struct: Struct, pos: Vec2, fragment: number) {
  return struct.atoms.add(new Atom({ label: 'C', pp: pos, fragment }));
}

function addBond(struct: Struct, begin: number, end: number) {
  return struct.bonds.add(
    new Bond({ type: Bond.PATTERN.TYPE.SINGLE, begin, end }),
  );
}

/**
 * Square template: T0(0,0) - T1(1,0) - T2(1,1) - T3(0,1).
 * Fused onto a horizontal bond (0,0)-(1,0) with no rotation or scaling,
 * T2 lands on (1,1) and T3 on (0,1).
 */
function buildSquareTemplate(): EditorTemplate {
  const molecule = new Struct();
  const frid = molecule.frags.add(new Fragment([]));
  const t0 = addAtom(molecule, new Vec2(0, 0), frid);
  const t1 = addAtom(molecule, new Vec2(1, 0), frid);
  const t2 = addAtom(molecule, new Vec2(1, 1), frid);
  const t3 = addAtom(molecule, new Vec2(0, 1), frid);
  const bid = addBond(molecule, t0, t1);
  addBond(molecule, t1, t2);
  addBond(molecule, t2, t3);
  addBond(molecule, t3, t0);

  return { molecule, aid: t0, bid, angle0: 0 };
}

describe('fromTemplateOnBondAction: atom collision during template placement', () => {
  it('merges the fragment of a collided atom into the bond fragment', () => {
    const struct = new Struct();
    const fragA = struct.frags.add(new Fragment([]));
    const fragB = struct.frags.add(new Fragment([]));

    // Fragment A: the bond the template is fused onto.
    const a0 = addAtom(struct, new Vec2(0, 0), fragA);
    const a1 = addAtom(struct, new Vec2(1, 0), fragA);
    const bid = addBond(struct, a0, a1);

    // Fragment B: a separate chain whose first atom sits exactly where the
    // template atom T2 will land.
    const b0 = addAtom(struct, new Vec2(1, 1), fragB);
    const b1 = addAtom(struct, new Vec2(2, 1), fragB);
    addBond(struct, b0, b1);

    const restruct = buildReStruct(struct);

    const [undoAction] = fromTemplateOnBondAction(
      restruct,
      buildSquareTemplate(),
      bid,
      null,
      false,
      false,
    );

    // b0 was reused instead of a new atom being placed on top of it:
    // a0, a1, b0, b1 + one new atom for T3.
    expect(struct.atoms.size).toBe(5);

    // Every atom now belongs to fragment A and fragment B is gone.
    struct.atoms.forEach((atom) => {
      expect(atom.fragment).toBe(fragA);
    });
    expect(struct.frags.has(fragB)).toBe(false);
    expect(struct.frags.size).toBe(1);

    // Undo restores both original fragments.
    undoAction.perform(restruct);

    expect(struct.atoms.size).toBe(4);
    expect(struct.frags.has(fragB)).toBe(true);
    expect(struct.atoms.get(a0)?.fragment).toBe(fragA);
    expect(struct.atoms.get(a1)?.fragment).toBe(fragA);
    expect(struct.atoms.get(b0)?.fragment).toBe(fragB);
    expect(struct.atoms.get(b1)?.fragment).toBe(fragB);
  });

  it('leaves fragments unchanged when the collided atom is in the same fragment', () => {
    const struct = new Struct();
    const frag = struct.frags.add(new Fragment([]));

    // A chain a2 - a0 - a1 - a3 where a3 sits where T2 will land.
    const a0 = addAtom(struct, new Vec2(0, 0), frag);
    const a1 = addAtom(struct, new Vec2(1, 0), frag);
    const a3 = addAtom(struct, new Vec2(1, 1), frag);
    const bid = addBond(struct, a0, a1);
    addBond(struct, a1, a3);

    const restruct = buildReStruct(struct);

    fromTemplateOnBondAction(
      restruct,
      buildSquareTemplate(),
      bid,
      null,
      false,
      false,
    );

    // a0, a1, a3 + one new atom for T3.
    expect(struct.atoms.size).toBe(4);
    expect(struct.frags.size).toBe(1);
    struct.atoms.forEach((atom) => {
      expect(atom.fragment).toBe(frag);
    });
  });
});
