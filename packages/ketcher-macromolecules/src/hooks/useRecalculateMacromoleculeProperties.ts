import { IndigoProvider } from 'ketcher-react';
import {
  ChainsCollection,
  Chain,
  getAllConnectedMonomersRecursively,
  KetcherLogger,
  KetSerializer,
  Nucleoside,
  Nucleotide,
  notifyRequestCompleted,
  SingleChainMacromoleculeProperties,
  Struct,
  StructService,
  SubChainNode,
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

const parseConcentrationValueOrDefault = (value: string) => {
  const concentration = Number(value.replace(',', '.'));

  return Number.isFinite(concentration) ? concentration : 0;
};

const isNucleicNode = (node: SubChainNode) =>
  node instanceof Nucleotide || node instanceof Nucleoside;

const isPureNucleicChain = (chain: Chain) =>
  chain.nodes.length > 0 && chain.nodes.every(isNucleicNode);

const hasComplementaryBase = (
  node: SubChainNode,
  chain: Chain,
  chainsCollection: ChainsCollection,
) => {
  if (!(node instanceof Nucleotide || node instanceof Nucleoside)) {
    return false;
  }

  const {
    complimentaryChain: complementaryChain,
    complimentaryNode: complementaryNode,
  } = chainsCollection.getComplimentaryChainIfNucleotide(
    node,
    chainsCollection.monomerToChain,
    chainsCollection.monomerToNode,
  );

  return (
    complementaryChain !== undefined &&
    complementaryChain !== chain &&
    complementaryNode !== undefined &&
    isPureNucleicChain(complementaryChain) &&
    isNucleicNode(complementaryNode)
  );
};

const isMeltingTemperatureCalculationAvailable = (
  chainsCollection: ChainsCollection,
) =>
  chainsCollection.chains.some(
    (chain) =>
      isPureNucleicChain(chain) &&
      chain.nodes.every((node) =>
        hasComplementaryBase(node, chain, chainsCollection),
      ),
  );

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
            parseConcentrationValueOrDefault(unipositiveIonsValue) /
            molarMeasurementUnitToNumber[unipositiveIonsMeasurementUnit],
          nac:
            parseConcentrationValueOrDefault(oligonucleotidesValue) /
            molarMeasurementUnitToNumber[oligonucleotidesMeasurementUnit],
        },
      );

    try {
      const macromoleculeProperties: SingleChainMacromoleculeProperties[] =
        calculateMacromoleculePropertiesResponse.properties &&
        JSON.parse(calculateMacromoleculePropertiesResponse.properties);
      const isTmCalculationAvailable =
        isMeltingTemperatureCalculationAvailable(chainsCollection);

      notifyRequestCompleted();
      dispatch(
        setMacromoleculesProperties(
          macromoleculeProperties.map((properties) => ({
            ...properties,
            isMeltingTemperatureCalculationAvailable: isTmCalculationAvailable,
          })),
        ),
      );
    } catch (e) {
      KetcherLogger.error('Error during parsing macromolecule properties: ', e);

      dispatch(setMacromoleculesProperties(undefined));
    }
  };
};
