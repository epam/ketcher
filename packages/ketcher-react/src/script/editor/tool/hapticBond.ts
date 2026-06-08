import {
  Action,
  Atom,
  Bond,
  fromAtomAddition,
  fromBondAddition,
  SuperAttachmentPoint,
  Vec2,
} from 'ketcher-core';

import Editor from '../Editor';

const HAPTIC_BOND_ENDPOINT_ERROR =
  'A haptic bond can be established only between a super-attachment point and a central atom.';

interface HapticDragCtx {
  origin: { map: string; id: number } | null;
}

class HapticBondTool {
  private readonly editor: Editor;
  private dragCtx: HapticDragCtx | null = null;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  // Find what the cursor is over: an atom or a SuperAttachmentPoint. Used
  // by mousedown/mouseup to validate endpoints.
  private findEndpoint(event: PointerEvent) {
    return this.editor.findItem(event, ['atoms', 'superAttachmentPoints']);
  }

  mousedown(event: PointerEvent) {
    const ci = this.findEndpoint(event);
    this.dragCtx = {
      origin: ci ? { map: ci.map, id: ci.id } : null,
    };
    return true;
  }

  mousemove(event: PointerEvent) {
    if (!this.dragCtx) {
      this.editor.hover(this.findEndpoint(event), null, event);
    }
    return true;
  }

  mouseup(event: PointerEvent) {
    const ctx = this.dragCtx;
    this.dragCtx = null;
    if (!ctx) return true;

    const ci = this.findEndpoint(event);
    const struct = this.editor.render.ctab;

    // No origin and no end → nothing to do (click on empty canvas).
    if (!ctx.origin && !ci) return true;

    // Click-only on a regular atom (no drag, atom origin = atom end).
    if (
      ctx.origin &&
      ctx.origin.map === 'atoms' &&
      (!ci || (ci.map === 'atoms' && ci.id === ctx.origin.id))
    ) {
      this.editor.errorHandler?.(HAPTIC_BOND_ENDPOINT_ERROR);
      return true;
    }

    // Click-only on a SuperAttachmentPoint (no drag): add a fresh carbon at
    // default offset, then a haptic bond.
    if (
      ctx.origin &&
      ctx.origin.map === 'superAttachmentPoints' &&
      (!ci || (ci.map === 'superAttachmentPoints' && ci.id === ctx.origin.id))
    ) {
      this.addCarbonAndBond(ctx.origin.id);
      return true;
    }

    // Drag SuperAttachmentPoint↔atom: succeed if exactly one endpoint is a
    // SuperAttachmentPoint.
    const a = ctx.origin;
    const b = ci ? { map: ci.map, id: ci.id } : null;
    if (!a || !b) {
      this.editor.errorHandler?.(HAPTIC_BOND_ENDPOINT_ERROR);
      return true;
    }
    const isAtomToSuperAttachmentPoint =
      (a.map === 'atoms' && b.map === 'superAttachmentPoints') ||
      (a.map === 'superAttachmentPoints' && b.map === 'atoms');
    if (!isAtomToSuperAttachmentPoint) {
      this.editor.errorHandler?.(HAPTIC_BOND_ENDPOINT_ERROR);
      return true;
    }
    const atomId = a.map === 'atoms' ? a.id : b.id;
    const superAttachmentPointAtomId =
      a.map === 'superAttachmentPoints' ? a.id : b.id;
    const [action] = fromBondAddition(
      struct,
      { type: Bond.PATTERN.TYPE.HAPTIC },
      atomId,
      superAttachmentPointAtomId,
    );
    this.editor.update(action);
    return true;
  }

  private addCarbonAndBond(superAttachmentPointAtomId: number) {
    const struct = this.editor.render.ctab;
    const superAttachmentPoint = struct.molecule.atoms.get(
      superAttachmentPointAtomId,
    );
    if (!(superAttachmentPoint instanceof SuperAttachmentPoint)) return;
    superAttachmentPoint.recomputeCenter(struct.molecule);
    // Place the new carbon one bond-length to the right of the SAP centroid.
    const offset = new Vec2(1.5, 0);
    const newAtomPos = superAttachmentPoint.pp.add(offset);
    const action = new Action();
    const addAction = fromAtomAddition(struct, newAtomPos, {
      label: 'C',
    } as Partial<Atom>);
    action.mergeWith(addAction);
    const newAid = action.operations
      .map(
        (op) =>
          (op as { data?: { aid?: unknown } }).data?.aid as number | undefined,
      )
      .find((aid): aid is number => typeof aid === 'number');
    if (newAid === undefined) return;
    const [bondAction] = fromBondAddition(
      struct,
      { type: Bond.PATTERN.TYPE.HAPTIC },
      newAid,
      superAttachmentPointAtomId,
    );
    action.mergeWith(bondAction);
    this.editor.update(action);
  }

  cancel() {
    this.dragCtx = null;
  }
}

export default HapticBondTool;
