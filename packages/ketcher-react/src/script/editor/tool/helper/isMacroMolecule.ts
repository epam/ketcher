import { Editor } from '../../Editor';

const isMacroMolecule = (editor: Editor, id: number): boolean => {
  const struct = editor.struct();
  return struct.isFunctionalGroupFromMacromolecule(id);
};

interface MergeDragContext {
  mergeItems?: {
    atomToFunctionalGroup?: Map<number, number>;
  } | null;
}

const isMergingToMacroMolecule = (
  editor: Editor,
  dragCtx: MergeDragContext | null | undefined,
): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;
  if (!funcGroups?.size) {
    return false;
  }
  const targetObjectId = funcGroups.entries().next().value[1];
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
