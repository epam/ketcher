/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type Atom,
  type AttachmentPoints,
  AtomList,
  Bond,
  Elements,
  StereoLabel,
  getAtomType,
} from 'ketcher-core';
import { capitalize } from 'lodash/fp';
import {
  sdataSchema,
  getSdataDefault,
  sdataCustomSchema,
} from '../schema/sdata-schema';
import { matchCharge } from '../utilities';

const DefaultStereoGroupNumber = 1;

// getSdataDefault is from a .js file; TypeScript infers its optional params as `undefined`.
// This cast provides the correct callable signature.
const getSdataDefaultTyped = getSdataDefault as (
  schema: unknown,
  context?: string,
  fieldName?: string,
) => string | undefined;

/**
UI/form representation of an element, atom, or attachment point used in dialogs and tools.
*/
export interface ElementFormData {
  type?: string;
  values?: (string | number)[];
  label?: string;
  ap?: { primary: boolean; secondary: boolean };
  atomType?: string;
  atomList?: string | AtomList | null;
  notList?: boolean;
  pseudo?: string | null;
  customQuery?: string | null;
  rglabel?: number | null;
  alias?: string | null;
  charge?: string;
  isotope?: string;
  explicitValence?: number;
  radical?: number;
  invRet?: number;
  exactChangeFlag?: boolean | number;
  ringBondCount?: number;
  substitutionCount?: number;
  unsaturatedAtom?: boolean | number;
  hCount?: number;
  stereoParity?: number;
  implicitHCount?: number | null;
  aromaticity?: string | null;
  ringMembership?: number | null;
  ringSize?: number | null;
  connectivity?: number | null;
  chirality?: string | null;
  /**
  Fragment ID included in rlabel element payloads fired by the editor.
  */
  fragId?: number;
}

/**
S-group data as it comes from the editor (pre-dialog).
*/
export interface SGroupInput {
  type?: string;
  attrs: {
    context: string;
    fieldName: string;
    fieldValue: string | string[];
    absolute?: boolean;
    attached?: boolean;
    radiobuttons?: string;
    mul?: number;
    connectivity?: string;
    name?: string;
    nucleotideComponent?: string;
    subscript?: string;
    expanded?: boolean;
    showUnits?: boolean;
    nCharsToDisplay?: number;
    tagChar?: string;
    daspPos?: number;
    fieldType?: string;
    units?: string;
    query?: string;
    queryOp?: string;
  };
}

/**
S-group form data returned by the S-group dialog.
*/
export interface SGroupFormData {
  type?: string;
  context?: string;
  fieldName?: string;
  fieldValue?: string | string[];
  absolute?: boolean;
  attached?: boolean;
  radiobuttons?: string;
  mul?: number;
  connectivity?: string;
  name?: string;
  nucleotideComponent?: string;
  subscript?: string;
  expanded?: boolean;
  showUnits?: boolean;
  nCharsToDisplay?: number;
  tagChar?: string;
  daspPos?: number;
  fieldType?: string;
  units?: string;
  query?: string;
  queryOp?: string;
  selectedSruCount?: number;
}

export function fromElement(selem: Atom) {
  if (selem.label === 'R#') {
    const rglabel = typeof selem.rglabel === 'number' ? selem.rglabel : 0;
    return {
      type: 'rlabel',
      values: fromRlabel(rglabel),
      ...selem,
    };
  }
  if (selem.label === 'L#') return fromAtomList(selem);

  if (Elements.get(selem.label)) return fromAtom(selem);

  if (!selem.label && 'attachmentPoints' in selem)
    return { ap: fromApoint(selem.attachmentPoints) };

  return selem; // probably generic
}

export function toElement(element: ElementFormData) {
  if (element.type === 'rlabel') {
    const values = Array.isArray(element.values)
      ? element.values.filter(
          (value): value is number => typeof value === 'number',
        )
      : [];

    return {
      label: values.length ? 'R#' : 'C',
      rglabel: values.length === 0 ? null : toRlabel(values),
    };
  }
  if (element.type === 'list' || element.type === 'not-list')
    return toAtomList(
      element as { type: 'list' | 'not-list'; values: string[] },
    );

  if (!element.label && element.ap) {
    return { attachmentPoints: toApoint(element.ap) };
  }
  if (element.atomType === 'list') {
    element.label = 'L#';
    element.pseudo = null;
    element.atomList = new AtomList({
      notList: !!element.notList,
      ids:
        (element.atomList as string | null)
          ?.split(',')
          .map((elementName: string) => Elements.get(elementName)?.number)
          .filter((id): id is number => id !== undefined) || [],
    });
    delete element.notList;
    delete element.atomType;
    return toAtom(element);
  }

  if (element.atomType === 'pseudo') {
    element.label = element.pseudo ?? undefined;
    element.atomList = null;
    delete element.notList;
    delete element.atomType;
    return toAtom(element);
  }

  if (
    Elements.get(capitalize(element.label ?? '')) ||
    (element.customQuery && element.customQuery !== '')
  ) {
    element.label = capitalize(element.label ?? '');
    element.pseudo = null;
    element.atomList = null;
    delete element.notList;
    delete element.atomType;
    return toAtom(element);
  }

  if (
    element.label === 'A' ||
    element.label === '*' ||
    element.label === 'Q' ||
    element.label === 'X' ||
    element.label === 'R'
  ) {
    element.pseudo = element.label;
    return toAtom(element);
  }

  return element;
}

export function fromAtom(satom?: Atom) {
  if (!satom) return null;
  const alias = satom.alias ?? '';
  const atomType = getAtomType(satom);
  return {
    alias,
    atomType,
    atomList:
      satom.atomList?.ids
        .map((index) => Elements.get(index)?.label)
        .filter((label) => label !== undefined)
        .join(',') ?? '',
    notList: satom.atomList?.notList || false,
    pseudo: satom.pseudo,
    label: satom.label,
    charge: satom.charge === null ? '' : satom.charge.toString(),
    isotope: satom.isotope === null ? '' : satom.isotope.toString(),
    explicitValence: satom.explicitValence,
    radical: satom.radical,
    invRet: satom.invRet,
    exactChangeFlag: !!satom.exactChangeFlag,
    ringBondCount: satom.ringBondCount,
    substitutionCount: satom.substitutionCount,
    unsaturatedAtom: !!satom.unsaturatedAtom,
    hCount: satom.hCount,
    stereoParity: satom.stereoParity,
    implicitHCount: satom.implicitHCount,
    aromaticity: satom.queryProperties.aromaticity,
    ringMembership: satom.queryProperties.ringMembership,
    ringSize: satom.queryProperties.ringSize,
    connectivity: satom.queryProperties.connectivity,
    chirality: satom.queryProperties.chirality,
    customQuery:
      satom.queryProperties.customQuery == null
        ? ''
        : satom.queryProperties.customQuery.toString(),
  };
}

export function toAtom(atom: ElementFormData): Partial<Atom> {
  // TODO merge this to Atom.attrlist?
  //      see ratomtool
  const {
    aromaticity = null,
    ringMembership = null,
    ringSize = null,
    connectivity = null,
    chirality = null,
    customQuery = '',
    ...restAtom
  } = atom;
  if (customQuery && customQuery !== '') {
    return {
      ...restAtom,
      label: 'A',
      atomList: null,
      pseudo: undefined,
      alias: null,
      charge: null,
      isotope: null,
      explicitValence: -1,
      radical: 0,
      ringBondCount: 0,
      hCount: 0,
      substitutionCount: 0,
      unsaturatedAtom: 0,
      implicitHCount: null,
      queryProperties: {
        aromaticity: null,
        ringMembership: null,
        ringSize: null,
        connectivity: null,
        chirality: null,
        customQuery,
      },
      invRet: 0,
      exactChangeFlag: 0,
    } as Partial<Atom>;
  }
  const pch = matchCharge(restAtom.charge as string);
  const charge = pch
    ? Number.parseInt(pch[1] + pch[3] + pch[2])
    : restAtom.charge;

  const conv = {
    ...restAtom,
    isotope: restAtom.isotope ? Number(restAtom.isotope) : null,
    // empty charge value by default treated as zero,
    // no need to pass and display zero values(0, -0) explicitly
    charge: charge !== 0 && restAtom.charge ? Number(charge) : null,
    // Empty string from cleared form field must become null like undefined (not ?? alone).
    alias: restAtom.alias === '' ? null : (restAtom.alias ?? null),
    exactChangeFlag: +(restAtom.exactChangeFlag ?? false),
    unsaturatedAtom: +(restAtom.unsaturatedAtom ?? false),
    queryProperties: {
      aromaticity,
      ringMembership,
      ringSize,
      connectivity,
      chirality,
      customQuery: customQuery === '' ? null : customQuery,
    },
  };

  return conv as Partial<Atom>;
}

function fromAtomList(satom: Atom) {
  const atomList = satom.atomList;
  return {
    type: atomList?.notList ? 'not-list' : 'list',
    values:
      atomList?.ids
        .map((index) => Elements.get(index)?.label)
        .filter((label) => label !== undefined) ?? [],
  };
}

function toAtomList(atom: { type: 'list' | 'not-list'; values: string[] }) {
  return {
    pseudo: null,
    label: 'L#',
    atomList: new AtomList({
      notList: atom.type === 'not-list',
      ids: atom.values
        .map((elementName: string) => Elements.get(elementName)?.number)
        .filter((id): id is number => id !== undefined),
    }),
  };
}

export function fromStereoLabel(stereoLabel: string | null) {
  if (stereoLabel === null) return { type: null };
  const typeMatch = stereoLabel.match(/\D+/g);
  if (!typeMatch?.length) {
    return { type: stereoLabel, orNumber: 0, andNumber: 0 };
  }

  const type = typeMatch[0];
  const number = +stereoLabel.replace(type, '');

  if (type === StereoLabel.Abs) {
    return {
      type: stereoLabel,
      orNumber: DefaultStereoGroupNumber,
      andNumber: DefaultStereoGroupNumber,
    };
  }

  if (type === StereoLabel.And) {
    return {
      type,
      orNumber: DefaultStereoGroupNumber,
      andNumber: number,
    };
  }

  if (type === StereoLabel.Or) {
    return {
      type,
      orNumber: number,
      andNumber: DefaultStereoGroupNumber,
    };
  }

  return { type: null };
}

export function toStereoLabel(stereoLabel: {
  type: string | null;
  andNumber?: number;
  orNumber?: number;
}) {
  switch (stereoLabel.type) {
    case StereoLabel.And:
      return `${StereoLabel.And}${stereoLabel.andNumber ?? 1}`;

    case StereoLabel.Or:
      return `${StereoLabel.Or}${stereoLabel.orNumber ?? 1}`;

    default:
      return stereoLabel.type;
  }
}

function fromApoint(sap: AttachmentPoints | null) {
  return {
    primary: ((sap ?? 0) & 1) > 0,
    secondary: ((sap ?? 0) & 2) > 0,
  };
}

function toApoint(ap: { primary: boolean; secondary: boolean }) {
  return (ap.primary ? 1 : 0) + (ap.secondary ? 2 : 0);
}

function fromRlabel(rg: number) {
  const result: number[] = [];
  for (let rgi = 0; rgi < 32; rgi++) {
    if (rg & (1 << rgi)) {
      result.push(rgi + 1);
    }
  }
  return result;
}

function toRlabel(values: number[]) {
  let result = 0;
  values.forEach((value) => {
    const rgi = value - 1;
    result |= 1 << rgi;
  });
  return result;
}

export function fromBond(sbond?: Bond) {
  if (!sbond) return null;
  const type = sbond.type;
  const stereo = sbond.stereo;
  const isCustomQuery = sbond.customQuery !== null;
  return {
    type: isCustomQuery ? '' : fromBondType(type, stereo),
    topology: sbond.topology,
    center: sbond.reactingCenterStatus,
    customQuery: isCustomQuery ? (sbond.customQuery?.toString() ?? '') : '',
  };
}

export function toBond(bond: ReturnType<typeof fromBond>) {
  if (!bond) return null;
  const isCustomQuery = bond.customQuery !== '';
  return {
    topology: bond.topology,
    reactingCenterStatus: bond.center,
    customQuery: isCustomQuery ? bond.customQuery : null,
    ...toBondType(isCustomQuery ? 'any' : bond.type),
  };
}

const bondCaptionMap: Record<string, { type: number; stereo: number }> = {
  single: {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  up: {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.UP,
  },
  down: {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.DOWN,
  },
  updown: {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.EITHER,
  },
  double: {
    type: Bond.PATTERN.TYPE.DOUBLE,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  crossed: {
    type: Bond.PATTERN.TYPE.DOUBLE,
    stereo: Bond.PATTERN.STEREO.CIS_TRANS,
  },
  triple: {
    type: Bond.PATTERN.TYPE.TRIPLE,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  aromatic: {
    type: Bond.PATTERN.TYPE.AROMATIC,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  singledouble: {
    type: Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  singlearomatic: {
    type: Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  doublearomatic: {
    type: Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  any: {
    type: Bond.PATTERN.TYPE.ANY,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  hydrogen: {
    type: Bond.PATTERN.TYPE.HYDROGEN,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  dative: {
    type: Bond.PATTERN.TYPE.DATIVE,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
  haptic: {
    type: Bond.PATTERN.TYPE.HAPTIC,
    stereo: Bond.PATTERN.STEREO.NONE,
  },
};

export function toBondType(caption: string) {
  return { ...bondCaptionMap[caption] };
}

function fromBondType(type: number, stereo: number) {
  for (const caption in bondCaptionMap) {
    if (
      bondCaptionMap[caption].type === type &&
      bondCaptionMap[caption].stereo === stereo
    )
      return caption;
  }
  return '';
}

export function fromSgroup(ssgroup: SGroupInput) {
  const type = ssgroup.type ?? 'DAT';
  const { context, fieldName, fieldValue, absolute, attached } = ssgroup.attrs;

  if (absolute === false && attached === false)
    ssgroup.attrs.radiobuttons = 'Relative';
  else ssgroup.attrs.radiobuttons = attached ? 'Attached' : 'Absolute';

  if (sdataSchema[context][fieldName]?.properties.fieldValue.items)
    ssgroup.attrs.fieldValue = (fieldValue as string).split('\n');

  const sDataInitValue =
    type === 'DAT'
      ? {
          context:
            context || getSdataDefaultTyped(sdataCustomSchema, 'context'),
          fieldName:
            fieldName || getSdataDefaultTyped(sdataCustomSchema, 'fieldName'),
          fieldValue:
            fieldValue || getSdataDefaultTyped(sdataCustomSchema, 'fieldValue'),
        }
      : {};

  return { type, ...ssgroup.attrs, ...sDataInitValue };
}

export function toSgroup(sgroup: SGroupFormData) {
  const { type, radiobuttons, ...properties } = sgroup;
  const attributes = { ...properties };

  const absolute = 'absolute';
  const attached = 'attached';

  switch (radiobuttons) {
    case 'Absolute':
      attributes[absolute] = true;
      attributes[attached] = false;
      break;
    case 'Attached':
      attributes[absolute] = false;
      attributes[attached] = true;
      break;
    case 'Relative':
      attributes[absolute] = false;
      attributes[attached] = false;
      break;
    default:
      break;
  }

  if (attributes.fieldName) attributes.fieldName = attributes.fieldName.trim();

  if (attributes.fieldValue) {
    attributes.fieldValue =
      typeof attributes.fieldValue === 'string'
        ? attributes.fieldValue.trim()
        : attributes.fieldValue;
  }

  return {
    type,
    attrs: attributes,
  };
}
