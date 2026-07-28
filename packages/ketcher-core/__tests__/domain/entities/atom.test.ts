import { Atom, AttachmentPoints, radicalElectrons } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { Atom as CoreAtom } from 'domain/entities/CoreAtom';
import { Bond as CoreBond, BondType } from 'domain/entities/CoreBond';
import { AtomLabel } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';

describe('radicalElectrons', () => {
  it('should return 1 if passed radical is Douplet (value = 2)', () => {
    expect(radicalElectrons(2)).toBe(1);
  });

  it('should return 2 if passed radical is singlet (value = 1) or triplet (value = 3)', () => {
    expect(radicalElectrons(1)).toBe(2);
    expect(radicalElectrons(3)).toBe(2);
  });

  it.each([4, 'test', {}, null, undefined])(
    'should return 0 if passed radical is different from 1 to 3 value range',
    (radical) => {
      expect(radicalElectrons(radical)).toBe(0);
    },
  );
});

describe('CoreAtom dative bond valence', () => {
  it('uses dative direction to calculate implicit hydrogens', () => {
    const monomer = {} as BaseMonomer;
    const chlorine = new CoreAtom(new Vec2(), monomer, 0, AtomLabel.Cl, {
      charge: 3,
    });
    const covalentNeighbor = new CoreAtom(new Vec2(), monomer, 1, AtomLabel.C);
    const dativeNeighbor = new CoreAtom(new Vec2(), monomer, 2, AtomLabel.C);
    chlorine.addBond(
      new CoreBond(chlorine, covalentNeighbor, 0, BondType.Single),
    );
    chlorine.addBond(
      new CoreBond(chlorine, dativeNeighbor, 1, BondType.Dative),
    );

    expect(chlorine.calculateValence().hydrogenAmount).toBe(1);
    expect(chlorine.hasBadValence).toBe(false);
  });
});

describe('Atom', () => {
  const hydrogenParams = {
    aam: 0,
    alias: null,
    atomList: null,
    attachmentPoints: null,
    badConn: false,
    charge: 0,
    exactChangeFlag: 0,
    explicitValence: -1,
    fragment: 0,
    hCount: 0,
    implicitH: 1,
    invRet: 0,
    isotope: 0,
    label: 'H',
    neighbors: [],
    pseudo: '',
    radical: 0,
    rglabel: null,
    ringBondCount: 0,
    rxnFragmentType: -1,
    sgs: new Set(),
    stereoLabel: null,
    stereoParity: 0,
    substitutionCount: 0,
    unsaturatedAtom: 0,
    valence: 1,
  };

  describe('Atom constructor', () => {
    it('should create getter function "pseudo" and able to call it', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.pseudo).toBe('');
    });
  });

  describe('dative bond valence', () => {
    interface StructureOptions {
      label: string;
      charge: number;
      radical: number;
      covalentBondTypes: number[];
      donorCount: number;
      acceptorCount: number;
    }

    const createStructure = ({
      label,
      charge,
      radical,
      covalentBondTypes,
      donorCount,
      acceptorCount,
    }: StructureOptions) => {
      const struct = new Struct();
      const atomId = struct.atoms.add(
        new Atom({ label, charge, radical, pp: new Vec2(0, 0) }),
      );
      let positionCounter = 0;

      const addBond = (type: number, isDonor: boolean) => {
        const otherAtomId = struct.atoms.add(
          new Atom({
            label: 'C',
            pp: new Vec2(++positionCounter, positionCounter % 2),
          }),
        );
        struct.bonds.add(
          new Bond({
            type,
            begin: isDonor ? atomId : otherAtomId,
            end: isDonor ? otherAtomId : atomId,
          }),
        );
      };

      covalentBondTypes.forEach((type) => addBond(type, true));
      for (let index = 0; index < donorCount; index++) {
        addBond(Bond.PATTERN.TYPE.DATIVE, true);
      }
      for (let index = 0; index < acceptorCount; index++) {
        addBond(Bond.PATTERN.TYPE.DATIVE, false);
      }
      struct.initHalfBonds();
      struct.initNeighbors();
      const atom = struct.atoms.get(atomId);
      expect(atom).toBeDefined();

      return { atom: atom as Atom, atomId, struct };
    };

    it.each([
      {
        label: 'Ni',
        charge: 2,
        radical: 0,
        bonds: [],
        donors: 4,
        acceptors: 0,
        role: 'donor',
      },
      {
        label: 'Ni',
        charge: 2,
        radical: 0,
        bonds: [],
        donors: 0,
        acceptors: 5,
        role: 'acceptor',
      },
      {
        label: 'Pr',
        charge: -1,
        radical: 1,
        bonds: [1, 1, 1, 1],
        donors: 0,
        acceptors: 7,
        role: 'acceptor',
      },
    ])(
      'allows $label (charge $charge, radical $radical) as a $role',
      ({ label, charge, radical, bonds, donors, acceptors }) => {
        const { atom, atomId, struct } = createStructure({
          label,
          charge,
          radical,
          covalentBondTypes: bonds,
          donorCount: donors,
          acceptorCount: acceptors,
        });

        struct.calcImplicitHydrogen(atomId);

        expect(atom.badConn).toBe(false);
        expect(atom.implicitH).toBe(0);
      },
    );

    it('marks an atom with too many donor dative bonds and hides hydrogens', () => {
      const { atom, atomId, struct } = createStructure({
        label: 'N',
        charge: 0,
        radical: 0,
        covalentBondTypes: [1, 1, 1],
        donorCount: 2,
        acceptorCount: 0,
      });

      struct.calcImplicitHydrogen(atomId);

      expect(atom.badConn).toBe(true);
      expect(atom.implicitH).toBe(0);
    });

    it.each([
      [5, 0],
      [0, 6],
    ])(
      'enforces nickel dative capacity (%i donor, %i acceptor)',
      (donors, acceptors) => {
        const { atom, atomId, struct } = createStructure({
          label: 'Ni',
          charge: 2,
          radical: 0,
          covalentBondTypes: [],
          donorCount: donors,
          acceptorCount: acceptors,
        });

        struct.calcImplicitHydrogen(atomId);

        expect(atom.badConn).toBe(true);
        expect(atom.implicitH).toBe(0);
      },
    );

    it.each([
      [1, 0],
      [0, 1],
    ])(
      'calculates implicit hydrogens for chlorine (%i donor, %i acceptor)',
      (donors, acceptors) => {
        const { atom, atomId, struct } = createStructure({
          label: 'Cl',
          charge: 3,
          radical: 0,
          covalentBondTypes: [1],
          donorCount: donors,
          acceptorCount: acceptors,
        });

        struct.calcImplicitHydrogen(atomId);

        expect(atom.badConn).toBe(false);
        expect(atom.implicitH).toBe(1);
      },
    );

    it('cancels donor and acceptor dative bonds on the same atom', () => {
      const { atom, atomId, struct } = createStructure({
        label: 'N',
        charge: 0,
        radical: 0,
        covalentBondTypes: [1, 1, 1],
        donorCount: 1,
        acceptorCount: 1,
      });

      struct.calcImplicitHydrogen(atomId);

      expect(atom.badConn).toBe(false);
      expect(atom.implicitH).toBe(0);
    });

    it('rounds up aromatic bond orders when calculating dative capacity', () => {
      const { atom, atomId, struct } = createStructure({
        label: 'N',
        charge: 0,
        radical: 0,
        covalentBondTypes: [Bond.PATTERN.TYPE.AROMATIC],
        donorCount: 2,
        acceptorCount: 0,
      });

      struct.calcImplicitHydrogen(atomId);

      expect(atom.badConn).toBe(true);
      expect(atom.implicitH).toBe(0);
    });
  });

  describe('pseudo getter', () => {
    it('should return empty string if value is real label of element', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.pseudo).toBe('');
    });

    it('should return empty string if passed value is R#', () => {
      const params = {
        ...hydrogenParams,
        label: 'R#',
      };
      const atom = new Atom(params);
      expect(atom.pseudo).toBe('');
    });

    it('should return empty string if passed value is L', () => {
      const params = {
        ...hydrogenParams,
        label: 'L',
      };
      const atom = new Atom(params);
      expect(atom.pseudo).toBe('');
    });

    it('should return empty string if passed value is L#', () => {
      const params = {
        ...hydrogenParams,
        label: 'L#',
      };
      const atom = new Atom(params);
      expect(atom.pseudo).toBe('');
    });

    it('should return passed label if its not real label and not L, L#, R#', () => {
      const params = {
        ...hydrogenParams,
        label: 'pseudo',
      };
      const atom = new Atom(params);
      expect(atom.pseudo).toBe('pseudo');
    });
  });

  describe('attrGetDefault static function', () => {
    it('should return default attr if value is in attrsList', () => {
      expect(Atom.attrGetDefault('label')).toBe('C');
    });
  });

  describe('clone', () => {
    it('should clone element', () => {
      const fidMap = new Map();
      const atom = new Atom(hydrogenParams);
      const copiedAtom = atom.clone(fidMap);
      expect(copiedAtom).not.toBe(atom);
    });

    it('should replace fragment from params to fragment from fidMap', () => {
      const fidMap = new Map();
      fidMap.set(0, 10);
      const atom = new Atom(hydrogenParams);
      const copiedAtom = atom.clone(fidMap);
      expect(copiedAtom.fragment).not.toBe(atom.fragment);
      expect(copiedAtom.fragment).toBe(10);
    });
  });

  describe('isQuery', () => {
    it('should return true if atom list is not null', () => {
      const hydrogenParamsWithAtomList = {
        ...hydrogenParams,
        atomList: [],
      };
      const atom = new Atom(hydrogenParamsWithAtomList as any);
      expect(atom.isQuery()).toBe(true);
    });

    it('should return true if label is A', () => {
      const paramsWithALabel = {
        ...hydrogenParams,
        label: 'A',
      };
      const atom = new Atom(paramsWithALabel);
      expect(atom.isQuery()).toBe(true);
    });

    it('should return falsy value if params have attachmentPoints prop', () => {
      const paramsWithAttachmentPoints = {
        ...hydrogenParams,
        attachmentPoints: AttachmentPoints.FirstSideOnly,
      };
      const atom = new Atom(paramsWithAttachmentPoints);
      expect(atom.isQuery()).toBeFalsy();
    });

    it('should return truthy value if params have hCount prop', () => {
      const paramsWithHCount = {
        ...hydrogenParams,
        hCount: 10,
      };
      const atom = new Atom(paramsWithHCount);
      expect(atom.isQuery()).toBeTruthy();
    });

    it('should return falsy value if it is default atom', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.isQuery()).toBeFalsy();
    });
  });

  describe('pureHydrogen', () => {
    it('should return true if label is "H" and isotope = 0', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.pureHydrogen()).toBe(true);
    });

    it('should return false if label is "H" and isotope != 0', () => {
      const hydrogenParamsWithIsotope = {
        ...hydrogenParams,
        isotope: 1,
      };
      const atom = new Atom(hydrogenParamsWithIsotope);
      expect(atom.pureHydrogen()).toBe(false);
    });

    it('should return false if label is not "H" and isotope = 0', () => {
      const atomParams = {
        ...hydrogenParams,
        label: 'C',
      };
      const atom = new Atom(atomParams);
      expect(atom.pureHydrogen()).toBe(false);
    });
  });

  describe('isPlainCarbon', () => {
    const plainCarbonParams = {
      ...hydrogenParams,
      label: 'C',
      charge: null,
      isotope: null,
    };

    it('should return true if it is plain carbon', () => {
      const atom = new Atom(plainCarbonParams);
      expect(atom.isPlainCarbon()).toBe(true);
    });

    it('should return false if it is not carbon', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and isotope != null', () => {
      const carbonWithIsotopeParam = {
        ...plainCarbonParams,
        isotope: 1,
      };
      const atom = new Atom(carbonWithIsotopeParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and radical != 0', () => {
      const carbonWithRadicalParam = {
        ...plainCarbonParams,
        radical: 1,
      };
      const atom = new Atom(carbonWithRadicalParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and charge != null', () => {
      const carbonWithChargeParam = {
        ...plainCarbonParams,
        charge: 1,
      };
      const atom = new Atom(carbonWithChargeParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and explicit valence >= 0', () => {
      const noExpValenceParams = {
        ...plainCarbonParams,
        explicitValence: 0,
      };
      const atom = new Atom(noExpValenceParams);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and ringBondCount > 0', () => {
      const carbonWithRingBondCountParam = {
        ...plainCarbonParams,
        ringBondCount: 1,
      };
      const atom = new Atom(carbonWithRingBondCountParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and substitutionCount > 0', () => {
      const carbonWithSubstitutionCountParam = {
        ...plainCarbonParams,
        substitutionCount: 1,
      };
      const atom = new Atom(carbonWithSubstitutionCountParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and unsaturatedAtom > 0', () => {
      const carbonWithUnsaturatedAtomParam = {
        ...plainCarbonParams,
        unsaturatedAtom: 1,
      };
      const atom = new Atom(carbonWithUnsaturatedAtomParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and hCount > 0', () => {
      const carbonWithHCountParam = {
        ...plainCarbonParams,
        hCount: 1,
      };
      const atom = new Atom(carbonWithHCountParam);
      expect(atom.isPlainCarbon()).toBe(false);
    });

    it('should return false if it  is carbon and it has atomList', () => {
      const carbonWithAtomListParam = {
        ...plainCarbonParams,
        atomList: [],
      };
      const atom = new Atom(carbonWithAtomListParam as any);
      expect(atom.isPlainCarbon()).toBe(false);
    });
  });

  describe('isPseudo', () => {
    it('should return false if atom has atomList', () => {
      const paramsWithAtomList = {
        ...hydrogenParams,
        atomList: [],
      };

      const atom = new Atom(paramsWithAtomList as any);
      expect(atom.isPseudo()).toBe(false);
    });

    it('should return false if atom has rgLabel', () => {
      const paramsWithRgLabel = {
        ...hydrogenParams,
        rglabel: 'test',
      };

      const atom = new Atom(paramsWithRgLabel);
      expect(atom.isPseudo()).toBe(false);
    });

    it('should return false if atom has not pseudo label', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.isPseudo()).toBe(false);
    });

    it('should return true if atom has pseudo label and does not have atomList and rglabel', () => {
      const paramsWithRgLabel = {
        ...hydrogenParams,
        label: 'pseudo',
      };

      const atom = new Atom(paramsWithRgLabel);
      expect(atom.isPseudo()).toBe(true);
    });
  });

  describe('hasRxnProps', () => {
    it('should return true if atom has invRet > 0', () => {
      const paramsWithInvRet = {
        ...hydrogenParams,
        invRet: 1,
      };

      const atom = new Atom(paramsWithInvRet);
      expect(atom.hasRxnProps()).toBe(true);
    });

    it('should return true if atom has exactChangeFlag > 0', () => {
      const paramsWithexactChangeFlag = {
        ...hydrogenParams,
        exactChangeFlag: 1,
      };

      const atom = new Atom(paramsWithexactChangeFlag);
      expect(atom.hasRxnProps()).toBe(true);
    });

    it('should return true if atom has attachmentPoints > 0', () => {
      const paramsWithAttachmentPoints = {
        ...hydrogenParams,
        attachmentPoints: AttachmentPoints.FirstSideOnly,
      };

      const atom = new Atom(paramsWithAttachmentPoints);
      expect(atom.hasRxnProps()).toBe(true);
    });

    it('should return true if atom has aam > 0', () => {
      const paramsWithAam = {
        ...hydrogenParams,
        aam: 1,
      };

      const atom = new Atom(paramsWithAam);
      expect(atom.hasRxnProps()).toBe(true);
    });

    it('should return false for default hydrogen', () => {
      const atom = new Atom(hydrogenParams);
      expect(atom.hasRxnProps()).toBe(false);
    });
  });

  describe('calcValence', () => {
    it('should return true and set inplicitH = 0 if atom is query', () => {
      const queryAtomParams = {
        ...hydrogenParams,
        attachmentPoints: AttachmentPoints.FirstSideOnly,
        implicitH: 10,
      };
      const atom = new Atom(queryAtomParams);
      expect(atom.implicitH).toBe(10);
      expect(atom.calcValence(0)).toBe(true);
      expect(atom.implicitH).toBe(0);
    });

    it('should return true and set inplicitH = 0 if atom label is not from PT', () => {
      const pseudoAtomParams = {
        ...hydrogenParams,
        label: 'test',
        implicitH: 5,
      };

      const pseudoAtom = new Atom(pseudoAtomParams);
      expect(pseudoAtom.implicitH).toBe(5);
      expect(pseudoAtom.calcValence(5)).toBe(true);
      expect(pseudoAtom.implicitH).toBe(0);
    });

    it('should set valence = 1 for group 1 elements', () => {
      const LiParams = {
        ...hydrogenParams,
        label: 'Li',
      };

      const hydrogen = new Atom(hydrogenParams);
      const litium = new Atom(LiParams);

      expect(hydrogen.calcValence(0)).toBe(true);
      expect(hydrogen.valence).toBe(1);
      expect(litium.calcValence(0)).toBe(true);
      expect(litium.valence).toBe(1);
    });

    it('should allow nitrogen valence 5 with five connections', () => {
      const nitrogenParams = {
        ...hydrogenParams,
        label: 'N',
        implicitH: 0,
      };

      const nitrogen = new Atom(nitrogenParams);
      expect(nitrogen.calcValence(5)).toBe(true);
      expect(nitrogen.valence).toBe(5);
      expect(nitrogen.implicitH).toBe(0);
      expect(nitrogen.badConn).toBe(false);
    });

    it('should use implicit H count query property for carbon', () => {
      const carbon = new Atom({
        ...hydrogenParams,
        label: 'C',
        charge: null,
        implicitHCount: 8,
        isotope: null,
      });

      expect(carbon.calcValence(0)).toBe(true);
      expect(carbon.valence).toBe(4);
      expect(carbon.implicitH).toBe(8);
      expect(carbon.badConn).toBe(false);
    });

    it('should continue using implicit H count query property for heteroatoms', () => {
      const nitrogen = new Atom({
        ...hydrogenParams,
        label: 'N',
        charge: null,
        implicitHCount: 4,
        isotope: null,
      });

      expect(nitrogen.calcValence(0)).toBe(true);
      expect(nitrogen.valence).toBe(3);
      expect(nitrogen.implicitH).toBe(4);
      expect(nitrogen.badConn).toBe(false);
    });

    it('should set valence = 2 for Platinum with 2 or fewer connections', () => {
      const platinumParams = {
        ...hydrogenParams,
        label: 'Pt',
        charge: null,
      };

      const platinum = new Atom(platinumParams);
      expect(platinum.calcValence(2)).toBe(true);
      expect(platinum.valence).toBe(2);
      expect(platinum.implicitH).toBe(0);
      expect(platinum.badConn).toBe(false);
    });

    it('should set valence = 4 for Platinum with 3-4 connections', () => {
      const platinumParams = {
        ...hydrogenParams,
        label: 'Pt',
        charge: null,
      };

      const platinum = new Atom(platinumParams);
      expect(platinum.calcValence(4)).toBe(true);
      expect(platinum.valence).toBe(4);
      expect(platinum.implicitH).toBe(0);
      expect(platinum.badConn).toBe(false);
    });

    it('should return false for Platinum with more than 4 connections', () => {
      const platinumParams = {
        ...hydrogenParams,
        label: 'Pt',
        charge: null,
      };

      const platinum = new Atom(platinumParams);
      expect(platinum.calcValence(5)).toBe(false);
      expect(platinum.badConn).toBe(true);
    });

    it('should handle Platinum with charge correctly', () => {
      const platinumWithChargeParams = {
        ...hydrogenParams,
        label: 'Pt',
        charge: 2,
      };

      const platinum = new Atom(platinumWithChargeParams);
      // With charge +2 and 2 connections: connectionCount + radicalCount + absCharge = 2 + 0 + 2 = 4
      // This should use valence 4
      expect(platinum.calcValence(2)).toBe(true);
      expect(platinum.valence).toBe(4);
      expect(platinum.implicitH).toBe(0);
      expect(platinum.badConn).toBe(false);
    });

    // TODO: Add other test cases for calcValence function
  });

  describe('calcValenceMinusHyd', () => {
    it("should return 0 if Elements doesn't contain label", () => {
      const paramsWithALabel = {
        ...hydrogenParams,
        label: 'test',
      };

      const atom = new Atom(paramsWithALabel);

      expect(atom.calcValenceMinusHyd(3)).toBe(0);
    });

    it("should return rad + conn <= 4 if label = B charge = doesn't contain label", () => {
      const paramsWithALabel = {
        ...hydrogenParams,
        label: 'B',
        charge: -1,
      };

      const atom = new Atom(paramsWithALabel);

      expect(atom.calcValenceMinusHyd(3)).toBeLessThanOrEqual(4);
    });

    it.each(['B', 'Al', 'Ga', 'In'])(
      'should return number <= 4 if group = 3 label = %p, charge = -1',
      (label) => {
        const paramsWithALabel = {
          ...hydrogenParams,
          label,
          charge: -1,
        };

        const atom = new Atom(paramsWithALabel);

        expect(atom.calcValenceMinusHyd(3)).toBeLessThanOrEqual(4);
      },
    );

    it.each([
      ['N', 1, 2],
      ['P', 1, 2],
      ['Sb', 1, 2],
      ['Bi', 1, 2],
      ['As', 1, 2],
      ['N', 2, 2],
      ['P', 2, 2],
      ['Sb', 2, 2],
      ['Bi', 2, 2],
      ['As', 2, 2],
      ['O', 1, 2],
      ['O', 2, 2],
      ['O', 3, 2],
      ['S', 1, 2],
      ['Se', 1, 2],
      ['Po', 1, 2],
      ['Cl', 1, 2],
      ['Br', 1, 2],
      ['I', 1, 2],
      ['At', 1, 2],
      ['Og', 1, 3],
      ['Ts', 1, 3],
      ['Lv', 1, 3],
    ])(
      'should for label %p and charge %p return %p',
      (label, charge, expected) => {
        const paramsWithALabel = {
          ...hydrogenParams,
          label,
          charge,
          radical: 0,
        };

        const atom = new Atom(paramsWithALabel);

        expect(atom.calcValenceMinusHyd(2)).toBe(expected);
      },
    );
  });
});
