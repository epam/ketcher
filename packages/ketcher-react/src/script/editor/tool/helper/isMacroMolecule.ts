import { MonomerMicromolecule } from 'ketcher-core';
import { Editor } from '../../Editor';

const isMacroMolecule = (editor: Editor, id: number): boolean => {
  const functionalGroups = editor.render.ctab.molecule.functionalGroups;
  const matchingGroup = functionalGroups?.get(id);
  return matchingGroup?.relatedSGroup instanceof MonomerMicromolecule;
};

// dragCtx is actually "any" in the code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMergingToMacroMolecule = (editor: Editor, dragCtx: any): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;
  if (!funcGroups?.size) {
    return false;
  }
  const targetObjectId = funcGroups.entries().next().value[1];
  return isMacroMolecule(editor, targetObjectId);
};

const isBondingWithMacroMolecule = (
  editor: Editor,
  event: MouseEvent,
): boolean => {
  const ci = editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']);
  if (ci?.map === 'functionalGroups') {
    return isMacroMolecule(editor, ci?.id);
  } else if (ci?.map === 'bonds') {
    const struct = editor.struct();
    const bond = struct.bonds.get(ci.id);
    const sGroup = struct.getGroupFromAtomId(bond?.begin);

    return sGroup instanceof MonomerMicromolecule;
  }

  return false;
};

export {
  isBondingWithMacroMolecule,
  isMacroMolecule,
  isMergingToMacroMolecule,
};
