import type { Editor } from '../../Editor';
import type { DragContext } from '../select/select.types';

const isMacroMolecule = (editor: Editor, id: number): boolean => {
  const struct = editor.struct();
  return struct.isFunctionalGroupFromMacromolecule(id);
};

const isMergingToMacroMolecule = (
  editor: Editor,
  dragCtx: DragContext,
): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;
  if (!funcGroups?.size) {
    return false;
  }
  const [[, targetObjectId]] = funcGroups;
  return isMacroMolecule(editor, targetObjectId);
};

const isBondingWithMacroMolecule = (editor: Editor, event: MouseEvent) => {
  const ci = editor.findItem(event, ['bonds', 'functionalGroups']);
  const struct = editor.struct();

  return struct.isTargetFromMacromolecule(ci);
};

export {
  isBondingWithMacroMolecule,
  isMacroMolecule,
  isMergingToMacroMolecule,
};
