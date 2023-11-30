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
  // const functionalGroups = editor.render.ctab.molecule.functionalGroups;
  const ci = editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']);
  return ci?.map === 'functionalGroups' && isMacroMolecule(editor, ci?.id);
};

export {
  isBondingWithMacroMolecule,
  isMacroMolecule,
  isMergingToMacroMolecule,
};
