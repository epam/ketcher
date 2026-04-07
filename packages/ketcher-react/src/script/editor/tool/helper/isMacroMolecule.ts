import { Editor } from '../../Editor';

interface DragContext {
  mergeItems?: {
    atomToFunctionalGroup?: Map<number, number>;
  };
}

const isMacroMolecule = (editor: Editor, id: number): boolean => {
  const struct = editor.struct();
  return struct.isFunctionalGroupFromMacromolecule(id);
};

// dragCtx is actually "any" in the code
const isMergingToMacroMolecule = (
  editor: Editor,
  dragCtx: DragContext,
): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;

  if (!funcGroups || funcGroups.size === 0) {
    return false;
  }

  const firstEntry = funcGroups.entries().next().value;

  if (!firstEntry) {
    return false;
  }

  const targetObjectId = firstEntry[1];

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
