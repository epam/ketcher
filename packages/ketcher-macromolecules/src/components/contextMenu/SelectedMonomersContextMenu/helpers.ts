import {
  AmbiguousMonomer,
  BaseMonomer,
  BaseSequenceItemRenderer,
  CoreEditor,
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
  isRnaBaseOrAmbiguousRnaBase,
  KetAmbiguousMonomerTemplateSubType,
  Peptide,
  RNA_DNA_NON_MODIFIED_PART,
  RNABase,
  Sugar,
  getAminoAcidsToModify,
  canModifyAminoAcid,
} from 'ketcher-core';

const getMonomersCode = (monomers: BaseMonomer[]) => {
  return monomers
    .map((monomer) => monomer.monomerItem.props.MonomerNaturalAnalogCode)
    .sort()
    .join('');
};

export const isSenseBase = (monomer: BaseMonomer | AmbiguousMonomer) => {
  const { monomerItem } = monomer;
  const isNaturalAnalogue =
    monomerItem.props.MonomerNaturalAnalogCode === 'A' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'C' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'G' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'T' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'U';
  if (isNaturalAnalogue) {
    return true;
  }
  if (!monomer.monomerItem.isAmbiguous) {
    return false;
  }

  if (
    (monomer as AmbiguousMonomer).subtype ===
    KetAmbiguousMonomerTemplateSubType.MIXTURE
  ) {
    return false;
  }

  const N1 = 'ACGT';
  const N2 = 'ACGU';
  const B1 = 'CGT';
  const B2 = 'CGU';
  const D1 = 'AGT';
  const D2 = 'AGU';
  const H1 = 'ACT';
  const H2 = 'ACU';
  const K1 = 'GT';
  const K2 = 'GU';
  const W1 = 'AT';
  const W2 = 'AU';
  const Y1 = 'CT';
  const Y2 = 'CU';
  const M = 'AC';
  const R = 'AG';
  const S = 'CG';
  const V = 'ACG';
  const ambigues = [
    N1,
    N2,
    B1,
    B2,
    D1,
    D2,
    H1,
    H2,
    K1,
    K2,
    W1,
    W2,
    Y1,
    Y2,
    M,
    R,
    S,
    V,
  ];
  const code = getMonomersCode((monomer as AmbiguousMonomer).monomers);
  return ambigues.some((v) => v === code);
};

export const isAntisenseCreationDisabled = (
  selectedMonomers: BaseMonomer[],
) => {
  return selectedMonomers?.some((selectedMonomer: BaseMonomer) => {
    const rnaBaseForSugar =
      selectedMonomer instanceof Sugar && getRnaBaseFromSugar(selectedMonomer);

    return (
      (selectedMonomer instanceof RNABase &&
        (selectedMonomer.hydrogenBonds.length > 0 ||
          selectedMonomer.covalentBonds.length > 1)) ||
      (isRnaBaseOrAmbiguousRnaBase(selectedMonomer) &&
        !isSenseBase(selectedMonomer)) ||
      (rnaBaseForSugar &&
        (rnaBaseForSugar.hydrogenBonds.length > 0 ||
          !isSenseBase(rnaBaseForSugar)))
    );
  });
};
export const hasOnlyDeoxyriboseSugars = (selectedMonomers: BaseMonomer[]) => {
  return selectedMonomers?.every((selectedMonomer: BaseMonomer) =>
    selectedMonomer instanceof Sugar
      ? selectedMonomer.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA
      : true,
  );
};
export const hasOnlyRiboseSugars = (selectedMonomers: BaseMonomer[]) => {
  return selectedMonomers?.every((selectedMonomer: BaseMonomer) =>
    selectedMonomer instanceof Sugar
      ? selectedMonomer.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA
      : true,
  );
};

export const isAntisenseOptionVisible = (selectedMonomers: BaseMonomer[]) => {
  return selectedMonomers?.some((selectedMonomer) => {
    return (
      (selectedMonomer instanceof RNABase &&
        getSugarFromRnaBase(selectedMonomer)) ||
      (selectedMonomer instanceof Sugar && getRnaBaseFromSugar(selectedMonomer))
    );
  });
};

export const AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX =
  'aminoAcidModification-';

export const getModifyAminoAcidsMenuItems = (
  selectedMonomers: BaseMonomer[],
) => {
  const modificationsForSelection = new Set<string>();
  const selectedMonomersLabelsSet = new Set(
    selectedMonomers.map((monomer) => monomer.label),
  );
  const naturalAnalogueToSelectedMonomers = new Map<string, BaseMonomer[]>();
  const editor = CoreEditor.provideEditorInstance();

  selectedMonomers.forEach((selectedMonomer) => {
    const monomerNaturalAnalogCode =
      selectedMonomer.monomerItem.props.MonomerNaturalAnalogCode;

    if (!(selectedMonomer instanceof Peptide) || !monomerNaturalAnalogCode) {
      return;
    }

    if (!naturalAnalogueToSelectedMonomers.has(monomerNaturalAnalogCode)) {
      naturalAnalogueToSelectedMonomers.set(monomerNaturalAnalogCode, []);
    }

    naturalAnalogueToSelectedMonomers
      .get(monomerNaturalAnalogCode)
      ?.push(selectedMonomer);
  });

  editor?.monomersLibrary.forEach((monomerLibraryItem) => {
    const monomersWithSameNaturalAnalogCode =
      naturalAnalogueToSelectedMonomers.get(
        monomerLibraryItem.props?.MonomerNaturalAnalogCode,
      );

    if (
      selectedMonomersLabelsSet.has(monomerLibraryItem.label) ||
      !monomerLibraryItem.props ||
      !monomersWithSameNaturalAnalogCode
    ) {
      return;
    }

    const modificationType = monomerLibraryItem.props.modificationType;

    if (!modificationType) {
      return;
    }

    // If modification does not have R1 or R2 attachment points to persist connection
    if (
      monomersWithSameNaturalAnalogCode.every(
        (monomer: BaseMonomer) =>
          !canModifyAminoAcid(monomer, monomerLibraryItem),
      )
    ) {
      return;
    }

    modificationsForSelection.add(modificationType);
  });

  return [...modificationsForSelection.values()].map((modificationType) => {
    const aminoAcidsToModify = getAminoAcidsToModify(
      selectedMonomers,
      modificationType,
      editor.monomersLibrary,
    );

    return {
      name: `${AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX}${modificationType}`,
      title: modificationType,
      onMouseOver: () => {
        editor.transientDrawingView.showModifyAminoAcidsView({
          monomersToModify: [...aminoAcidsToModify.keys()],
        });
        editor.transientDrawingView.update();
      },
      onMouseOut: () => {
        editor.transientDrawingView.hideModifyAminoAcidsView();
        editor.transientDrawingView.update();
      },
    };
  });
};

export const getMonomersForAminoAcidModification = (
  selectedMonomers: BaseMonomer[],
  contextMenuEvent?,
) => {
  const clickedSequenceItemRenderer: BaseSequenceItemRenderer | undefined =
    contextMenuEvent?.target?.__data__;
  const clickedMonomer = clickedSequenceItemRenderer?.node?.monomer;
  const monomersForAminoAcidModification = (
    selectedMonomers.length
      ? selectedMonomers
      : clickedMonomer
      ? [clickedMonomer]
      : []
  ).filter((monomer) => monomer instanceof Peptide);

  return monomersForAminoAcidModification;
};
