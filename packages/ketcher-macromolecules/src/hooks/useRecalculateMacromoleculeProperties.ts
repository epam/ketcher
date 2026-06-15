import { IndigoProvider } from 'ketcher-react';
import {
  ChainsCollection,
  Chain,
  getAllConnectedMonomersRecursively,
  KetcherLogger,
  KetSerializer,
  notifyRequestCompleted,
  Struct,
  StructService,
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
    const drawingEntitiesManagerToCalculateProperties =
      selectionDrawingEntitiesManager.hasDrawingEntities
        ? selectionDrawingEntitiesManager
        : editor.drawingEntitiesManager;
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManagerToCalculateProperties.monomers.values(),
    ]);
    const firstMonomer = chainsCollection.firstNode?.monomer;
    const areAllMonomersConnectedByCovalentOrHydrogenBonds =
      !firstMonomer ||
      chainsCollection.chains.reduce(
        (acc: number, chain: Chain) => acc + chain.monomers.length,
        0,
      ) <= getAllConnectedMonomersRecursively(firstMonomer).length;

    const hasNoChainsButMultipleFragments =
      chainsCollection.chains.length === 0 &&
      [...drawingEntitiesManagerToCalculateProperties.monomers.values()].filter(
        (monomer) => monomer.monomerItem.props.isMicromoleculeFragment,
      ).length > 1;

    if (
      !drawingEntitiesManagerToCalculateProperties.hasDrawingEntities ||
      !areAllMonomersConnectedByCovalentOrHydrogenBonds ||
      (hasNoSelection && hasNoChainsButMultipleFragments)
    ) {
      dispatch(setMacromoleculesProperties(undefined));

      return;
    }

    const serializedKet = ketSerializer.serialize(
      new Struct(),
      editor.drawingEntitiesManager,
      undefined,
      false,
      true,
    );
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
