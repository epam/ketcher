import {
  Action,
  CoordinateTransformation,
  Struct,
  Vec2,
  Visel,
  fromMultipleMove,
  getHoverToFuse,
  getItemsToFuse,
} from 'ketcher-core';
import { dropAndMerge } from '../tool/helper/dropAndMerge';
import { ClosestItemWithMap } from '../shared/closest.types';

import Editor from '../Editor';
import { Tool } from './Tool';
import { selMerge } from './select';
import { handleMovingPosibilityCursor } from '../utils';
import { getItemCursor } from '../utils/getItemCursor';

const CYCLE_TOOLTIP =
  'Fragment Selection Tool cannot be used on bonds that participate in a cycle.';
const COMPONENT_TOOLTIP =
  'The structure fragment in this direction is already marked as a nucleotide component.';
const TOOLTIP_DELAY = 200;
const FORBIDDEN_CURSOR = `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGJkYmRiIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNSIgeTE9IjUiIHgyPSIxOSIgeTI9IjE5IiBzdHJva2U9IiNkYmRiZGIiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==') 12 12, not-allowed`;

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
    action?: Action | null;
    mergeItems?: ReturnType<typeof getItemsToFuse>;
    copyAction?: Action;
    stopTapping?: () => void;
    closestItem?: ClosestItemWithMap | null;
  } | null;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  mousedown(event: PointerEvent) {
    if (this.disabledMessage) {
      return;
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

      return;
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
      return;
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
      return;
    }

    this.removeBondPreview();

    const restruct = this.editor.render.ctab;
    const bondItem = this.editor.findItem(event, ['bonds'], null);
    const atomItem = this.editor.findItem(event, ['atoms'], null);
    const reBond = bondItem && restruct.bonds.get(bondItem.id);
    const reAtom = atomItem && restruct.atoms.get(atomItem.id);

    if (reBond?.selected || reAtom?.selected || (!reBond && !reAtom)) {
      handleMovingPosibilityCursor(
        bondItem || atomItem,
        this.editor.render.paper.canvas,
        getItemCursor(this.editor.render, bondItem || atomItem),
      );
    }

    if (!reBond || reBond.selected) {
      this.resetPreview();
      return;
    }

    const struct = restruct.molecule;
    const halfBondBegin = struct.halfBonds.get(reBond.b.hb1 ?? -1);
    const halfBondEnd = struct.halfBonds.get(reBond.b.hb2 ?? -1);

    if (!halfBondBegin?.p || !halfBondEnd?.p) {
      this.resetPreview();
      return;
    }

    const pointer = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    const beginAtom = struct.atoms.get(reBond.b.begin);
    const endAtom = struct.atoms.get(reBond.b.end);

    if (!beginAtom || !endAtom) {
      this.resetPreview();
      return;
    }

    const startAtomId =
      Vec2.dist(pointer, beginAtom.pp) < Vec2.dist(pointer, endAtom.pp)
        ? reBond.b.begin
        : reBond.b.end;
    const componentData = this.getComponentData(struct);
    const isStartAtomComponent = componentData.componentAtoms.has(startAtomId);

    if (this.isBondInCycle(struct, bondItem.id)) {
      this.setDisabledState(CYCLE_TOOLTIP);
      return;
    }

    const blockedBonds = new Set<number>(componentData.componentBonds);

    componentData.connectingBonds.forEach((bondId) => blockedBonds.add(bondId));
    blockedBonds.add(bondItem.id);

    if (isStartAtomComponent) {
      // Direction leads to marked component - show gray arrows and tooltip
      this.preview = null;
      this.disabledMessage = COMPONENT_TOOLTIP;
      this.setCursor(true);
      this.queueTooltip(COMPONENT_TOOLTIP);
      this.editor.hover(null, this);

      // Draw gray arrows to indicate blocked direction
      this.bondPreview = reBond.drawFragmentSelectionPreview(
        this.editor.render,
        startAtomId,
        true, // isGray parameter
      );
      return;
    }

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
      return;
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
      false, // isGray parameter
    );
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
    canvas.style.cursor = isForbidden ? FORBIDDEN_CURSOR : '';
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

        let nextAtomId: number | null = null;
        if (currentBond.begin === atomId) {
          nextAtomId = currentBond.end;
        } else if (currentBond.end === atomId) {
          nextAtomId = currentBond.begin;
        }

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
