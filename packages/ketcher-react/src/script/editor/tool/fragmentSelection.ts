import { CoordinateTransformation, Struct, Vec2 } from 'ketcher-core';

import Editor from '../Editor';
import { Tool } from './Tool';
import { selMerge } from './select';

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

  constructor(editor: Editor) {
    this.editor = editor;
  }

  mousedown(event: PointerEvent) {
    if (!this.preview || this.disabledMessage) {
      return true;
    }

    const selection = {
      atoms: [...this.preview.atoms],
      bonds: [...this.preview.bonds],
    };
    const currentSelection = this.editor.selection();
    const mergedSelection = event.shiftKey
      ? selMerge({ ...(currentSelection || {}) }, selection, false)
      : selection;

    this.editor.selection(mergedSelection);
    return true;
  }

  mousemove(event: PointerEvent) {
    const restruct = this.editor.render.ctab;
    const bondItem = this.editor.findItem(event, ['bonds'], null);

    if (!bondItem) {
      this.resetPreview();
      return true;
    }

    const reBond = restruct.bonds.get(bondItem.id);
    if (!reBond) {
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
    const bondVector = halfBondEnd.p.sub(halfBondBegin.p);
    const pointerVector = pointer.sub(
      Vec2.lc2(halfBondBegin.p, 0.5, halfBondEnd.p, 0.5),
    );
    const cross =
      bondVector.x * pointerVector.y - bondVector.y * pointerVector.x;
    const startAtomId = cross >= 0 ? reBond.b.begin : reBond.b.end;

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

    if (!preview.atoms.length && !preview.bonds.length) {
      this.editor.hover(null, this);
      return true;
    }

    this.editor.hover(
      {
        map: 'merge',
        items: { atoms: preview.atoms, bonds: preview.bonds },
      },
      this,
    );

    return true;
  }

  mouseleave() {
    this.resetPreview();
  }

  mouseLeaveClientArea() {
    this.resetPreview();
  }

  private resetPreview() {
    this.preview = null;
    this.disabledMessage = undefined;
    this.clearTooltip();
    this.setCursor(false);
    this.editor.hover(null, this);
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
      this.editor.event.message.dispatch({ info: message });
    }, TOOLTIP_DELAY);
  }

  private clearTooltip() {
    if (this.tooltipTimeoutId) {
      clearTimeout(this.tooltipTimeoutId);
      this.tooltipTimeoutId = undefined;
    }
    this.editor.event.message.dispatch({ info: false });
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

    while (queue.length) {
      const atomId = queue.shift() as number;
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

    while (queue.length) {
      const atomId = queue.shift() as number;
      if (visitedAtoms.has(atomId) || componentAtoms.has(atomId)) {
        continue;
      }

      visitedAtoms.add(atomId);
      atoms.push(atomId);

      for (const [bondId, bond] of struct.bonds.entries()) {
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
}
