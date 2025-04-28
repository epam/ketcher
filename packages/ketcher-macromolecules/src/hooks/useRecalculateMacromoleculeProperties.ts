import { IndigoProvider } from 'ketcher-react';
import {
  Chain,
  ChainsCollection,
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

function isSenseAntisenseChains(chain1: Chain, chain2: Chain) {
  return (
    (chain1.isAntisense && !chain2.isAntisense) ||
    (!chain1.isAntisense && chain2.isAntisense)
  );
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

  return async () => {
    const indigo = IndigoProvider.getIndigo() as StructService;
    const selectionDrawingEntitiesManager =
      editor.drawingEntitiesManager.filterSelection();
    const ketSerializer = new KetSerializer();
    const drawingEntitiesManagerToCalculateProperties =
      selectionDrawingEntitiesManager.hasMonomers
        ? selectionDrawingEntitiesManager
        : editor.drawingEntitiesManager;
    const chainsCollection = ChainsCollection.fromMonomers([
      ...drawingEntitiesManagerToCalculateProperties.monomers.values(),
    ]);

    if (
      !drawingEntitiesManagerToCalculateProperties.hasMonomers ||
      chainsCollection.chains.length > 2 ||
      (chainsCollection.chains.length === 2 &&
        !isSenseAntisenseChains(
          chainsCollection.chains[0],
          chainsCollection.chains[1],
        ))
    ) {
      dispatch(setMacromoleculesProperties(undefined));

      return;
    }

    const serializedKet = ketSerializer.serialize(
      new Struct(),
      drawingEntitiesManagerToCalculateProperties,
      undefined,
      false,
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
