export const LONG_SEQUENCE_MONOMER_THRESHOLD = 3000;

export const isLongSequenceMonomerCount = (monomerCount: number) =>
  monomerCount > LONG_SEQUENCE_MONOMER_THRESHOLD;
