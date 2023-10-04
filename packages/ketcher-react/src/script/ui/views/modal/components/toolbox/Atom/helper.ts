import { AtomType, Elements, genericsList } from 'ketcher-core';
import { capitalize } from 'lodash';
import { atom as atomSchema } from '../../../../../data/schema/struct-schema';

export function atomValid(
  label: string,
  isMultipleAtoms: boolean,
  atomType: AtomType,
  isCustomQuery: boolean,
) {
  const isChemicalElement = !!Elements.get(capitalize(label));
  if (atomType !== 'single' || isCustomQuery) {
    return true;
  }
  if (isMultipleAtoms) {
    return label === '' || isChemicalElement;
  }
  return label && isChemicalElement;
}

export function AtomListValid(
  value: string,
  atomType: AtomType,
  isCustomQuery: boolean,
) {
  if (atomType !== 'list' || isCustomQuery) {
    return true;
  }
  return value.length >= 1;
}

export function pseudoAtomValid(
  value: string,
  atomType: AtomType,
  isCustomQuery: boolean,
) {
  genericsList.includes(capitalize(value));
  const isGenericElement = genericsList.includes(value);
  if (atomType !== 'pseudo' || isCustomQuery) {
    return true;
  }
  return value && isGenericElement;
}

export function chargeValid(
  charge,
  isMultipleAtoms: boolean,
  isCustomQuery: boolean,
) {
  const regex = new RegExp(atomSchema.properties.charge.pattern);
  const result = regex.exec(charge);
  const isValidCharge = result && (result[1] === '' || result[3] === '');
  if (isCustomQuery) {
    return true;
  }
  if (isMultipleAtoms) {
    return charge === '0' || charge === 0 || charge === '' || isValidCharge;
  }
  return isValidCharge;
}

export function customQueryValid(value: string, isCustomQuery: boolean) {
  if (!isCustomQuery) {
    return true;
  }
  const regex = new RegExp(atomSchema.properties.customQuery.pattern);
  return regex.test(value);
}
