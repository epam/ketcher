import type { Element } from 'domain/constants/element.types';

export interface DativeValenceContext {
  element: Element;
  charge: number;
  bondOrder: number;
  radicalCount: number;
  donorCount: number;
  acceptorCount: number;
}

export interface DativeValenceResult {
  hydrogenCount: number;
  isValid: boolean;
}

type AtomicNumberRange = readonly [number, number];

const F_BLOCK_RANGES: readonly AtomicNumberRange[] = [
  [57, 70],
  [89, 102],
];
// #10427 assigns 9 orbitals to d-block ranges and selected alkaline-earth atoms.
const NINE_ORBITAL_RANGES: readonly AtomicNumberRange[] = [
  [12, 12],
  [20, 30],
  [38, 48],
  [56, 56],
  [71, 80],
  [88, 88],
  [103, 112],
];

function isInRanges(
  atomicNumber: number,
  ranges: readonly AtomicNumberRange[],
): boolean {
  return ranges.some(
    ([firstAtomicNumber, lastAtomicNumber]) =>
      atomicNumber >= firstAtomicNumber && atomicNumber <= lastAtomicNumber,
  );
}

function getValenceElectronCount(atomicNumber: number): number {
  // El0 is the neutral atom's outer-shell electron count from #10427.
  if (atomicNumber <= 2) {
    return atomicNumber;
  }
  if (atomicNumber <= 10) {
    return atomicNumber - 2;
  }
  if (atomicNumber <= 18) {
    return atomicNumber - 10;
  }
  if (atomicNumber <= 30) {
    return atomicNumber - 18;
  }
  if (atomicNumber <= 36) {
    return atomicNumber - 28;
  }
  if (atomicNumber <= 48) {
    return atomicNumber - 36;
  }
  if (atomicNumber <= 54) {
    return atomicNumber - 46;
  }
  if (atomicNumber <= 70) {
    return atomicNumber - 54;
  }
  if (atomicNumber <= 80) {
    return atomicNumber - 68;
  }
  if (atomicNumber <= 86) {
    return atomicNumber - 78;
  }
  if (atomicNumber <= 102) {
    return atomicNumber - 86;
  }
  if (atomicNumber <= 112) {
    return atomicNumber - 100;
  }
  return atomicNumber - 110;
}

function getValenceOrbitalCount(atomicNumber: number): number {
  if (atomicNumber <= 2) {
    return 1;
  }
  if (isInRanges(atomicNumber, F_BLOCK_RANGES)) {
    return 13;
  }
  if (isInRanges(atomicNumber, NINE_ORBITAL_RANGES)) {
    return 9;
  }
  return 4;
}

function canHaveImplicitHydrogens(atomicNumber: number): boolean {
  // Match standalone H rendering: H, alkali metals, and groups 13-17.
  return (
    atomicNumber === 1 ||
    atomicNumber === 3 ||
    atomicNumber === 11 ||
    atomicNumber === 19 ||
    atomicNumber === 37 ||
    atomicNumber === 55 ||
    atomicNumber === 87 ||
    (atomicNumber >= 5 && atomicNumber <= 9) ||
    (atomicNumber >= 13 && atomicNumber <= 17) ||
    (atomicNumber >= 31 && atomicNumber <= 35) ||
    (atomicNumber >= 49 && atomicNumber <= 53) ||
    (atomicNumber >= 81 && atomicNumber <= 85)
  );
}

export function calculateDativeValence({
  element,
  charge,
  bondOrder,
  radicalCount,
  donorCount,
  acceptorCount,
}: DativeValenceContext): DativeValenceResult {
  const canceledBondCount = Math.min(donorCount, acceptorCount);
  const remainingDonorCount = donorCount - canceledBondCount;
  const remainingAcceptorCount = acceptorCount - canceledBondCount;
  const roundedBondOrder = Math.ceil(bondOrder);
  const electronCount =
    getValenceElectronCount(element.number) -
    charge -
    roundedBondOrder -
    radicalCount;
  const orbitalCount =
    getValenceOrbitalCount(element.number) - roundedBondOrder - radicalCount;
  const maximumDonorCount = Math.floor(electronCount / 2);
  const maximumAcceptorCount = orbitalCount - Math.ceil(electronCount / 2);
  // The capacity itself must fit the available orbitals, as required by #10427.
  const donorIsValid =
    remainingDonorCount === 0 ||
    (maximumDonorCount > 0 &&
      maximumDonorCount <= orbitalCount &&
      remainingDonorCount <= maximumDonorCount);
  const acceptorIsValid =
    remainingAcceptorCount === 0 ||
    (maximumAcceptorCount > 0 &&
      maximumAcceptorCount <= orbitalCount &&
      remainingAcceptorCount <= maximumAcceptorCount);
  const isValid = donorIsValid && acceptorIsValid;

  if (!isValid) {
    return { hydrogenCount: 0, isValid };
  }
  if (!canHaveImplicitHydrogens(element.number)) {
    return { hydrogenCount: 0, isValid };
  }

  const remainingElectronCount = electronCount - 2 * remainingDonorCount;
  const remainingOrbitalCount =
    orbitalCount - remainingDonorCount - remainingAcceptorCount;
  let hydrogenCount = 0;

  if (remainingElectronCount <= remainingOrbitalCount) {
    hydrogenCount = remainingElectronCount;
  } else if (remainingElectronCount < 2 * remainingOrbitalCount) {
    hydrogenCount = 2 * remainingOrbitalCount - remainingElectronCount;
  }

  return { hydrogenCount, isValid };
}
