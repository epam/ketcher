import { DrawingEntity } from 'domain/entities/DrawingEntity';
import type { Vec2 } from 'domain/entities/vec2';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { type Bond, BondType } from 'domain/entities/CoreBond';
import type { BaseRenderer } from 'application/render';
import { AtomLabel, Elements } from 'domain/constants';
import {
  calculateValenceMinusHydrogen,
  calculateValenceResult,
  resolveAromaticAtomValence,
} from 'domain/entities/atomValence';
import type { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { isNumber } from 'lodash';
import { MonomerToAtomBond } from './MonomerToAtomBond';
import type { AtomCIP } from './types';

export enum AtomRadical {
  None,
  Single,
  Doublet,
  Triplet,
}

export interface AtomProperties {
  charge?: number | null;
  explicitValence?: number;
  isotope?: number | null;
  radical?: AtomRadical;
  alias?: string | null;
  cip?: AtomCIP | null;
  stereoLabel?: string | null;
}

export class Atom extends DrawingEntity {
  public bonds: Array<Bond | MonomerToAtomBond> = [];
  public renderer: AtomRenderer | undefined = undefined;

  constructor(
    position: Vec2,
    public monomer: BaseMonomer,
    public atomIdInMicroMode: number,
    public label: AtomLabel,
    public properties: AtomProperties = {},
  ) {
    super(position);
  }

  public get center() {
    return this.position;
  }

  public addBond(bond: Bond | MonomerToAtomBond) {
    if (!this.bonds.includes(bond)) {
      this.bonds.push(bond);
    }
  }

  public deleteBond(bondId: number) {
    this.bonds = this.bonds.filter((bond) => bond.id !== bondId);
  }

  public setRenderer(renderer: AtomRenderer) {
    this.renderer = renderer;
    super.setBaseRenderer(renderer as BaseRenderer);
  }

  public get isCarbon() {
    return this.label === AtomLabel.C;
  }

  private calculateConnections(): {
    connectionCount: number;
    isAromatic: boolean;
  } {
    let connectionsAmount = 0;

    for (const bond of this.bonds) {
      if (bond instanceof MonomerToAtomBond) {
        connectionsAmount += 1;
      } else {
        switch (bond.type) {
          case BondType.Single:
            connectionsAmount += 1;
            break;
          case BondType.Double:
            connectionsAmount += 2;
            break;
          case BondType.Triple:
            connectionsAmount += 3;
            break;
          case BondType.Dative:
          case BondType.Hydrogen:
            break;
          case BondType.Aromatic:
            if (this.bonds.length === 1) {
              return { connectionCount: -1, isAromatic: true };
            }
            return { connectionCount: this.bonds.length, isAromatic: true };
          default:
            return { connectionCount: -1, isAromatic: false };
        }
      }
    }

    return { connectionCount: connectionsAmount, isAromatic: false };
  }

  public get hasAlias() {
    return Boolean(this.properties.alias);
  }

  public get hasRadical() {
    return isNumber(this.properties.radical) && this.properties.radical !== 0;
  }

  public get hasCharge() {
    return isNumber(this.properties.charge) && this.properties.charge !== 0;
  }

  public get hasExplicitValence() {
    return (
      isNumber(this.properties.explicitValence) &&
      this.properties.explicitValence !== -1
    );
  }

  public get hasExplicitIsotope() {
    return isNumber(this.properties.isotope) && this.properties.isotope >= 0;
  }

  public get hasBadValence() {
    return this.calculateValence().badValence;
  }

  public get hasStereoLabel() {
    return Boolean(this.properties.stereoLabel);
  }

  private get radicalAmount() {
    switch (this.properties.radical) {
      case AtomRadical.Single:
      case AtomRadical.Triplet:
        return 2;
      case AtomRadical.Doublet:
        return 1;
      default:
        return 0;
    }
  }

  calculateValence(): {
    valence: number;
    hydrogenAmount: number;
    badValence: boolean;
  } {
    const label = this.label;
    const charge = this.properties.charge ?? 0;
    const radicalCount = this.radicalAmount;
    const absCharge = Math.abs(charge);
    const { connectionCount, isAromatic } = this.calculateConnections();
    const element = Elements.get(label);

    let correctedConnectionCount = connectionCount;

    if (isAromatic) {
      const aromaticResolution = resolveAromaticAtomValence({
        label,
        charge,
        connectionCount,
        radicalCount,
        absCharge,
      });

      if (aromaticResolution.kind === 'calculated') {
        return {
          valence: connectionCount,
          hydrogenAmount: aromaticResolution.hydrogenCount,
          badValence: aromaticResolution.badValence,
        };
      }
      if (aromaticResolution.kind === 'correctedConnectivity') {
        correctedConnectionCount = aromaticResolution.connectionCount;
      }
    }

    if (correctedConnectionCount < 0) {
      return {
        valence: correctedConnectionCount,
        hydrogenAmount: 0,
        badValence: false,
      };
    }

    const context = {
      label,
      charge,
      connectionCount: correctedConnectionCount,
      radicalCount,
      absCharge,
    };

    if (this.hasExplicitValence) {
      const valence = this.properties.explicitValence as number;
      const hydrogenAmount = element
        ? valence - calculateValenceMinusHydrogen(element.group, context)
        : 0;

      return {
        valence,
        hydrogenAmount,
        badValence: hydrogenAmount < 0,
      };
    }

    const valenceResult = calculateValenceResult(element?.group, context);

    if (!valenceResult) {
      return {
        valence: correctedConnectionCount,
        hydrogenAmount: 0,
        badValence: false,
      };
    }

    return {
      valence: valenceResult.valence,
      hydrogenAmount: valenceResult.hydrogenCount,
      badValence: valenceResult.hydrogenCount < 0,
    };
  }
}
