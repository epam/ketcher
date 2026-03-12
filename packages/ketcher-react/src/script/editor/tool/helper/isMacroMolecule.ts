import { Editor } from '../../Editor';

const isMacroMolecule = (editor: Editor, id: number): boolean => {
  const struct = editor.struct();
  return struct.isFunctionalGroupFromMacromolecule(id);
};

type MacroMoleculeDragContext = {
  mergeItems?: {
    atomToFunctionalGroup?: Map<number, number>;
  };
};

const isMergingToMacroMolecule = (
  editor: Editor,
  dragCtx: MacroMoleculeDragContext | null | undefined,
): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;
  if (!funcGroups?.size) {
    return false;
  }
  const targetObjectId = funcGroups.entries().next().value?.[1];
  if (targetObjectId == null) {
    return false;
  }
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
