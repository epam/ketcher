import { IndigoProvider } from 'ketcher-react';
import {
  BaseMonomer,
  Chain,
  ChainsCollection,
  KetSerializer,
  Struct,
  StructService,
} from 'ketcher-core';
import { selectEditor, setMacromoleculesProperties } from 'state/common';
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
      await indigo.calculateMacromoleculeProperties({
        struct: serializedKet,
      });
    const macromoleculeProperties =
      calculateMacromoleculePropertiesResponse.properties &&
      JSON.parse(calculateMacromoleculePropertiesResponse.properties);

    dispatch(setMacromoleculesProperties(macromoleculeProperties));
  };
};
