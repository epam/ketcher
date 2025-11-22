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
  compareByTitleWithNaturalFirst,
  MonomerToAtomBond,
} from 'ketcher-core';

const getMonomersCode = (monomers: BaseMonomer[]) => {
  return monomers
    .map((monomer) => monomer.monomerItem.props.MonomerNaturalAnalogCode)
    .sort((a, b) => a.localeCompare(b))
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

  // Only RNA/DNA bases can be sense bases, not peptides or other monomers
  if (!isRnaBaseOrAmbiguousRnaBase(monomer)) {
    return false;
  }

  if (
    (monomer as AmbiguousMonomer).subtype ===
    KetAmbiguousMonomerTemplateSubType.MIXTURE
  ) {
    return false;
  }

  const ambiguousMonomer = monomer as AmbiguousMonomer;
  // Safety check: ensure monomers array exists
  if (!ambiguousMonomer.monomers || !Array.isArray(ambiguousMonomer.monomers)) {
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
  const code = getMonomersCode(ambiguousMonomer.monomers);
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
  const modificationTypesDisabledByAttachmentPoints = new Set<string>();
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

    if (!monomerLibraryItem.props || !monomersWithSameNaturalAnalogCode) {
      return;
    }

    const modificationTypes = monomerLibraryItem.props.modificationTypes;

    if (!modificationTypes) {
      return;
    }

    modificationTypes.forEach((modificationType) => {
      // If modification does not have R1 or R2 attachment points to persist connection
      if (
        monomersWithSameNaturalAnalogCode.some(
          (monomer: BaseMonomer) =>
            monomer.label !== monomerLibraryItem.label &&
            !canModifyAminoAcid(monomer, monomerLibraryItem),
        )
      ) {
        modificationTypesDisabledByAttachmentPoints.add(modificationType);

        return;
      }

      if (
        monomersWithSameNaturalAnalogCode.every(
          (monomer) => monomer.label === monomerLibraryItem.label,
        )
      ) {
        return;
      }

      modificationsForSelection.add(modificationType);
    });
  });

  const menuItems = [...modificationsForSelection.values()]
    .filter(
      (modificationType) =>
        !modificationTypesDisabledByAttachmentPoints.has(modificationType),
    )
    .map((modificationType) => {
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

  menuItems.sort(compareByTitleWithNaturalFirst);

  return menuItems;
};

export const getMonomersForAminoAcidModification = (
  selectedMonomers: BaseMonomer[],
  contextMenuEvent?,
) => {
  const clickedSequenceItemRenderer: BaseSequenceItemRenderer | undefined =
    contextMenuEvent?.target?.__data__;
  const clickedMonomer = clickedSequenceItemRenderer?.node?.monomer;
  let monomerCandidates: BaseMonomer[] = [];

  if (selectedMonomers.length) {
    monomerCandidates = selectedMonomers;
  } else if (clickedMonomer) {
    monomerCandidates = [clickedMonomer];
  }

  const monomersForAminoAcidModification = monomerCandidates.filter(
    (monomer) => {
      return monomer instanceof Peptide;
    },
  );

  return monomersForAminoAcidModification;
};

export const isCycleExistsForSelectedMonomers = (
  selectedMonomers: BaseMonomer[],
): boolean => {
  if (selectedMonomers.length < 3) {
    return false;
  }

  const monomerSet = new Set(selectedMonomers);
  const visited = new Set<BaseMonomer>();
  const inRecursionStack = new Set<BaseMonomer>();

  const getNeighbors = (monomer: BaseMonomer): BaseMonomer[] => {
    const neighbors: BaseMonomer[] = [];

    monomer.forEachBond((bond) => {
      if (bond instanceof MonomerToAtomBond) {
        return;
      }

      const firstMonomer = bond.firstMonomer;
      const secondMonomer = bond.secondMonomer;

      if (!firstMonomer || !secondMonomer) {
        return;
      }

      const neighbor = bond.getAnotherMonomer(monomer);

      if (neighbor && monomerSet.has(neighbor)) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  };

  const dfs = (monomer: BaseMonomer, parent: BaseMonomer | null): boolean => {
    visited.add(monomer);
    inRecursionStack.add(monomer);

    const neighbors = getNeighbors(monomer);

    for (const neighbor of neighbors) {
      if (neighbor === parent) {
        continue;
      }

      if (inRecursionStack.has(neighbor)) {
        return true;
      }

      if (!visited.has(neighbor)) {
        return dfs(neighbor, monomer);
      }
    }

    inRecursionStack.delete(monomer);
    return false;
  };

  for (const monomer of selectedMonomers) {
    if (!visited.has(monomer)) {
      return dfs(monomer, null);
    }
  }

  return false;
};
