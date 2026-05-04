/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 ***************************************************************************/

import {
  Action,
  Atom,
  fromAtomAddition,
  fromHapticBondAddition,
  Vec2,
} from 'ketcher-core';

import Editor from '../Editor';
import type { Tool } from './Tool';

const HAPTIC_BOND_ENDPOINT_ERROR =
  'A haptic bond can be established only between a super-attachment point and a central atom.';

interface HapticDragCtx {
  origin: { map: string; id: number } | null;
}

class HapticBondTool implements Tool {
  private readonly editor: Editor;
  private dragCtx: HapticDragCtx | null = null;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  // Find what the cursor is over: an atom or a SAP. Used by
  // mousedown/mouseup to validate endpoints.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private findEndpoint(event: any) {
    return this.editor.findItem(event, ['atoms', 'superAttachmentPoints']);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mousedown(event: any) {
    const ci = this.findEndpoint(event);
    this.dragCtx = {
      origin: ci ? { map: ci.map, id: ci.id } : null,
    };
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mousemove(event: any) {
    if (!this.dragCtx) {
      this.editor.hover(this.findEndpoint(event), null, event);
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mouseup(event: any) {
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

    // Click-only on a SAP (no drag, SAP origin = SAP end OR no end target):
    // add a fresh carbon at default offset, then a haptic bond.
    if (
      ctx.origin &&
      ctx.origin.map === 'superAttachmentPoints' &&
      (!ci || (ci.map === 'superAttachmentPoints' && ci.id === ctx.origin.id))
    ) {
      this.addCarbonAndBond(ctx.origin.id);
      return true;
    }

    // Drag SAP↔atom or atom↔SAP: succeed if exactly one is SAP.
    const a = ctx.origin;
    const b = ci ? { map: ci.map, id: ci.id } : null;
    if (!a || !b) {
      this.editor.errorHandler?.(HAPTIC_BOND_ENDPOINT_ERROR);
      return true;
    }
    const isAtomSap =
      (a.map === 'atoms' && b.map === 'superAttachmentPoints') ||
      (a.map === 'superAttachmentPoints' && b.map === 'atoms');
    if (!isAtomSap) {
      this.editor.errorHandler?.(HAPTIC_BOND_ENDPOINT_ERROR);
      return true;
    }
    const atomId = a.map === 'atoms' ? a.id : b.id;
    const sapId = a.map === 'superAttachmentPoints' ? a.id : b.id;
    const { action, result } = fromHapticBondAddition(struct, atomId, sapId);
    if (!result.ok) {
      this.editor.errorHandler?.(result.reason);
      return true;
    }
    this.editor.update(action);
    return true;
  }

  private addCarbonAndBond(sapId: number) {
    const struct = this.editor.render.ctab;
    const sap = struct.molecule.superAttachmentPoints.get(sapId);
    if (!sap) return;
    sap.recomputeCenter(struct.molecule);
    // Place the new carbon one bond-length to the right of the SAP centroid.
    const offset = new Vec2(1.5, 0);
    const newAtomPos = sap.pp.add(offset);
    const action = new Action();
    const addAction = fromAtomAddition(struct, newAtomPos, {
      label: 'C',
    } as Partial<Atom>);
    action.mergeWith(addAction);
    // Find the new atom id from the action ops.
    const newAid = action.operations
      .map(
        (op) =>
          (op as { data?: { aid?: unknown } }).data?.aid as number | undefined,
      )
      .find((aid): aid is number => typeof aid === 'number');
    if (newAid === undefined) return;
    const { action: bondAction, result } = fromHapticBondAddition(
      struct,
      newAid,
      sapId,
    );
    if (!result.ok) {
      this.editor.errorHandler?.(result.reason);
      return;
    }
    action.mergeWith(bondAction);
    this.editor.update(action);
  }

  cancel() {
    this.dragCtx = null;
  }
}

export default HapticBondTool;
