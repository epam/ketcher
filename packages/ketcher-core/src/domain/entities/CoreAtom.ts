import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Bond, BondType } from 'domain/entities/CoreBond';
import { BaseRenderer } from 'application/render';
import { AtomLabel, Elements } from 'domain/constants';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { isNumber } from 'lodash';
import { MonomerToAtomBond } from './MonomerToAtomBond';
import { AtomCIP } from './types';

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

  private calculateConnections() {
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
              return -1;
            }
            return this.bonds.length;
          default:
            return -1;
        }
      }
    }

    return connectionsAmount;
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
    const { hydrogenAmount } = this.calculateValence();
    return hydrogenAmount < 0;
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

  private get valenceWithoutHydrogen() {
    const charge = this.properties.charge ?? 0;
    const label = this.label;
    const element = Elements.get(this.label);

    const elementGroupNumber = element?.group;
    const radicalAmount = this.radicalAmount;
    const connectionAmount = this.calculateConnections();
    const absoluteCharge = Math.abs(charge);

    if (elementGroupNumber === 3) {
      if (
        label === AtomLabel.B ||
        label === AtomLabel.Al ||
        label === AtomLabel.Ga ||
        label === AtomLabel.In
      ) {
        if (charge === -1) {
          if (radicalAmount + connectionAmount <= 4) {
            return radicalAmount + connectionAmount;
          }
        }
      }
    } else if (elementGroupNumber === 5) {
      if (
        label === AtomLabel.N ||
        label === AtomLabel.P ||
        label === AtomLabel.Sb ||
        label === AtomLabel.Bi ||
        label === AtomLabel.As
      ) {
        if (charge === 1 || charge === 2) {
          return radicalAmount + connectionAmount;
        }
      }
    } else if (elementGroupNumber === 6) {
      if (label === AtomLabel.O) {
        if (charge >= 1) {
          return radicalAmount + connectionAmount;
        }
      } else if (
        label === AtomLabel.S ||
        label === AtomLabel.Se ||
        label === AtomLabel.Po
      ) {
        if (charge === 1) {
          return radicalAmount + connectionAmount;
        }
      }
    } else if (elementGroupNumber === 7) {
      if (
        label === AtomLabel.Cl ||
        label === AtomLabel.Br ||
        label === AtomLabel.I ||
        label === AtomLabel.At
      ) {
        if (charge === 1) {
          return radicalAmount + connectionAmount;
        }
      }
    }

    return radicalAmount + connectionAmount + absoluteCharge;
  }

  calculateValence() {
    if (this.hasExplicitValence) {
      const valence = this.properties.explicitValence as number;
      const hydrogenAmount = valence - this.valenceWithoutHydrogen;

      return {
        valence,
        hydrogenAmount,
      };
    }

    const label = this.label;
    const element = Elements.get(label);
    const elementGroupNumber = element?.group;
    const connectionAmount = this.calculateConnections();
    const radicalAmount = this.radicalAmount;
    const charge = this.properties.charge ?? 0;
    const absCharge = Math.abs(charge);
    let valence = connectionAmount;
    let hydrogenAmount = 0;

    if (connectionAmount === -1) {
      return {
        valence,
        hydrogenAmount,
      };
    }

    if (elementGroupNumber === undefined) {
      if (label === AtomLabel.D || label === AtomLabel.T) {
        valence = 1;
        hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
      }
    } else if (elementGroupNumber === 1) {
      if (
        label === AtomLabel.H ||
        label === AtomLabel.Li ||
        label === AtomLabel.Na ||
        label === AtomLabel.K ||
        label === AtomLabel.Rb ||
        label === AtomLabel.Cs ||
        label === AtomLabel.Fr
      ) {
        valence = 1;
        hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
      }
    } else if (elementGroupNumber === 2) {
      if (
        connectionAmount + radicalAmount + absCharge === 2 ||
        connectionAmount + radicalAmount + absCharge === 0
      ) {
        valence = 2;
      } else hydrogenAmount = -1;
    } else if (elementGroupNumber === 3) {
      if (
        label === AtomLabel.B ||
        label === AtomLabel.Al ||
        label === AtomLabel.Ga ||
        label === AtomLabel.In
      ) {
        if (charge === -1) {
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount;
        } else {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (label === AtomLabel.Tl) {
        if (charge === -1) {
          if (radicalAmount + connectionAmount <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount;
          } else {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount;
          }
        } else if (charge === -2) {
          if (radicalAmount + connectionAmount <= 3) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount;
          } else {
            valence = 5;
            hydrogenAmount = 5 - radicalAmount - connectionAmount;
          }
        } else if (radicalAmount + connectionAmount + absCharge <= 1) {
          valence = 1;
          hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
        } else {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
        }
      }
    } else if (elementGroupNumber === 4) {
      if (
        label === AtomLabel.C ||
        label === AtomLabel.Si ||
        label === AtomLabel.Ge
      ) {
        valence = 4;
        hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
      } else if (label === AtomLabel.Sn || label === AtomLabel.Pb) {
        if (connectionAmount + radicalAmount + absCharge <= 2) {
          valence = 2;
          hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
        } else {
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
        }
      }
    } else if (elementGroupNumber === 5) {
      if (label === AtomLabel.N || label === AtomLabel.P) {
        if (charge === 1) {
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount;
        } else if (charge === 2) {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount;
        } else if (
          label === AtomLabel.N ||
          radicalAmount + connectionAmount + absCharge <= 3
        ) {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
        } else {
          // ELEM_P && rad + conn + absCharge > 3
          valence = 5;
          hydrogenAmount = 5 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (
        label === AtomLabel.Bi ||
        label === AtomLabel.Sb ||
        label === AtomLabel.As
      ) {
        if (charge === 1) {
          if (radicalAmount + connectionAmount <= 2 && label !== AtomLabel.As) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount;
          } else {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount;
          }
        } else if (charge === 2) {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount;
        } else if (radicalAmount + connectionAmount <= 3) {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
        } else {
          valence = 5;
          hydrogenAmount = 5 - radicalAmount - connectionAmount - absCharge;
        }
      }
    } else if (elementGroupNumber === 6) {
      if (label === AtomLabel.O) {
        if (charge >= 1) {
          valence = 3;
          hydrogenAmount = 3 - radicalAmount - connectionAmount;
        } else {
          valence = 2;
          hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (
        label === AtomLabel.S ||
        label === AtomLabel.Se ||
        label === AtomLabel.Po
      ) {
        if (charge === 1) {
          if (connectionAmount <= 3) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount;
          } else {
            valence = 5;
            hydrogenAmount = 5 - radicalAmount - connectionAmount;
          }
        } else if (connectionAmount + radicalAmount + absCharge <= 2) {
          valence = 2;
          hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
        } else if (connectionAmount + radicalAmount + absCharge <= 4) {
          // See examples in PubChem
          // [S] : CID 16684216
          // [Se]: CID 5242252
          // [Po]: no example, just following ISIS/Draw logic here
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
        } else {
          // See examples in PubChem
          // [S] : CID 46937044
          // [Se]: CID 59786
          // [Po]: no example, just following ISIS/Draw logic here
          valence = 6;
          hydrogenAmount = 6 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (label === AtomLabel.Te) {
        if (charge === -1) {
          if (connectionAmount <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          }
        } else if (charge === 0 || charge === 2) {
          if (connectionAmount <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          } else if (connectionAmount <= 4) {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
          } else if (charge === 0 && connectionAmount <= 6) {
            valence = 6;
            hydrogenAmount = 6 - radicalAmount - connectionAmount - absCharge;
          } else {
            hydrogenAmount = -1;
          }
        }
      }
    } else if (elementGroupNumber === 7) {
      if (label === AtomLabel.F) {
        valence = 1;
        hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
      } else if (
        label === AtomLabel.Cl ||
        label === AtomLabel.Br ||
        label === AtomLabel.I ||
        label === AtomLabel.At
      ) {
        if (charge === 1) {
          if (connectionAmount <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount;
          } else if (
            connectionAmount === 3 ||
            connectionAmount === 5 ||
            connectionAmount >= 7
          ) {
            hydrogenAmount = -1;
          }
        } else if (charge === 0) {
          if (connectionAmount <= 1) {
            valence = 1;
            hydrogenAmount = 1 - radicalAmount - connectionAmount;
            // While the halogens can have valence 3, they can not have
            // hydrogens in that case.
          } else if (
            connectionAmount === 2 ||
            connectionAmount === 4 ||
            connectionAmount === 6
          ) {
            if (radicalAmount === 1) {
              valence = connectionAmount;
            } else {
              hydrogenAmount = -1; // will throw an error in the end
            }
          } else if (connectionAmount > 7) {
            hydrogenAmount = -1; // will throw an error in the end
          }
        }
      }
    } else if (elementGroupNumber === 8) {
      // Special handling for Platinum (Pt) - accepts valences 2 and 4
      if (label === AtomLabel.Pt) {
        if (connectionAmount + radicalAmount + absCharge <= 2) {
          valence = 2;
          hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
        } else if (connectionAmount + radicalAmount + absCharge <= 4) {
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
        } else {
          hydrogenAmount = -1;
        }
      } else {
        if (connectionAmount + radicalAmount + absCharge === 0) valence = 1;
        else hydrogenAmount = -1;
      }
    }

    return {
      valence,
      hydrogenAmount,
    };
  }
}
