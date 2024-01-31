/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { AtomList, AtomListParams } from './atomList';
import { Point, Vec2 } from './vec2';

import { Elements } from 'domain/constants';
import { Pile } from './pile';
import { Struct } from './struct';

/**
 * Return unions of Pick.
 * Difference with <Partial<Pick<O,P>>>  that this type always require at least one property
 *
 * Example:
 * interface O {
 *   field1 : 1;
 *   field2: 2;
 *   field3: 3
 * }
 * SubsetOfFields<O, 'field1'| 'field2'>
 * @returns Pick<O, "field1"> | Pick<O, "field2">
 */
type SubsetOfFields<O, P extends keyof O> = P extends P ? Pick<O, P> : never;

export enum AttachmentPoints {
  None = 0,
  FirstSideOnly = 1,
  SecondSideOnly = 2,
  BothSides = 3,
}

export enum StereoLabel {
  Abs = 'abs',
  And = '&',
  Or = 'or',
}

enum CIP {
  S = 'S',
  R = 'R',
  s = 's',
  r = 'r',
}

export type Aromaticity = 'aromatic' | 'aliphatic';
export type Chirality = 'clockwise' | 'anticlockwise';

export interface AtomQueryProperties {
  aromaticity?: Aromaticity | null;
  ringMembership?: number | null;
  ringSize?: number | null;
  connectivity?: number | null;
  chirality?: Chirality | null;
  customQuery?: string | null;
}

export interface AtomAttributes {
  stereoParity?: number;
  stereoLabel?: string | null;
  exactChangeFlag?: number;
  rxnFragmentType?: number;
  invRet?: number;
  aam?: number;
  hCount?: number;
  isPreview?: boolean;
  unsaturatedAtom?: number;
  substitutionCount?: number;
  ringBondCount?: number;
  queryProperties?: AtomQueryProperties;
  explicitValence?: number;
  /**
   * Rgroup member attachment points
   * Its value is indigo-converted `ATTCHPT`
   * Ref: https://discover.3ds.com/sites/default/files/2020-08/biovia_ctfileformats_2020.pdf P15
   * Note: value `-1` has been converted to `3` by indigo.
   */
  attachmentPoints?: AttachmentPoints | null;
  rglabel?: string | null;
  charge?: number | null;
  radical?: number;
  cip?: CIP | null;
  isotope?: number | null;
  alias?: string | null;
  pseudo?: string;
  atomList?: AtomListParams | null;
  label: string;
  fragment?: number;
  pp?: Point;
  implicitH?: number;
  implicitHCount?: number | null;
  initiallySelected?: boolean;
}

export type AtomPropertiesInContextMenu = SubsetOfFields<
  AtomAttributes,
  | 'hCount'
  | 'ringBondCount'
  | 'substitutionCount'
  | 'unsaturatedAtom'
  | 'implicitHCount'
>;

export class Atom {
  static PATTERN = {
    RADICAL: {
      NONE: 0,
      SINGLET: 1,
      DOUPLET: 2,
      TRIPLET: 3,
    },
    STEREO_PARITY: {
      NONE: 0,
      ODD: 1,
      EVEN: 2,
      EITHER: 3,
    },
  };

  // TODO: rename
  static attrlist = {
    alias: null,
    label: 'C',
    isotope: null,
    radical: 0,
    cip: null,
    charge: null,
    explicitValence: -1,
    ringBondCount: 0,
    substitutionCount: 0,
    unsaturatedAtom: 0,
    hCount: 0,
    queryProperties: {
      aromaticity: null,
      ringMembership: null,
      ringSize: null,
      connectivity: null,
      chirality: null,
      customQuery: null,
    },
    atomList: null,
    invRet: 0,
    exactChangeFlag: 0,
    rglabel: null,
    attachmentPoints: null,
    aam: 0,
    isPreview: false,
    // enhanced stereo
    stereoLabel: null,
    stereoParity: 0,
    implicitHCount: null,
  };

  label: string;
  fragment: number;
  atomList: AtomList | null;
  attachmentPoints: AttachmentPoints | null;
  isotope: number | null;
  isPreview: boolean;
  hCount: number;
  radical: number;
  cip: CIP | null;
  charge: number | null;
  explicitValence: number;
  ringBondCount: number;
  queryProperties: AtomQueryProperties;
  unsaturatedAtom: number;
  substitutionCount: number;
  valence: number;
  implicitH: number;
  implicitHCount: number | null;
  pp: Vec2;
  neighbors: Array<number>;
  sgs: Pile<number>;
  badConn: boolean;
  alias: string | null;
  rglabel: string | null;
  aam: number;
  invRet: number;
  exactChangeFlag: number;
  rxnFragmentType: number;
  stereoLabel?: string | null;
  stereoParity: number;
  hasImplicitH?: boolean;
  pseudo!: string;
  initiallySelected?: boolean;

  /** @deprecated */
  get attpnt() {
    return this.attachmentPoints;
  }

  constructor(attributes: AtomAttributes) {
    this.label = attributes.label;
    this.fragment = getValueOrDefault(attributes.fragment, -1);
    this.alias = getValueOrDefault(attributes.alias, Atom.attrlist.alias);
    this.isotope = getValueOrDefault(attributes.isotope, Atom.attrlist.isotope);
    this.radical = getValueOrDefault(attributes.radical, Atom.attrlist.radical);
    this.cip = getValueOrDefault(attributes.cip, Atom.attrlist.cip);
    this.charge = getValueOrDefault(attributes.charge, Atom.attrlist.charge);
    this.rglabel = getValueOrDefault(attributes.rglabel, Atom.attrlist.rglabel);
    this.attachmentPoints = getValueOrDefault(
      attributes.attachmentPoints,
      Atom.attrlist.attachmentPoints,
    );
    this.implicitHCount = getValueOrDefault(attributes.implicitHCount, null);
    this.explicitValence = getValueOrDefault(
      attributes.explicitValence,
      Atom.attrlist.explicitValence,
    );
    this.isPreview = getValueOrDefault(
      attributes.isPreview,
      Atom.attrlist.isPreview,
    );

    this.valence = 0;
    this.implicitH = attributes.implicitHCount || attributes.implicitH || 0; // implicitH is not an attribute
    this.pp = attributes.pp ? new Vec2(attributes.pp) : new Vec2();
    this.initiallySelected = attributes.initiallySelected;

    // sgs should only be set when an atom is added to an s-group by an appropriate method,
    //   or else a copied atom might think it belongs to a group, but the group be unaware of the atom
    // TODO: make a consistency check on atom/s-group assignments
    this.sgs = new Pile();

    // query
    this.ringBondCount = getValueOrDefault(
      attributes.ringBondCount,
      Atom.attrlist.ringBondCount,
    );
    this.substitutionCount = getValueOrDefault(
      attributes.substitutionCount,
      Atom.attrlist.substitutionCount,
    );
    this.unsaturatedAtom = getValueOrDefault(
      attributes.unsaturatedAtom,
      Atom.attrlist.unsaturatedAtom,
    );
    this.hCount = getValueOrDefault(attributes.hCount, Atom.attrlist.hCount);
    this.queryProperties = {};
    for (const property in Atom.attrlist.queryProperties) {
      this.queryProperties[property] = getValueOrDefault(
        attributes.queryProperties?.[property],
        Atom.attrlist.queryProperties[property],
      );
    }

    // reaction
    this.aam = getValueOrDefault(attributes.aam, Atom.attrlist.aam);
    this.invRet = getValueOrDefault(attributes.invRet, Atom.attrlist.invRet);
    this.exactChangeFlag = getValueOrDefault(
      attributes.exactChangeFlag,
      Atom.attrlist.exactChangeFlag,
    );
    this.rxnFragmentType = getValueOrDefault(attributes.rxnFragmentType, -1);

    // stereo
    this.stereoLabel = getValueOrDefault(
      attributes.stereoLabel,
      Atom.attrlist.stereoLabel,
    );
    this.stereoParity = getValueOrDefault(
      attributes.stereoParity,
      Atom.attrlist.stereoParity,
    );

    this.atomList = attributes.atomList
      ? new AtomList(attributes.atomList)
      : null;
    this.neighbors = []; // set of half-bonds having this atom as their origin
    this.badConn = false;

    Object.defineProperty(this, 'pseudo', {
      enumerable: true,
      get: function () {
        return getPseudo(this.label);
      },
      set: function (value) {
        if (isCorrectPseudo(value)) {
          this.label = value;
        }
      },
    });
  }

  get isRGroupAttachmentPointEditDisabled() {
    return this.label === 'R#' && this.rglabel !== null;
  }

  /**
   * Trick: used for cloned struct for tooltips, for preview, for templates
   *
   * Why?
   * Currently, tooltips are implemented with removing sgroups (wrong implementation)
   * That's why we need to mark atoms as sgroup attachment points.
   *
   * If we change preview approach to flagged (option for showing sgroups without abbreviation),
   * then we will be able to remove this hack.
   */
  setRGAttachmentPointForDisplayPurpose() {
    this.attachmentPoints = AttachmentPoints.FirstSideOnly;
  }

  static getConnectedBondIds(struct: Struct, atomId: number): number[] {
    const result: number[] = [];
    for (const [bondId, bond] of struct.bonds.entries()) {
      if (bond.begin === atomId || bond.end === atomId) {
        result.push(bondId);
      }
    }
    return result;
  }

  static getAttrHash(atom: Atom) {
    const attrs: any = {};
    for (const attr in Atom.attrlist) {
      if (typeof atom[attr] !== 'undefined') attrs[attr] = atom[attr];
    }
    return attrs;
  }

  static attrGetDefault(attr: string) {
    if (attr in Atom.attrlist) {
      return Atom.attrlist[attr];
    }
  }

  static isHeteroAtom(label: string): boolean {
    return label !== 'C' && label !== 'H';
  }

  static isInAromatizedRing(struct: Struct, atomId: number): boolean {
    const atom = struct.atoms.get(atomId);
    if (atom && Atom.isHeteroAtom(atom.label)) {
      for (const [_, loop] of struct.loops) {
        const halfBondIds = loop.hbs;
        if (loop.aromatic) {
          for (const halfBondId of halfBondIds) {
            const halfBond = struct.halfBonds.get(halfBondId);
            if (!halfBond) return false;
            const { begin, end } = halfBond;
            if (begin === atomId || end === atomId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  clone(fidMap?: Map<number, number>): Atom {
    const ret = new Atom(this);
    if (fidMap && fidMap.has(this.fragment)) {
      ret.fragment = fidMap.get(this.fragment)!;
    }
    return ret;
  }

  isQuery(): boolean {
    const { queryProperties } = this;
    const isAnyAtom = this.label === 'A';
    const isAnyMetal = this.label === 'M' || this.label === 'MH';
    const isAnyHalogen = this.label === 'X' || this.label === 'XH';
    const isAnyGroup =
      this.label === 'G' ||
      this.label === 'G*' ||
      this.label === 'GH' ||
      this.label === 'GH*';
    return Boolean(
      this.substitutionCount !== 0 ||
        this.unsaturatedAtom !== 0 ||
        this.ringBondCount !== 0 ||
        isAnyAtom ||
        isAnyMetal ||
        isAnyHalogen ||
        isAnyGroup ||
        this.hCount !== 0 ||
        this.atomList !== null ||
        Object.values(queryProperties).some((value) => value),
    );
  }

  pureHydrogen(): boolean {
    return this.label === 'H' && this.isotope === 0;
  }

  isPlainCarbon(): boolean {
    return (
      this.label === 'C' &&
      this.isotope === null &&
      this.radical === 0 &&
      this.charge === null &&
      this.explicitValence < 0 &&
      this.ringBondCount === 0 &&
      this.substitutionCount === 0 &&
      this.unsaturatedAtom === 0 &&
      this.hCount === 0 &&
      !this.atomList
    );
  }

  isPseudo(): boolean {
    // TODO: handle reaxys generics separately
    return !this.atomList && !this.rglabel && !Elements.get(this.label);
  }

  hasRxnProps(): boolean {
    return !!(
      this.invRet ||
      this.exactChangeFlag ||
      this.attachmentPoints !== null ||
      this.aam
    );
  }

  calcValence(connectionCount: number): boolean {
    const label = this.label;
    const charge = this.charge || 0;
    if (this.isQuery() || this.attachmentPoints) {
      this.implicitH = 0;
      return true;
    }
    const element = Elements.get(label);

    const groupno = element?.group;
    const radicalCount = radicalElectrons(this.radical);
    let valence = connectionCount;
    let hydrogenCount: any = 0;
    const absCharge = Math.abs(charge);

    if (groupno === undefined) {
      if (label === 'D' || label === 'T') {
        valence = 1;
        hydrogenCount = 1 - radicalCount - connectionCount - absCharge;
      } else {
        this.implicitH = 0;
        return true;
      }
    } else if (groupno === 1) {
      if (
        label === 'H' ||
        label === 'Li' ||
        label === 'Na' ||
        label === 'K' ||
        label === 'Rb' ||
        label === 'Cs' ||
        label === 'Fr'
      ) {
        valence = 1;
        hydrogenCount = 1 - radicalCount - connectionCount - absCharge;
      }
    } else if (groupno === 2) {
      if (
        connectionCount + radicalCount + absCharge === 2 ||
        connectionCount + radicalCount + absCharge === 0
      ) {
        valence = 2;
      } else hydrogenCount = -1;
    } else if (groupno === 3) {
      if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
        if (charge === -1) {
          valence = 4;
          hydrogenCount = 4 - radicalCount - connectionCount;
        } else {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount - absCharge;
        }
      } else if (label === 'Tl') {
        if (charge === -1) {
          if (radicalCount + connectionCount <= 2) {
            valence = 2;
            hydrogenCount = 2 - radicalCount - connectionCount;
          } else {
            valence = 4;
            hydrogenCount = 4 - radicalCount - connectionCount;
          }
        } else if (charge === -2) {
          if (radicalCount + connectionCount <= 3) {
            valence = 3;
            hydrogenCount = 3 - radicalCount - connectionCount;
          } else {
            valence = 5;
            hydrogenCount = 5 - radicalCount - connectionCount;
          }
        } else if (radicalCount + connectionCount + absCharge <= 1) {
          valence = 1;
          hydrogenCount = 1 - radicalCount - connectionCount - absCharge;
        } else {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount - absCharge;
        }
      }
    } else if (groupno === 4) {
      if (label === 'C' || label === 'Si' || label === 'Ge') {
        valence = 4;
        hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
      } else if (label === 'Sn' || label === 'Pb') {
        if (connectionCount + radicalCount + absCharge <= 2) {
          valence = 2;
          hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
        } else {
          valence = 4;
          hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
        }
      }
    } else if (groupno === 5) {
      if (label === 'N' || label === 'P') {
        if (charge === 1) {
          valence = 4;
          hydrogenCount = 4 - radicalCount - connectionCount;
        } else if (charge === 2) {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount;
        } else if (
          label === 'N' ||
          radicalCount + connectionCount + absCharge <= 3
        ) {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount - absCharge;
        } else {
          // ELEM_P && rad + conn + absCharge > 3
          valence = 5;
          hydrogenCount = 5 - radicalCount - connectionCount - absCharge;
        }
      } else if (label === 'Bi' || label === 'Sb' || label === 'As') {
        if (charge === 1) {
          if (radicalCount + connectionCount <= 2 && label !== 'As') {
            valence = 2;
            hydrogenCount = 2 - radicalCount - connectionCount;
          } else {
            valence = 4;
            hydrogenCount = 4 - radicalCount - connectionCount;
          }
        } else if (charge === 2) {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount;
        } else if (radicalCount + connectionCount <= 3) {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount - absCharge;
        } else {
          valence = 5;
          hydrogenCount = 5 - radicalCount - connectionCount - absCharge;
        }
      }
    } else if (groupno === 6) {
      if (label === 'O') {
        if (charge >= 1) {
          valence = 3;
          hydrogenCount = 3 - radicalCount - connectionCount;
        } else {
          valence = 2;
          hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
        }
      } else if (label === 'S' || label === 'Se' || label === 'Po') {
        if (charge === 1) {
          if (connectionCount <= 3) {
            valence = 3;
            hydrogenCount = 3 - radicalCount - connectionCount;
          } else {
            valence = 5;
            hydrogenCount = 5 - radicalCount - connectionCount;
          }
        } else if (connectionCount + radicalCount + absCharge <= 2) {
          valence = 2;
          hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
        } else if (connectionCount + radicalCount + absCharge <= 4) {
          // See examples in PubChem
          // [S] : CID 16684216
          // [Se]: CID 5242252
          // [Po]: no example, just following ISIS/Draw logic here
          valence = 4;
          hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
        } else {
          // See examples in PubChem
          // [S] : CID 46937044
          // [Se]: CID 59786
          // [Po]: no example, just following ISIS/Draw logic here
          valence = 6;
          hydrogenCount = 6 - radicalCount - connectionCount - absCharge;
        }
      } else if (label === 'Te') {
        if (charge === -1) {
          if (connectionCount <= 2) {
            valence = 2;
            hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
          }
        } else if (charge === 0 || charge === 2) {
          if (connectionCount <= 2) {
            valence = 2;
            hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
          } else if (connectionCount <= 4) {
            valence = 4;
            hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
          } else if (charge === 0 && connectionCount <= 6) {
            valence = 6;
            hydrogenCount = 6 - radicalCount - connectionCount - absCharge;
          } else {
            hydrogenCount = -1;
          }
        }
      }
    } else if (groupno === 7) {
      if (label === 'F') {
        valence = 1;
        hydrogenCount = 1 - radicalCount - connectionCount - absCharge;
      } else if (
        label === 'Cl' ||
        label === 'Br' ||
        label === 'I' ||
        label === 'At'
      ) {
        if (charge === 1) {
          if (connectionCount <= 2) {
            valence = 2;
            hydrogenCount = 2 - radicalCount - connectionCount;
          } else if (
            connectionCount === 3 ||
            connectionCount === 5 ||
            connectionCount >= 7
          ) {
            hydrogenCount = -1;
          }
        } else if (charge === 0) {
          if (connectionCount <= 1) {
            valence = 1;
            hydrogenCount = 1 - radicalCount - connectionCount;
            // While the halogens can have valence 3, they can not have
            // hydrogens in that case.
          } else if (
            connectionCount === 2 ||
            connectionCount === 4 ||
            connectionCount === 6
          ) {
            if (radicalCount === 1) {
              valence = connectionCount;
              hydrogenCount = 0;
            } else {
              hydrogenCount = -1; // will throw an error in the end
            }
          } else if (connectionCount > 7) {
            hydrogenCount = -1; // will throw an error in the end
          }
        }
      }
    } else if (groupno === 8) {
      if (connectionCount + radicalCount + absCharge === 0) valence = 1;
      else hydrogenCount = -1;
    }
    if (Atom.isHeteroAtom(label) && this.implicitHCount !== null) {
      hydrogenCount = this.implicitHCount;
    }
    this.valence = valence;
    this.implicitH = hydrogenCount;
    if (this.implicitH < 0) {
      this.valence = connectionCount;
      this.implicitH = 0;
      this.badConn = true;
      return false;
    }
    return true;
  }

  calcValenceMinusHyd(conn: number): number {
    const charge = this.charge || 0;
    const label = this.label;
    const element = Elements.get(this.label);
    if (!element) {
      // query atom, skip
      this.implicitH = 0;
      return 0;
    }

    const groupno = element.group;
    const rad = radicalElectrons(this.radical);

    if (groupno === 3) {
      if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
        if (charge === -1) {
          if (rad + conn <= 4) return rad + conn;
        }
      }
    } else if (groupno === 5) {
      if (label === 'N' || label === 'P') {
        if (charge === 1) return rad + conn;
        if (charge === 2) return rad + conn;
      } else if (label === 'Sb' || label === 'Bi' || label === 'As') {
        if (charge === 1) return rad + conn;
        else if (charge === 2) return rad + conn;
      }
    } else if (groupno === 6) {
      if (label === 'O') {
        if (charge >= 1) return rad + conn;
      } else if (label === 'S' || label === 'Se' || label === 'Po') {
        if (charge === 1) return rad + conn;
      }
    } else if (groupno === 7) {
      if (label === 'Cl' || label === 'Br' || label === 'I' || label === 'At') {
        if (charge === 1) return rad + conn;
      }
    }

    return rad + conn + Math.abs(charge);
  }
}

export function radicalElectrons(radical: any) {
  radical -= 0;
  if (radical === Atom.PATTERN.RADICAL.DOUPLET) return 1;
  else if (
    radical === Atom.PATTERN.RADICAL.SINGLET ||
    radical === Atom.PATTERN.RADICAL.TRIPLET
  ) {
    return 2;
  } else {
    return 0;
  }
}

function getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return typeof value !== 'undefined' ? value : defaultValue;
}

function isCorrectPseudo(label) {
  return (
    !Elements.get(label) && label !== 'L' && label !== 'L#' && label !== 'R#'
  );
}

function getPseudo(label: string) {
  return isCorrectPseudo(label) ? label : '';
}
