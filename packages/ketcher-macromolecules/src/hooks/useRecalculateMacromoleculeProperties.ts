import { IndigoProvider } from 'ketcher-react';
import {
  Chain,
  ChainsCollection,
  getAllConnectedMonomersRecursively,
  KetcherLogger,
  KetSerializer,
  Struct,
  StructService,
} from 'ketcher-core';
import {
  molarMeasurementUnitToNumber,
  selectEditor,
  selectOligonucleotidesMeasurementUnit,
  selectUnipositiveIonsMeasurementUnit,
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

  return async (shouldSkip?: boolean) => {
    if (!editor || shouldSkip) {
      return;
    }

    const indigo = IndigoProvider.getIndigo() as StructService;
    const selectionDrawingEntitiesManager =
      editor.drawingEntitiesManager.filterSelection();
    const ketSerializer = new KetSerializer();
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

    if (
      !drawingEntitiesManagerToCalculateProperties.hasDrawingEntities ||
      !areAllMonomersConnectedByCovalentOrHydrogenBonds
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
            140 / molarMeasurementUnitToNumber[unipositiveIonsMeasurementUnit],
          nac:
            200 / molarMeasurementUnitToNumber[oligonucleotidesMeasurementUnit],
        },
      );

    try {
      const macromoleculeProperties =
        calculateMacromoleculePropertiesResponse.properties &&
        JSON.parse(calculateMacromoleculePropertiesResponse.properties);

      dispatch(setMacromoleculesProperties(macromoleculeProperties));
    } catch (e) {
      KetcherLogger.error('Error during parsing macromolecule properties: ', e);

      dispatch(setMacromoleculesProperties(undefined));
    }
  };
};
