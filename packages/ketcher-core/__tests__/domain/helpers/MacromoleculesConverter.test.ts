import { MacromoleculesConverter } from 'domain/helpers/MacromoleculesConverter';
import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { AttachmentPointName } from 'domain/types';
import { MACROMOLECULES_BOND_TYPES } from 'domain/constants/bonds';
import { Struct, Text, Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { peptideMonomerItem } from '../../mock-data';
import {
  deserializeToManager,
  findMonomerByLabel,
  macromoleculesKet,
} from '../serializers/ket/fixtures/macromolecules';

const NO_ATOM_MESSAGE =
  'There is no atom for provided attachment point. Bond between monomers was not created.';

// The macromolecules content of ../serializers/ket/fixtures/macromolecules.ts:
// peptides A and G, the CHEM Sp, an ambiguous monomer, a benzene ring that is
// a micromolecule fragment, three polymer bonds, one hydrogen bond and one
// monomer-to-molecule bond.
const createManager = () =>
  deserializeToManager(new KetSerializer(), macromoleculesKet());

const findRing = (dem: DrawingEntitiesManager) =>
  [...dem.monomers.values()].find(
    (monomer) => monomer.monomerItem.props.isMicromoleculeFragment,
  ) as BaseMonomer;

const addReactionEntities = (dem: DrawingEntitiesManager) => {
  dem.addRxnArrow(RxnArrowMode.OpenAngle, [new Vec2(0, 0), new Vec2(2, 0)]);
  dem.addRxnPlus(new Vec2(5, 5));
  dem.addMultitailArrow({
    type: 'multi-tailed-arrow',
    center: new Vec2(),
    data: {
      head: { position: new Vec2(13, 1.5) },
      spine: { pos: [new Vec2(10, 3), new Vec2(10, 0)] },
      tails: { pos: [new Vec2(7, 3), new Vec2(7, 0)] },
      zOrder: 0,
    },
  });
};

describe('MacromoleculesConverter', () => {
  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
  });

  describe('convertDrawingEntitiesToStruct', () => {
    it('converts monomers, bonds, arrows and pluses into the struct', () => {
      const dem = createManager();

      addReactionEntities(dem);

      const { struct, monomerToAtomIdMap, conversionErrorMessage } =
        MacromoleculesConverter.convertDrawingEntitiesToStruct(
          dem,
          new Struct(),
        );

      expect(conversionErrorMessage).toBe('');
      // A 7 + G 6 + Sp 4 + ambiguous (atoms of its first option A) 7 + benzene 6
      expect(struct.atoms.size).toBe(30);
      // 6 + 5 + 3 + 6 + 6 inside the monomers and the ring, then three polymer
      // bonds, one hydrogen bond and one monomer-to-molecule bond
      expect(struct.bonds.size).toBe(31);
      expect(struct.sgroups.size).toBe(4);
      expect(struct.rxnArrows.size).toBe(1);
      expect(struct.rxnPluses.size).toBe(1);
      expect(struct.multitailArrows.size).toBe(1);
      expect(monomerToAtomIdMap.size).toBe(dem.monomers.size);
      dem.monomers.forEach((monomer) => {
        expect(monomerToAtomIdMap.has(monomer)).toBe(true);
      });
    });

    it('reports a hydrogen bond between monomers that have no atoms', () => {
      const dem = new DrawingEntitiesManager();
      dem.addMonomer(peptideMonomerItem, new Vec2(0, 0));
      dem.addMonomer(peptideMonomerItem, new Vec2(5, 0));
      const [firstAdded, secondAdded] = [...dem.monomers.values()];

      dem.createPolymerBond(
        firstAdded,
        secondAdded,
        AttachmentPointName.HYDROGEN,
        AttachmentPointName.HYDROGEN,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      );

      const { struct, conversionErrorMessage } =
        MacromoleculesConverter.convertDrawingEntitiesToStruct(
          dem,
          new Struct(),
        );

      expect(conversionErrorMessage).toBe(NO_ATOM_MESSAGE);
      expect(struct.bonds.size).toBe(0);
    });

    describe('without shouldPreserveSource', () => {
      it('puts the manager monomers into the S-groups and clears the hidden entities', () => {
        const dem = createManager();
        const hiddenStruct = new Struct();

        hiddenStruct.texts.add(
          new Text({ content: '', position: new Vec2(), pos: [] }),
        );
        dem.setMicromoleculesHiddenEntities(hiddenStruct);

        const { struct } =
          MacromoleculesConverter.convertDrawingEntitiesToStruct(
            dem,
            new Struct(),
          );

        const sgroupMonomers = [...struct.sgroups.values()].map(
          (sgroup) => (sgroup as MonomerMicromolecule).monomer,
        );

        expect(sgroupMonomers).toHaveLength(4);
        sgroupMonomers.forEach((monomer) => {
          expect([...dem.monomers.values()]).toContain(monomer);
        });
        expect(struct.texts.size).toBe(1);
        expect(dem.micromoleculesHiddenEntities.texts.size).toBe(0);
      });
    });

    describe('with shouldPreserveSource', () => {
      const convertPreserving = (dem: DrawingEntitiesManager) =>
        MacromoleculesConverter.convertDrawingEntitiesToStruct(
          dem,
          new Struct(),
          undefined,
          true,
        );

      it('puts clones of the monomers into the S-groups', () => {
        const dem = createManager();
        const { struct, conversionErrorMessage } = convertPreserving(dem);

        expect(conversionErrorMessage).toBe('');
        expect(struct.atoms.size).toBe(30);
        expect(struct.bonds.size).toBe(31);

        const sgroupMonomers = [...struct.sgroups.values()].map(
          (sgroup) => (sgroup as MonomerMicromolecule).monomer,
        );

        expect(sgroupMonomers).toHaveLength(4);
        sgroupMonomers.forEach((monomer) => {
          expect([...dem.monomers.values()]).not.toContain(monomer);
        });

        const labels = sgroupMonomers.map(
          (monomer) => monomer.monomerItem.label,
        );

        expect(labels.sort()).toEqual(['%', 'A', 'G', 'Sp']);

        const clone = (label: string) =>
          sgroupMonomers.find(
            (monomer) => monomer.monomerItem.label === label,
          ) as BaseMonomer;

        expect(clone('A')).toBeInstanceOf(Peptide);
        expect(clone('G')).toBeInstanceOf(Peptide);
        expect(clone('Sp')).toBeInstanceOf(Chem);
        // Clones keep position and own a copy of the monomer struct.
        expect(clone('A').position).toEqual(
          findMonomerByLabel(dem, 'A').position,
        );
        expect(clone('A').monomerItem.struct).not.toBe(
          findMonomerByLabel(dem, 'A').monomerItem.struct,
        );
        expect(clone('A').monomerItem.struct.atoms.size).toBe(
          findMonomerByLabel(dem, 'A').monomerItem.struct.atoms.size,
        );
      });

      it('rebuilds an ambiguous monomer as an AmbiguousMonomer', () => {
        const dem = createManager();
        const original = findMonomerByLabel(dem, '%');
        const { struct } = convertPreserving(dem);

        const ambiguousClone = [...struct.sgroups.values()]
          .map((sgroup) => (sgroup as MonomerMicromolecule).monomer)
          .find((monomer) => monomer.monomerItem.label === '%');

        expect(original).toBeInstanceOf(AmbiguousMonomer);
        expect(ambiguousClone).toBeInstanceOf(AmbiguousMonomer);
        expect(ambiguousClone).not.toBe(original);
        expect(
          (ambiguousClone as AmbiguousMonomer).variantMonomerItem.options,
        ).toEqual((original as AmbiguousMonomer).variantMonomerItem.options);
      });

      it('keeps the hidden entities of the manager', () => {
        const dem = createManager();
        const hiddenStruct = new Struct();

        hiddenStruct.texts.add(
          new Text({ content: '', position: new Vec2(), pos: [] }),
        );
        dem.setMicromoleculesHiddenEntities(hiddenStruct);

        const { struct } = convertPreserving(dem);

        expect(struct.texts.size).toBe(1);
        expect(dem.micromoleculesHiddenEntities.texts.size).toBe(1);
      });
    });
  });

  describe('findAtomByMicromoleculeAtomId', () => {
    it('returns the atom with that id inside the micromolecule monomer', () => {
      const dem = createManager();
      const ring = findRing(dem);

      const atom = MacromoleculesConverter.findAtomByMicromoleculeAtomId(
        dem,
        5,
        ring,
      );

      expect(atom?.atomIdInMicroMode).toBe(5);
      expect(atom?.monomer).toBe(ring);
      expect(
        MacromoleculesConverter.findAtomByMicromoleculeAtomId(dem, 5),
      ).toBe(atom);
    });

    it('returns undefined for an unknown atom id or another monomer', () => {
      const dem = createManager();
      const ring = findRing(dem);

      expect(
        MacromoleculesConverter.findAtomByMicromoleculeAtomId(dem, 99, ring),
      ).toBeUndefined();
      expect(
        MacromoleculesConverter.findAtomByMicromoleculeAtomId(
          dem,
          5,
          findMonomerByLabel(dem, 'A'),
        ),
      ).toBeUndefined();
    });
  });

  describe('findAttachmentPointAtom', () => {
    it('returns the attachment atom and the attachment point number of a monomer bond end', () => {
      const dem = createManager();
      const { monomerToAtomIdMap } =
        MacromoleculesConverter.convertDrawingEntitiesToStruct(
          dem,
          new Struct(),
        );
      const glycine = findMonomerByLabel(dem, 'G');
      const alanine = findMonomerByLabel(dem, 'A');
      const bond = glycine.attachmentPointsToBonds.R1 as NonNullable<
        typeof glycine.attachmentPointsToBonds.R1
      >;

      expect(alanine.attachmentPointsToBonds.R2).toBe(bond);

      const result = MacromoleculesConverter.findAttachmentPointAtom(
        bond,
        glycine,
        monomerToAtomIdMap,
      );

      // Glycine R1 is attached at atom 0 of its template (the N).
      expect(result.attachmentAtomId).toBe(0);
      expect(result.attachmentPointNumber).toBe(1);
      expect(result.globalAttachmentAtomId).toBe(
        monomerToAtomIdMap.get(glycine)?.get(0),
      );
    });

    it('returns no atom for a bond that is not attached to the monomer', () => {
      const dem = createManager();
      const { monomerToAtomIdMap } =
        MacromoleculesConverter.convertDrawingEntitiesToStruct(
          dem,
          new Struct(),
        );
      const glycine = findMonomerByLabel(dem, 'G');
      const spacerBond = findMonomerByLabel(dem, 'Sp').attachmentPointsToBonds
        .R2 as NonNullable<BaseMonomer['attachmentPointsToBonds']['R2']>;

      expect(
        MacromoleculesConverter.findAttachmentPointAtom(
          spacerBond,
          glycine,
          monomerToAtomIdMap,
        ),
      ).toEqual({
        attachmentAtomId: undefined,
        attachmentPointNumber: undefined,
      });
    });
  });
});
