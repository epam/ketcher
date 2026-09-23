import {
  getMonomerTemplateRefFromMonomerItem,
  type IKetMonomerTemplate,
  type Ketcher,
  KetTemplateType,
  type MonomerItemType,
  provideEditorInstance,
  SettingsManager,
} from 'ketcher-core';
import type { FinishNewMonomersCreationData } from '../../../../editor/Editor';
import { getMonomerPropertyVisibility } from './MonomerCreationWizardFields.utils';

export const saveLibraryMonomer = async (
  ketcher: Ketcher,
  data: Pick<FinishNewMonomersCreationData, 'monomerTemplate' | 'monomerRef'>,
  original?: MonomerItemType,
) => {
  const editor = provideEditorInstance(ketcher.id);
  const originalRef = original
    ? getMonomerTemplateRefFromMonomerItem(original)
    : undefined;
  const originalTemplate = originalRef
    ? editor.monomersLibraryParsedJson?.[originalRef]
    : undefined;
  if (
    originalRef &&
    originalTemplate?.type !== KetTemplateType.MONOMER_TEMPLATE
  ) {
    throw new Error('The original monomer is no longer available for editing.');
  }
  const originalMonomerTemplate = originalTemplate as
    IKetMonomerTemplate | undefined;
  const { root: _root, ...createdTemplate } = data.monomerTemplate;
  const template = {
    ...originalMonomerTemplate,
    ...createdTemplate,
    ...(originalMonomerTemplate ? { id: originalMonomerTemplate.id } : {}),
  };
  if (originalMonomerTemplate) {
    const { displayHelmAlias, displayBilnAlias } = getMonomerPropertyVisibility(
      template.class,
    );
    if (!displayHelmAlias)
      template.aliasHELM = originalMonomerTemplate.aliasHELM;
    if (!displayBilnAlias)
      template.aliasBILN = originalMonomerTemplate.aliasBILN;
  }
  const ref = originalRef ?? data.monomerRef;
  const ket = JSON.stringify({
    root: { templates: [{ $ref: ref }] },
    [ref]: template,
  });
  const sdf = await ketcher.ensureMonomersLibraryDataInSdfFormat(ket, {
    format: 'ket',
  });
  if (
    !originalRef &&
    editor.checkIfMonomerSymbolClassPairExists(template.alias, template.class)
  ) {
    throw new Error('A monomer with this code already exists.');
  }
  editor.updateMonomersLibrary(ket, originalRef);
  if (SettingsManager.persistMonomerLibraryUpdates) {
    SettingsManager.addMonomerLibraryUpdate(
      originalRef
        ? JSON.stringify({ data: ket, editedMonomerRef: originalRef })
        : ket,
    );
  }
  ketcher.libraryUpdateEvent.dispatch(sdf);
};
