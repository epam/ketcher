import {
  CoordinateTransformation,
  Struct,
  Vec2,
  Visel,
  fromMultipleMove,
  getHoverToFuse,
  getItemsToFuse,
} from 'ketcher-core';
import { dropAndMerge } from '../tool/helper/dropAndMerge';

import type Editor from '../Editor';
import { Tool } from './Tool';
import { selMerge } from './select';
import { handleMovingPosibilityCursor } from '../utils';
import { getItemCursor } from '../utils/getItemCursor';

const CYCLE_TOOLTIP =
  'Fragment Selection Tool cannot be used on bonds that participate in a cycle.';
const COMPONENT_TOOLTIP =
  'The structure fragment in this direction is already marked as a nucleotide component.';
const TOOLTIP_DELAY = 200;

type FragmentPreview = {
  atoms: number[];
  bonds: number[];
};

export default class FragmentSelectionTool implements Tool {
  private readonly editor: Editor;
  private preview: FragmentPreview | null = null;
  private tooltipTimeoutId?: number;
  private disabledMessage?: string;
  private bondPreview?: Visel | null;

  // drag state to support moving selected entities
  private dragCtx?: {
    item?: { map: string; id: number };
    xy0: Vec2;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    action?: any;
    mergeItems?: ReturnType<typeof getItemsToFuse>;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    copyAction?: any;
    stopTapping?: () => void;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    closestItem?: any;
  } | null;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  mousedown(event: PointerEvent) {
    if (this.disabledMessage) {
      return true;
    }

    // If we have preview ready, apply selection logic as before
    if (this.preview) {
      const selection = {
        atoms: [...this.preview.atoms],
        bonds: [...this.preview.bonds],
      };
      const currentSelection = this.editor.selection();
      const mergedSelection = event.shiftKey
        ? selMerge({ ...(currentSelection || {}) }, selection, false)
        : selection;

      this.editor.selection(mergedSelection);
      this.editor.rotateController.rerender();

      return true;
    }

    // No preview: initialize dragging on closest item (atoms/bonds/frags) similar to select.ts
    const map = ['atoms', 'bonds', 'frags'];
    const ci = this.editor.findItem(event, map, null);
    const currentPosition = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );

    if (!ci) {
      this.editor.selection({});
      return true;
    }

    // Initialize drag context
    this.dragCtx = {
      item: ci,
      xy0: currentPosition,
    };

    // Update selection to the clicked entity for moving
    let sel: { atoms?: number[]; bonds?: number[] } = {};

    if (ci.map === 'frags') {
      const ctab = this.editor.render.ctab;
      const frag = ctab.frags.get(ci.id);

      sel = {
        atoms: frag.fragGetAtoms(ctab, ci.id),
        bonds: frag.fragGetBonds(ctab, ci.id),
      };
    }
    const selection = this.editor.selection();
    this.editor.selection(selMerge(sel, selection, true));

    return true;
  }

  mouseup() {
    // finalize drag move if any
    if (this.dragCtx?.item) {
      const editor = this.editor;
      dropAndMerge(
        editor,
        this.dragCtx.mergeItems,
        this.dragCtx.action,
        this.dragCtx.copyAction,
      );
      this.dragCtx = null;
      editor.event.message.dispatch({ info: false });
      editor.rotateController.rerender();
      return true;
    }
    // No action needed on mouseup for this tool
    // But this method is defined to prevent editor from dropping selection in case if method is absent
    return true;
  }

  private removeBondPreview() {
    if (this.bondPreview) {
      this.bondPreview.paths.forEach((path) => path.remove());
    }
  }

  mousemove(event: PointerEvent) {
    // If dragging, perform movement similar to select.ts
    if (this.dragCtx?.item) {
      const editor = this.editor;
      const restruct = editor.render.ctab;

      if (this.dragCtx.action) {
        this.dragCtx.action.perform(restruct);
      }

      const expSel = editor.explicitSelected();
      this.dragCtx.action = fromMultipleMove(
        restruct,
        expSel,
        CoordinateTransformation.pageToModel(event, editor.render).sub(
          this.dragCtx.xy0,
        ),
      );

      // Prepare fuse/hover hints during move
      const visibleSelectedItems = expSel; // FragmentSelection does not handle contracted sgroups here
      this.dragCtx.mergeItems = getItemsToFuse(editor, visibleSelectedItems);
      editor.hover(getHoverToFuse(this.dragCtx.mergeItems));

      editor.update(this.dragCtx.action, true);
      return true;
    }

    this.removeBondPreview();

    const restruct = this.editor.render.ctab;
    const bondItem = this.editor.findItem(event, ['bonds'], null);
    const atomItem = this.editor.findItem(event, ['atoms'], null);
    const reBond = bondItem && restruct.bonds.get(bondItem.id);
    const reAtom = atomItem && restruct.bonds.get(atomItem.id);

    if (
      (reBond && reBond.selected) ||
      (reAtom && reAtom.selected) ||
      (!reBond && !reAtom)
    ) {
      handleMovingPosibilityCursor(
        bondItem || atomItem,
        this.editor.render.paper.canvas,
        getItemCursor(this.editor.render, bondItem || atomItem),
      );
    }

    if (!reBond || reBond.selected) {
      this.resetPreview();
      return true;
    }

    const struct = restruct.molecule;
    const halfBondBegin = struct.halfBonds.get(reBond.b.hb1 ?? -1);
    const halfBondEnd = struct.halfBonds.get(reBond.b.hb2 ?? -1);

    if (!halfBondBegin?.p || !halfBondEnd?.p) {
      this.resetPreview();
      return true;
    }

    const pointer = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    const beginAtom = struct.atoms.get(reBond.b.begin);
    const endAtom = struct.atoms.get(reBond.b.end);

    if (!beginAtom || !endAtom) {
      this.resetPreview();
      return true;
    }

    const startAtomId =
      Vec2.dist(pointer, beginAtom.pp) < Vec2.dist(pointer, endAtom.pp)
        ? reBond.b.begin
        : reBond.b.end;
    const componentData = this.getComponentData(struct);

    if (componentData.componentAtoms.has(startAtomId)) {
      this.setDisabledState(COMPONENT_TOOLTIP);
      return true;
    }

    if (this.isBondInCycle(struct, bondItem.id)) {
      this.setDisabledState(CYCLE_TOOLTIP);
      return true;
    }

    const blockedBonds = new Set<number>(componentData.componentBonds);

    componentData.connectingBonds.forEach((bondId) => blockedBonds.add(bondId));
    blockedBonds.add(bondItem.id);
    this.disabledMessage = undefined;
    this.setCursor(false);
    this.clearTooltip();

    const preview = this.collectFragment(
      struct,
      startAtomId,
      blockedBonds,
      componentData.componentAtoms,
    );

    this.preview = preview;
    this.editor.hover(null, this);

    if (!preview.atoms.length && !preview.bonds.length) {
      return true;
    }

    this.editor.hover(
      {
        map: 'merge',
        items: { atoms: preview.atoms, bonds: preview.bonds },
      },
      this,
    );

    this.bondPreview = reBond.drawFragmentSelectionPreview(
      this.editor.render,
      startAtomId,
    );

    return true;
  }

  mouseleave() {
    // cancel drag if active
    if (this.dragCtx?.action) {
      const action = this.dragCtx.action;
      this.editor.update(action);
    }
    this.dragCtx = null;
    this.resetPreview();
  }

  mouseLeaveClientArea() {
    // cancel drag if active
    this.dragCtx = null;
    this.resetPreview();
  }

  private resetPreview() {
    this.preview = null;
    this.disabledMessage = undefined;
    this.clearTooltip();
    this.setCursor(false);
    this.editor.hover(null, this);
    this.removeBondPreview();
  }

  private setDisabledState(message: string) {
    this.preview = null;
    this.disabledMessage = message;
    this.editor.hover(null, this);
    this.setCursor(true);
    this.queueTooltip(message);
  }

  private queueTooltip(message: string) {
    this.clearTooltip();
    this.tooltipTimeoutId = window.setTimeout(() => {
      this.editor.event.tooltip.dispatch({ message });
    }, TOOLTIP_DELAY);
  }

  private clearTooltip() {
    if (this.tooltipTimeoutId) {
      clearTimeout(this.tooltipTimeoutId);
      this.tooltipTimeoutId = undefined;
    }
    this.editor.event.tooltip.dispatch();
  }

  private setCursor(isForbidden: boolean) {
    const canvas = this.editor.render.paper?.canvas;
    if (!canvas) return;
    canvas.style.cursor = isForbidden ? 'not-allowed' : '';
  }

  private isBondInCycle(struct: Struct, bondId: number): boolean {
    const bond = struct.bonds.get(bondId);
    if (!bond) return false;

    const targetAtomId = bond.end;
    const visited = new Set<number>([bond.begin]);
    const queue = [bond.begin];
    let queueIndex = 0;

    while (queueIndex < queue.length) {
      const atomId = queue[queueIndex];
      queueIndex += 1;
      for (const [id, currentBond] of struct.bonds.entries()) {
        if (id === bondId) continue;

        const nextAtomId =
          currentBond.begin === atomId
            ? currentBond.end
            : currentBond.end === atomId
            ? currentBond.begin
            : null;

        if (nextAtomId === null || visited.has(nextAtomId)) {
          continue;
        }

        if (nextAtomId === targetAtomId) {
          return true;
        }

        visited.add(nextAtomId);
        queue.push(nextAtomId);
      }
    }

    return false;
  }

  private collectFragment(
    struct: Struct,
    startAtomId: number,
    blockedBonds: Set<number>,
    componentAtoms: Set<number>,
  ): FragmentPreview {
    if (startAtomId == null) {
      return { atoms: [], bonds: [] };
    }

    const atoms: number[] = [];
    const bondsSet = new Set<number>();
    const visitedAtoms = new Set<number>();
    const queue = [startAtomId];
    let queueIndex = 0;

    while (queueIndex < queue.length) {
      const atomId = queue[queueIndex];
      const atom = struct.atoms.get(atomId);

      queueIndex += 1;
      if (!atom || visitedAtoms.has(atomId) || componentAtoms.has(atomId)) {
        continue;
      }

      visitedAtoms.add(atomId);
      atoms.push(atomId);

      for (const halfBondId of atom.neighbors) {
        const bondId = struct.halfBonds.get(halfBondId)?.bid;

        if (bondId === undefined) continue;

        const bond = struct.bonds.get(bondId);

        if (bond === undefined) continue;

        if (blockedBonds.has(bondId)) continue;

        let nextAtomId: number | null = null;
        if (bond.begin === atomId) {
          nextAtomId = bond.end;
        } else if (bond.end === atomId) {
          nextAtomId = bond.begin;
        }

        if (nextAtomId === null || componentAtoms.has(nextAtomId)) {
          continue;
        }

        bondsSet.add(bondId);
        if (!visitedAtoms.has(nextAtomId)) {
          queue.push(nextAtomId);
        }
      }
    }

    return { atoms, bonds: Array.from(bondsSet) };
  }

  private getComponentData(struct: Struct) {
    const componentAtoms = new Set<number>();
    const componentBonds = new Set<number>();
    const connectingBonds = new Set<number>();
    const rnaComponentAtoms =
      this.editor.monomerCreationState?.rnaComponentAtoms;

    rnaComponentAtoms?.forEach((component) => {
      component.atoms?.forEach((atomId) => componentAtoms.add(atomId));
      component.bonds?.forEach((bondId) => componentBonds.add(bondId));
    });

    if (componentAtoms.size) {
      for (const [bondId, bond] of struct.bonds.entries()) {
        const beginComponent = componentAtoms.has(bond.begin);
        const endComponent = componentAtoms.has(bond.end);
        if (beginComponent || endComponent) {
          if (!beginComponent || !endComponent) {
            connectingBonds.add(bondId);
          }
        }
      }
    }

    return { componentAtoms, componentBonds, connectingBonds };
  }

  public cancel() {
    // also reset drag state
    this.dragCtx = null;
    this.resetPreview();
  }
}
