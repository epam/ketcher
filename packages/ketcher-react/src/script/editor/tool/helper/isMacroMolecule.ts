import { MonomerMicromolecule } from 'ketcher-core';
import { Editor } from '../../Editor';

const isObjectMacroMolecule = (editor: Editor, event: MouseEvent): boolean => {
  const functionalGroups = editor.render.ctab.molecule.functionalGroups;
  const ci = editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']);
  const matchingGroup = functionalGroups?.get(ci?.id);
  return (
    ci?.map === 'functionalGroups' &&
    matchingGroup?.relatedSGroup instanceof MonomerMicromolecule
  );
};

export default isObjectMacroMolecule;
