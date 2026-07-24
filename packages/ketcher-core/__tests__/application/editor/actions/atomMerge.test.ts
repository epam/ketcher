/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { fromAtomMerge } from 'application/editor/actions/atomMerge';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';

describe('fromAtomMerge', () => {
  // Reproduces merging a functional-group atom (which is an S-group
  // attachment point) into a canvas atom, then undoing the merge.
  it('does not throw on undo after merging an S-group attachment-point atom', () => {
    const struct = new Struct();

    const srcId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const groupNeighbourId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const dstId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0 }),
    );

    const sgroup = new SGroup(SGroup.TYPES.SUP);
    const sgroupId = struct.sgroups.add(sgroup);
    sgroup.id = sgroupId;
    struct.atomAddToSGroup(sgroupId, srcId);
    struct.atomAddToSGroup(sgroupId, groupNeighbourId);
    sgroup.addAttachmentPoint(
      new SGroupAttachmentPoint(srcId, undefined, undefined),
    );

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.assignConnectedComponents();

    // Forward merge (drag functional group onto canvas atom).
    const undoAction = fromAtomMerge(restruct, srcId, dstId);

    // The attachment point must actually be removed from the S-group once
    // its atom has been merged away, not silently left dangling.
    expect(sgroup.getAttachmentPoints()).toHaveLength(0);

    // Undo must not throw "The same attachment point cannot be added to an
    // S-group more than once".
    expect(() => undoAction.perform(restruct)).not.toThrow();

    // The attachment point should be restored after undo.
    const restoredAttachmentPoints = sgroup.getAttachmentPoints();
    expect(restoredAttachmentPoints).toHaveLength(1);
    expect(restoredAttachmentPoints[0].atomId).toBe(srcId);
  });
});
