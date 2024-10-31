import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Bond } from 'domain/entities/CoreBond';
import { Bond as MicromoleculesBond } from 'domain/entities/bond';
import { BaseRenderer } from 'application/render';
import { AtomLabel, Elements } from 'domain/constants';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';

export class Atom extends DrawingEntity {
  public bonds: Bond[] = [];
  public renderer: AtomRenderer | undefined = undefined;
  constructor(
    position: Vec2,
    public monomer: BaseMonomer,
    public atomIdInMicroMode,
    public label: AtomLabel,
  ) {
    super(position);
  }

  public get center() {
    return this.position;
  }

  public addBond(bond: Bond) {
    this.bonds.push(bond);
  }

  public setRenderer(renderer: AtomRenderer) {
    this.renderer = renderer;
    super.setBaseRenderer(renderer as BaseRenderer);
  }

  private calculateConnections() {
    let connectionsAmount = 0;

    for (let i = 0; i < this.bonds.length; i++) {
      switch (this.bonds[i].type) {
        case MicromoleculesBond.PATTERN.TYPE.SINGLE:
          connectionsAmount += 1;
          break;
        case MicromoleculesBond.PATTERN.TYPE.DOUBLE:
          connectionsAmount += 2;
          break;
        case MicromoleculesBond.PATTERN.TYPE.TRIPLE:
          connectionsAmount += 3;
          break;
        case MicromoleculesBond.PATTERN.TYPE.DATIVE:
          break;
        case MicromoleculesBond.PATTERN.TYPE.HYDROGEN:
          break;
        case MicromoleculesBond.PATTERN.TYPE.AROMATIC:
          if (this.bonds.length === 1) return 0;
          return this.bonds.length;
        default:
          return 0;
      }
    }

    return connectionsAmount;
  }

  private calculateCharge() {
    return 0;
  }

  private calculateRadicalAmount() {
    return 0;
  }

  calculateValence() {
    const label = this.label;
    const element = Elements.get(label);
    const elementGroupNumber = element?.group;
    const connectionAmount = this.calculateConnections();
    const radicalAmount = this.calculateRadicalAmount();
    const absCharge = 0;
    const charge = this.calculateCharge();
    let valence = this.calculateConnections();
    let hydrogenAmount = 0;

    if (elementGroupNumber === undefined) {
      if (label === AtomLabel.D || label === AtomLabel.T) {
        valence = 1;
        hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
      } else {
        // this.implicitH = 0;
        // return true;
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
              hydrogenAmount = 0;
            } else {
              hydrogenAmount = -1; // will throw an error in the end
            }
          } else if (connectionAmount > 7) {
            hydrogenAmount = -1; // will throw an error in the end
          }
        }
      }
    } else if (elementGroupNumber === 8) {
      if (connectionAmount + radicalAmount + absCharge === 0) valence = 1;
      else hydrogenAmount = -1;
    }
    // if (Atom.isHeteroAtom(label) && this.implicitHCount !== null) {
    //   hydrogenAmount = this.implicitHCount;
    // }
    // this.valence = valence;
    // this.implicitH = hydrogenAmount;
    // if (this.implicitH < 0) {
    //   this.valence = connectionAmount;
    //   this.implicitH = 0;
    //   this.badConn = true;
    //   return false;
    // }

    return {
      valence,
      hydrogenAmount,
    };
  }
}
