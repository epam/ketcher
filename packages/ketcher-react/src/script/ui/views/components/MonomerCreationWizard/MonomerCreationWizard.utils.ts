import {
  type BaseMonomer,
  type MonomerCreationInitialValues,
  KetMonomerClass,
} from 'ketcher-core';

const COPY_SUFFIX = '_Copy';

const getCopiedValue = (value?: string) =>
  value ? `${value}${COPY_SUFFIX}` : '';

const isNaturalAnalogueSupported = (
  monomerType: KetMonomerClass | 'rnaPreset' | undefined,
) =>
  monomerType === KetMonomerClass.AminoAcid ||
  monomerType === KetMonomerClass.Base ||
  monomerType === KetMonomerClass.RNA;

export const getEditInstanceInitialValues = (
  monomer: BaseMonomer,
): MonomerCreationInitialValues => {
  const { label, props } = monomer.monomerItem;
  const type = props.MonomerClass ?? KetMonomerClass.CHEM;
  const symbol = props.MonomerCode ?? label;
  const name = props.MonomerName ?? props.Name ?? symbol;
  const naturalAnalogue = isNaturalAnalogueSupported(type)
    ? props.MonomerNaturalAnalogCode
    : '';

  return {
    type,
    symbol: getCopiedValue(symbol),
    name: getCopiedValue(name),
    naturalAnalogue,
    aliasHELM: getCopiedValue(props.aliasHELM),
    aliasBILN: getCopiedValue(props.aliasBILN),
  };
};
