import {
  getMonomerTemplateRefFromMonomerItem,
  type IKetMonomerTemplate,
  isAmbiguousMonomerLibraryItem,
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
  const editor = provideEditorInstance();
  const editedRef = original
    ? getMonomerTemplateRefFromMonomerItem(original)
    : undefined;
  const editedTemplate = editedRef
    ? editor.monomersLibraryParsedJson?.[editedRef]
    : undefined;
  if (editedRef && editedTemplate?.type !== KetTemplateType.MONOMER_TEMPLATE) {
    throw new Error('The original monomer is no longer available for editing.');
  }
  const editedMonomerTemplate = editedTemplate as
    IKetMonomerTemplate | undefined;
  const { root: _root, ...createdTemplate } = data.monomerTemplate;

  /*
   * The type and the code together identify a monomer. Keeping both means the
   * user edited that library entry, so the new version supersedes it. Changing
   * either one makes a distinct monomer, which is added to the library while
   * the original stays visible and usable — including its identity, its id and
   * the properties (aliases) that have no control in the attributes panel.
   */
  const shouldSupersedeOriginal =
    Boolean(editedMonomerTemplate) &&
    createdTemplate.class === editedMonomerTemplate?.class &&
    createdTemplate.alias === editedMonomerTemplate?.alias;
  const originalMonomerTemplate = shouldSupersedeOriginal
    ? editedMonomerTemplate
    : undefined;
  const originalRef = shouldSupersedeOriginal ? editedRef : undefined;

  const template = {
    ...originalMonomerTemplate,
    ...createdTemplate,
    ...(originalMonomerTemplate ? { id: originalMonomerTemplate.id } : {}),
  };
  if (originalMonomerTemplate) {
    const { displayHelmAlias, displayBilnAlias, displayIdtAlias } =
      getMonomerPropertyVisibility(template.class);
    if (!displayHelmAlias)
      template.aliasHELM = originalMonomerTemplate.aliasHELM;
    if (!displayBilnAlias)
      template.aliasBILN = originalMonomerTemplate.aliasBILN;
    if (displayIdtAlias && !createdTemplate.idtAliases)
      delete template.idtAliases;
  } else {
    /*
     * Saving as a new entry keeps the original in the library, so the new
     * version cannot carry the aliases it was loaded with — they are unique
     * per polymer type and would collide with the original on save. Aliases
     * the user explicitly changed are kept.
     */
    if (template.aliasHELM === editedMonomerTemplate?.aliasHELM) {
      delete template.aliasHELM;
    }
    if (template.aliasBILN === editedMonomerTemplate?.aliasBILN) {
      delete template.aliasBILN;
    }
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
  editor.updateMonomersLibrary(ket, originalRef, true);

  /*
   * Submitting after "Edit" replaces every instance of that monomer on the
   * canvas with the new version. "Duplicate and Edit" leaves the canvas alone,
   * and it is the only library entry point that passes no `original`.
   *
   * The canvas cannot be touched here — macromolecules mode is still hidden —
   * so the swap is queued and performed by the editor on the way back.
   */
  if (original) {
    const savedMonomerItem = editor.monomersLibrary.find(
      (item) =>
        !isAmbiguousMonomerLibraryItem(item) &&
        getMonomerTemplateRefFromMonomerItem(item) === ref,
    );

    if (savedMonomerItem) {
      editor.scheduleMonomerWizardInstanceReplacement({
        monomerClass: original.props.MonomerClass,
        symbol: original.props.MonomerCode ?? original.label,
        newMonomerItem: savedMonomerItem,
      });
    }
  }

  if (SettingsManager.persistMonomerLibraryUpdates) {
    SettingsManager.addMonomerLibraryUpdate(
      originalRef
        ? JSON.stringify({ data: ket, editedMonomerRef: originalRef })
        : ket,
    );
  }
  ketcher.libraryUpdateEvent.dispatch(sdf);
};
