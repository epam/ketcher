import { CalculateProps, CalculateResult, Struct } from 'ketcher-core';

const ELECTRON_MASS = 0.00054857990946;
const MONOISOTOPIC_MASS_PROPERTY: CalculateProps = 'monoisotopic-mass';

type CalculateResultLike = Partial<CalculateResult>;

function getTotalCharge(struct: Struct, selectedAtoms: number[] = []): number {
  const selectedAtomIds = selectedAtoms.length ? new Set(selectedAtoms) : null;
  let totalCharge = 0;

  struct.atoms.forEach((atom, atomId) => {
    if (!selectedAtomIds || selectedAtomIds.has(atomId)) {
      totalCharge += atom.charge ?? 0;
    }
  });

  return totalCharge;
}

function correctMassValue(
  value: CalculateResultLike[typeof MONOISOTOPIC_MASS_PROPERTY],
  totalCharge: number,
) {
  if (typeof value === 'number') {
    return value - totalCharge * ELECTRON_MASS;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    const numericValue = Number(trimmedValue);

    if (trimmedValue && Number.isFinite(numericValue)) {
      return String(numericValue - totalCharge * ELECTRON_MASS);
    }
  }

  return value;
}

export function correctCalculatedExactMass(
  values: CalculateResultLike,
  struct: Struct,
  selectedAtoms: number[] = [],
): CalculateResultLike {
  const totalCharge = getTotalCharge(struct, selectedAtoms);

  if (!totalCharge) {
    return values;
  }

  return {
    ...values,
    [MONOISOTOPIC_MASS_PROPERTY]: correctMassValue(
      values[MONOISOTOPIC_MASS_PROPERTY],
      totalCharge,
    ),
  };
}
