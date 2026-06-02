import type { Editor } from '../../Editor';

export interface DragContext {
  mergeItems?: {
    atomToFunctionalGroup?: Map<unknown, unknown>;
    atoms?: Map<unknown, unknown>;
    bonds?: Map<unknown, unknown>;
  } | null;
}

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
  const firstEntry = funcGroups.entries().next().value;
  if (!firstEntry) {
    return false;
  }
  const targetObjectId = firstEntry[1];
  if (typeof targetObjectId !== 'number') {
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
