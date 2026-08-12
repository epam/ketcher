import { IndigoProvider } from 'ketcher-react';
import {
  ChainsCollection,
  getAllConnectedMonomersRecursively,
  KetcherLogger,
  KetSerializer,
  notifyRequestCompleted,
  Struct,
  StructService,
  type CoreEditor,
  type BaseMonomer,
  type CoreAtom,
} from 'ketcher-core';
import {
  molarMeasurementUnitToNumber,
  selectEditor,
  selectOligonucleotidesMeasurementUnit,
  selectOligonucleotidesValue,
  selectUnipositiveIonsMeasurementUnit,
  selectUnipositiveIonsValue,
  setMacromoleculesProperties,
} from 'state/common';
import { useAppDispatch, useAppSelector } from './stateHooks';

function getAtomsForMonomer(
  editor: CoreEditor,
  monomer: BaseMonomer,
): CoreAtom[] {
  return Array.from(editor.drawingEntitiesManager.atoms.values()).filter(
    (atom) => atom.monomer === monomer,
  );
}

function isMonomerFullySelected(monomerAtoms: CoreAtom[]): boolean {
  const selectedAtoms = monomerAtoms.filter((atom) => atom.selected);
  return selectedAtoms.length === monomerAtoms.length;
}

function findPartiallySelectedMonomers(
  editor: CoreEditor,
  selectionDrawingEntitiesManager: CoreEditor['drawingEntitiesManager'],
  hasNoSelection: boolean,
): Set<BaseMonomer> {
  const partiallySelectedMonomers = new Set<BaseMonomer>();

  if (hasNoSelection) {
    return partiallySelectedMonomers;
  }

  for (const monomer of selectionDrawingEntitiesManager.monomers.values()) {
    const monomerAtoms = getAtomsForMonomer(editor, monomer);

    if (monomerAtoms.length > 0 && !isMonomerFullySelected(monomerAtoms)) {
      partiallySelectedMonomers.add(monomer);
    }
  }

  return partiallySelectedMonomers;
}

function checkMonomersConnectivity(
  allMonomers: BaseMonomer[],
  chainsCollection: ChainsCollection,
): boolean {
  const firstMonomer = allMonomers[0] || chainsCollection.firstNode?.monomer;
  const totalMonomersCount = allMonomers.length;
  const connectedMonomersCount = firstMonomer
    ? getAllConnectedMonomersRecursively(firstMonomer).length
    : 0;

  return !firstMonomer || totalMonomersCount <= connectedMonomersCount;
}

function temporarilyDeselectPartialMonomers(
  editor: CoreEditor,
  partiallySelectedMonomers: Set<BaseMonomer>,
): Map<BaseMonomer | CoreAtom, boolean> {
  const originalSelectionState = new Map<BaseMonomer | CoreAtom, boolean>();

  partiallySelectedMonomers.forEach((monomer) => {
    originalSelectionState.set(monomer, monomer.selected);
    monomer.selected = false;

    const monomerAtoms = getAtomsForMonomer(editor, monomer);
    monomerAtoms.forEach((atom) => {
      originalSelectionState.set(atom, atom.selected);
      atom.selected = false;
    });
  });

  return originalSelectionState;
}

function restoreSelectionState(
  originalSelectionState: Map<BaseMonomer | CoreAtom, boolean>,
): void {
  originalSelectionState.forEach((wasSelected, entity) => {
    entity.selected = wasSelected;
  });
}

export const useRecalculateMacromoleculeProperties = () => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const unipositiveIonsMeasurementUnit = useAppSelector(
    selectUnipositiveIonsMeasurementUnit,
  );
  const oligonucleotidesMeasurementUnit = useAppSelector(
    selectOligonucleotidesMeasurementUnit,
  );
  const unipositiveIonsValue = useAppSelector(selectUnipositiveIonsValue);
  const oligonucleotidesValue = useAppSelector(selectOligonucleotidesValue);

  return async (shouldSkip?: boolean) => {
    if (!editor || shouldSkip) {
      return;
    }

    const indigo = IndigoProvider.getIndigo() as StructService;
    const selectionDrawingEntitiesManager =
      editor.drawingEntitiesManager.filterSelection();
    const ketSerializer = new KetSerializer();
    const hasNoSelection = !selectionDrawingEntitiesManager.hasDrawingEntities;

    const partiallySelectedMonomers = findPartiallySelectedMonomers(
      editor,
      selectionDrawingEntitiesManager,
      hasNoSelection,
    );

    const drawingEntitiesManagerToCalculateProperties =
      selectionDrawingEntitiesManager.hasDrawingEntities
        ? selectionDrawingEntitiesManager
        : editor.drawingEntitiesManager;

    const allMonomers = [
      ...drawingEntitiesManagerToCalculateProperties.monomers.values(),
    ].filter((monomer) => !partiallySelectedMonomers.has(monomer));

    const chainsCollection = ChainsCollection.fromMonomers(allMonomers);
    const areAllMonomersConnected = checkMonomersConnectivity(
      allMonomers,
      chainsCollection,
    );

    if (
      hasNoSelection ||
      allMonomers.length === 0 ||
      !areAllMonomersConnected
    ) {
      dispatch(setMacromoleculesProperties(undefined));
      return;
    }

    const originalSelectionState = temporarilyDeselectPartialMonomers(
      editor,
      partiallySelectedMonomers,
    );

    const serializedKet = ketSerializer.serialize(
      new Struct(),
      editor.drawingEntitiesManager,
      undefined,
      false,
      true,
    );

    restoreSelectionState(originalSelectionState);
    const calculateMacromoleculePropertiesResponse =
      await indigo.calculateMacromoleculeProperties(
        {
          struct: serializedKet,
        },
        {
          upc:
            unipositiveIonsValue /
            molarMeasurementUnitToNumber[unipositiveIonsMeasurementUnit],
          nac:
            oligonucleotidesValue /
            molarMeasurementUnitToNumber[oligonucleotidesMeasurementUnit],
        },
      );

    try {
      const macromoleculeProperties =
        calculateMacromoleculePropertiesResponse.properties &&
        JSON.parse(calculateMacromoleculePropertiesResponse.properties);

      notifyRequestCompleted();
      dispatch(setMacromoleculesProperties(macromoleculeProperties));
    } catch (e) {
      KetcherLogger.error('Error during parsing macromolecule properties: ', e);

      dispatch(setMacromoleculesProperties(undefined));
    }
  };
};
