import { Page, Locator } from '@playwright/test';
import {
  Aromaticity,
  AtomType,
  Chirality,
  Connectivity,
  HCount,
  ImplicitHCount,
  Inversion,
  Radical,
  RingBondCount,
  RingMembership,
  RingSize,
  SubstitutionCount,
} from '@tests/pages/constants/atomProperties/Constants';

type AtomLocatorOptions = {
  atomId?: number;
  atomType?: AtomType;
  atomLabel?: string;
  atomCharge?: number | string;
  atomIsotopeAtomicMass?: number | string;
  atomValence?: number | string;
  atomRadical?: Radical;
  atomRingBondCount?: RingBondCount;
  atomHCount?: HCount;
  atomSubstitutionCount?: SubstitutionCount;
  atomUnsaturated?: boolean;
  atomAromaticity?: Aromaticity;
  atomImplicitHCount?: ImplicitHCount;
  atomRingMembership?: RingMembership;
  atomRingSize?: RingSize;
  atomConnectivity?: Connectivity;
  atomChirality?: Chirality;
  atomInversion?: Inversion;
  atomExactChange?: boolean;
  atomCustomQuery?: string;
};

export function getAtomLocator(
  page: Page,
  options: AtomLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'atom';

  if (options.atomId !== undefined) {
    attributes['data-atom-id'] = String(options.atomId);
  }

  if (options.atomType !== undefined) {
    attributes['data-atom-type'] = String(options.atomType);
  }
  if (options.atomLabel !== undefined) {
    attributes['data-atomLabel'] = options.atomLabel;
  }
  if (options.atomCharge !== undefined) {
    attributes['data-atomCharge'] = String(options.atomCharge);
  }
  if (options.atomIsotopeAtomicMass !== undefined) {
    attributes['data-atomIsotopeAtomicMass'] = String(
      options.atomIsotopeAtomicMass,
    );
  }
  if (options.atomValence !== undefined) {
    attributes['data-atomValence'] = String(options.atomValence);
  }
  if (options.atomRadical !== undefined) {
    attributes['data-atomRadical'] = String(options.atomRadical);
  }
  if (options.atomRingBondCount !== undefined) {
    attributes['data-atomRingBondCount'] = String(options.atomRingBondCount);
  }
  if (options.atomHCount !== undefined) {
    attributes['data-atomHCount'] = String(options.atomHCount);
  }
  if (options.atomSubstitutionCount !== undefined) {
    attributes['data-atomSubstitutionCount'] = String(
      options.atomSubstitutionCount,
    );
  }
  if (options.atomUnsaturated !== undefined) {
    attributes['data-atomUnsaturated'] = String(options.atomUnsaturated);
  }
  if (options.atomAromaticity !== undefined) {
    attributes['data-atomAromaticity'] = String(options.atomAromaticity);
  }
  if (options.atomImplicitHCount !== undefined) {
    attributes['data-atomImplicitHCount'] = String(options.atomImplicitHCount);
  }
  if (options.atomRingMembership !== undefined) {
    attributes['data-atomRingMembership'] = String(options.atomRingMembership);
  }
  if (options.atomRingSize !== undefined) {
    attributes['data-atomRingSize'] = String(options.atomRingSize);
  }
  if (options.atomConnectivity !== undefined) {
    attributes['data-atomConnectivity'] = String(options.atomConnectivity);
  }
  if (options.atomChirality !== undefined) {
    attributes['data-atomChirality'] = String(options.atomChirality);
  }
  if (options.atomInversion !== undefined) {
    attributes['data-atomInversion'] = String(options.atomInversion);
  }
  if (options.atomExactChange !== undefined) {
    attributes['data-atomExactChange'] = String(options.atomExactChange);
  }
  if (options.atomCustomQuery !== undefined) {
    attributes['data-atomCustomQuery'] = options.atomCustomQuery;
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}
