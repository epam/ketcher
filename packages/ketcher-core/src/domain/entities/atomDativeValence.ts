import {
  DATIVE_IMPLICIT_HYDROGEN_LABELS,
  getDativeValenceConfig,
} from 'domain/constants/dativeValence';

export interface DativeValenceInput {
  label: string;
  charge: number;
  radicalCount: number;
  /** Sum of bond orders, excluding dative and hydrogen bonds */
  bondOrderSum: number;
  donorCount: number;
  acceptorCount: number;
}

export interface DativeValenceResult {
  eligibleElectrons: number;
  eligibleOrbitals: number;
  maxDonors: number;
  maxAcceptors: number;
  hasValenceError: boolean;
  implicitHydrogenCount: number;
}

export function calcDativeValence(
  input: DativeValenceInput,
): DativeValenceResult | null {
  const { label, charge, radicalCount, bondOrderSum } = input;
  const config = getDativeValenceConfig(label);
  if (!config) {
    return null;
  }

  const eligibleElectrons =
    config.valenceElectrons - charge - bondOrderSum - radicalCount;
  const eligibleOrbitals = config.valenceOrbitals - bondOrderSum - radicalCount;

  const maxDonors = allowedCapacity(
    Math.floor(eligibleElectrons / 2),
    eligibleOrbitals,
  );
  const maxAcceptors = allowedCapacity(
    eligibleOrbitals - Math.ceil(eligibleElectrons / 2),
    eligibleOrbitals,
  );

  const cancelledPairs = Math.min(input.donorCount, input.acceptorCount);
  const donors = input.donorCount - cancelledPairs;
  const acceptors = input.acceptorCount - cancelledPairs;

  const remainingElectrons = Math.max(0, eligibleElectrons - 2 * donors);
  const remainingOrbitals = Math.max(0, eligibleOrbitals - donors - acceptors);

  return {
    eligibleElectrons,
    eligibleOrbitals,
    maxDonors,
    maxAcceptors,
    hasValenceError: donors > maxDonors || acceptors > maxAcceptors,
    implicitHydrogenCount: DATIVE_IMPLICIT_HYDROGEN_LABELS.has(label)
      ? calcImplicitHydrogen(remainingElectrons, remainingOrbitals)
      : 0,
  };
}

function allowedCapacity(capacity: number, orbitals: number): number {
  return capacity > 0 && orbitals >= capacity ? capacity : 0;
}

function calcImplicitHydrogen(electrons: number, orbitals: number): number {
  if (electrons <= orbitals) {
    return electrons;
  }
  if (2 * orbitals > electrons) {
    return 2 * orbitals - electrons;
  }
  return 0;
}
