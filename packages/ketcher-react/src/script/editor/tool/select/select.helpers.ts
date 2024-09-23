import { xor } from 'lodash/fp';
import { Atom, Bond, SGroup } from 'ketcher-core';
import Editor from '../../Editor';
import LassoHelper from '../helper/lasso';
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

export function getNewSelectedItems(editor: Editor, selectedSgroups: number[]) {
  const newSelected: Record<'atoms' | 'bonds', number[]> = {
    atoms: [],
    bonds: [],
  };

  for (const sgId of selectedSgroups) {
    const sgroup = editor.render.ctab.sgroups.get(sgId);
    if (sgroup && !sgroup.item?.isSuperatomWithoutLabel) {
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
