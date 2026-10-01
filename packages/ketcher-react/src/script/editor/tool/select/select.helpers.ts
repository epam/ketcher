import { xor } from 'lodash/fp';
import { type Atom, type Bond, type ReStruct, SGroup } from 'ketcher-core';
import type { Editor, Selection } from '../../Editor';
import type LassoHelper from '../helper/lasso';
import { getGroupIdsFromItemArrays } from '../helper/getGroupIdsFromItems';

function uniqArray(dest, add, reversible: boolean) {
  return add.reduce((_, item) => {
    if (reversible) dest = xor(dest, [item]);
    else if (!dest.includes(item)) dest.push(item);
    return dest;
  }, []);
}

// TODO: deep-merge?
export function selMerge(selection, add, reversible: boolean) {
  if (add) {
    Object.keys(add).forEach((item) => {
      if (!selection[item]) selection[item] = add[item].slice();
      else selection[item] = uniqArray(selection[item], add[item], reversible);
    });
  }
  return selection;
}

export function getSelectedAtoms(selection, molecule) {
  if (selection?.atoms) {
    return mapAtomIdsToAtoms(selection?.atoms, molecule);
  }
  return [];
}

export function getSelectedBonds(selection, molecule) {
  if (selection?.bonds) {
    return mapBondIdsToBonds(selection?.bonds, molecule);
  }
  return [];
}

export function mapAtomIdsToAtoms(atomsIds: number[], molecule): Atom[] {
  return atomsIds.map((atomId) => {
    const atomOrReAtom = molecule.atoms.get(atomId);
    return atomOrReAtom.a || atomOrReAtom;
  });
}

export function mapBondIdsToBonds(bondsIds: number[], molecule): Bond[] {
  return bondsIds.map((bondId) => {
    const bondOrReBond = molecule.bonds.get(bondId);
    return bondOrReBond?.b || bondOrReBond;
  });
}

type ClosestItem = { map: string; id: number };
type FragSelection = { atoms: number[]; bonds: number[] };

export function getFragSelection(
  ctab: ReStruct,
  fragId: number,
): FragSelection | null {
  const frag = ctab.frags.get(fragId);

  if (!frag) return null;

  return {
    atoms: frag.fragGetAtoms(ctab, fragId),
    bonds: frag.fragGetBonds(ctab, fragId),
  };
}

/**
 * Returns true when the given closest item is part of the current selection.
 *
 * The micro-mode selection model only stores primitive items
 * (`atoms`, `bonds`, `rxnArrows`, `rxnPluses`, `simpleObjects`, `texts`,
 * `enhancedFlags`, images, multitail arrows, `sgroupData`). For composite
 * items (`sgroups`, `functionalGroups`, `rgroups`, `frags`) "selected" is
 * defined as: every atom that the item expands to is already in
 * `selection.atoms`. Without this expansion a multi-selection of
 * sgroup-rendered items (e.g. monomers in molecules mode) collapses to the
 * single clicked item on mousedown, breaking multi-drag.
 */
export function isItemSelected(
  selection: Selection | null | undefined,
  ci: ClosestItem,
  restruct: ReStruct,
): boolean {
  if (!selection || !ci) {
    return false;
  }

  const atomsSubsetOfSelection = (atomIds: number[]): boolean => {
    if (atomIds.length === 0) {
      return false;
    }
    const selectedAtoms = selection.atoms ?? [];
    return atomIds.every((aid) => selectedAtoms.includes(aid));
  };

  switch (ci.map) {
    case 'sgroups':
    case 'functionalGroups': {
      const sgroup = restruct.sgroups.get(ci.id)?.item;
      return sgroup
        ? atomsSubsetOfSelection(SGroup.getAtoms(restruct.molecule, sgroup))
        : false;
    }
    case 'rgroups': {
      const rgroup = restruct.rgroups.get(ci.id);
      return rgroup
        ? atomsSubsetOfSelection(rgroup.getAtoms(restruct.render))
        : false;
    }
    case 'frags': {
      const frag = restruct.frags.get(ci.id);
      return frag
        ? atomsSubsetOfSelection(frag.fragGetAtoms(restruct, ci.id))
        : false;
    }
    case 'bonds': {
      // A bond is also considered part of the selection when both of its
      // endpoint atoms are selected, even if the bond id itself is not
      // explicitly in `selection.bonds`. This matches `explicitSelected`'s
      // auto-selection of bonds-with-both-endpoints and prevents collapsing a
      // multi-selection when the user starts dragging by clicking an
      // inter-sgroup bond (e.g. a bond between two selected monomers).
      if (selection.bonds?.includes(ci.id)) {
        return true;
      }
      const bond = restruct.molecule.bonds.get(ci.id);
      if (!bond) return false;
      const selectedAtoms = selection.atoms ?? [];
      return (
        selectedAtoms.includes(bond.begin) && selectedAtoms.includes(bond.end)
      );
    }
    default:
      return (
        (selection as Record<string, number[] | undefined>)[ci.map]?.includes(
          ci.id,
        ) ?? false
      );
  }
}

export function getNewSelectedItems(editor: Editor, selectedSgroups: number[]) {
  const newSelected: Record<'atoms' | 'bonds', number[]> = {
    atoms: [],
    bonds: [],
  };

  for (const sgId of selectedSgroups) {
    const sgroup = editor.render.ctab.sgroups.get(sgId);
    if (sgroup) {
      const sgroupAtoms = SGroup.getAtoms(editor.struct(), sgroup.item);
      const sgroupBonds = SGroup.getBonds(editor.struct(), sgroup.item);
      newSelected.atoms.push(...sgroupAtoms);
      newSelected.bonds.push(...sgroupBonds);
    }
  }

  return newSelected;
}

export function selectElementsOnCanvas(
  elements: { atoms: number[]; bonds: number[] },
  editor: Editor,
  lassoHelper: LassoHelper,
  event: PointerEvent,
) {
  const sel =
    elements.atoms.length > 0
      ? selMerge(lassoHelper.end(), elements, false)
      : lassoHelper.end();
  editor.selection(
    !event.shiftKey ? sel : selMerge(sel, editor.selection(), false),
  );
}

export function onSelectionStart(
  event: PointerEvent,
  editor: Editor,
  lassoHelper: LassoHelper,
) {
  if (!event.shiftKey) editor.selection(null);
  if (!lassoHelper.fragment) lassoHelper.begin(event);
}

export function onSelectionMove(
  event: PointerEvent,
  editor: Editor,
  lassoHelper: LassoHelper,
): boolean {
  if (lassoHelper.running()) {
    const sel = lassoHelper.addPoint(event);

    editor.selection(
      !event.shiftKey ? sel : selMerge(sel, editor.selection(), false),
    );
    return true;
  }
  return false;
}

export function onSelectionEnd(
  event: PointerEvent,
  editor: Editor,
  lassoHelper: LassoHelper,
): void {
  if (lassoHelper.running()) {
    const selected = editor.selection();
    const struct = editor.render.ctab;
    const molecule = struct.molecule;

    // add all items of all selectedSGroups to selection
    const selectedSgroups = selected
      ? getGroupIdsFromItemArrays(molecule, selected)
      : [];
    const newSelected = getNewSelectedItems(editor, selectedSgroups);
    // TODO it catches more events than needed, to be re-factored
    selectElementsOnCanvas(newSelected, editor, lassoHelper, event);
  } else if (lassoHelper.fragment) {
    if (
      !event.shiftKey &&
      editor.render.clientArea.contains(event.target as Node)
    )
      editor.selection(null);
  }
}

export function onSelectionLeave(editor: Editor, lassoHelper: LassoHelper) {
  if (lassoHelper.running()) {
    editor.selection(lassoHelper.end());
  }
}
