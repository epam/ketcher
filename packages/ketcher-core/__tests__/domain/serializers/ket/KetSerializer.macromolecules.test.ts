import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import { MacromoleculesConverter } from 'application/editor';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { Chem } from 'domain/entities/Chem';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Peptide } from 'domain/entities/Peptide';
import { Bond, SGroup, Struct } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  ALANINE_TEMPLATE_ID,
  AMBIGUOUS_TEMPLATE_ID,
  GLYCINE_TEMPLATE_ID,
  SPACER_TEMPLATE_ID,
  benzeneMolecule,
  createMacromoleculesKet,
  createSuperatomMoleculeKet,
  macromoleculesKet,
} from './fixtures/macromolecules';

// No CoreEditor is created in this file: this is the path taken when KET is
// read or written without a macromolecules editor (micromolecules mode).
const serializer = new KetSerializer();

const monomersOf = (dem: DrawingEntitiesManager): BaseMonomer[] => [
  ...dem.monomers.values(),
];

const findByLabel = (dem: DrawingEntitiesManager, label: string) => {
  const monomer = monomersOf(dem).find(
    (item) => item.monomerItem.label === label,
  );

  expect(monomer).toBeDefined();

  return monomer as BaseMonomer;
};

describe('KetSerializer macromolecules without an editor', () => {
  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
  });

  describe('deserializeToDrawingEntities', () => {
    it('creates the monomers, the ambiguous monomer and the molecule fragment', () => {
      const result =
        serializer.deserializeToDrawingEntities(macromoleculesKet());

      expect(result).toBeDefined();
      const dem = (result as NonNullable<typeof result>).drawingEntitiesManager;
      const monomers = monomersOf(dem);

      expect(monomers).toHaveLength(5);
      expect(monomers.filter((item) => item instanceof Peptide)).toHaveLength(
        2,
      );
      expect(
        monomers.filter((item) => item instanceof AmbiguousMonomer),
      ).toHaveLength(1);
      expect(
        monomers.filter(
          (item) =>
            item instanceof Chem &&
            !item.monomerItem.props.isMicromoleculeFragment,
        ),
      ).toHaveLength(1);
      expect(
        monomers.filter(
          (item) => item.monomerItem.props.isMicromoleculeFragment,
        ),
      ).toHaveLength(1);
      expect(findByLabel(dem, 'A')).toBeInstanceOf(Peptide);
      expect(findByLabel(dem, 'G')).toBeInstanceOf(Peptide);
      expect(findByLabel(dem, 'Sp')).toBeInstanceOf(Chem);
      expect(findByLabel(dem, '%')).toBeInstanceOf(AmbiguousMonomer);
    });

    it('creates the polymer bonds with their attachment points and the hydrogen bond', () => {
      const result =
        serializer.deserializeToDrawingEntities(macromoleculesKet());
      const dem = (result as NonNullable<typeof result>).drawingEntitiesManager;
      const alanine = findByLabel(dem, 'A');
      const glycine = findByLabel(dem, 'G');
      const spacer = findByLabel(dem, 'Sp');
      const ambiguous = findByLabel(dem, '%');
      const bonds = [...dem.polymerBonds.values()];
      const hydrogenBonds = bonds.filter(
        (bond) => bond instanceof HydrogenBond,
      );
      const singleBonds = bonds.filter(
        (bond) => !(bond instanceof HydrogenBond),
      );

      expect(bonds).toHaveLength(4);
      expect(hydrogenBonds).toHaveLength(1);
      expect(singleBonds).toHaveLength(3);

      const attachmentPointsBetween = (
        first: BaseMonomer,
        second: BaseMonomer,
      ) => {
        const bond = singleBonds.find(
          (item) =>
            (item.firstMonomer === first && item.secondMonomer === second) ||
            (item.firstMonomer === second && item.secondMonomer === first),
        );

        expect(bond).toBeDefined();

        return [
          first.getAttachmentPointByBond(bond as NonNullable<typeof bond>),
          second.getAttachmentPointByBond(bond as NonNullable<typeof bond>),
        ];
      };

      expect(attachmentPointsBetween(alanine, glycine)).toEqual(['R2', 'R1']);
      expect(attachmentPointsBetween(glycine, spacer)).toEqual(['R2', 'R1']);
      expect(attachmentPointsBetween(spacer, ambiguous)).toEqual(['R2', 'R1']);

      const [hydrogenBond] = hydrogenBonds;

      expect([
        hydrogenBond.firstMonomer.monomerItem.label,
        hydrogenBond.secondMonomer?.monomerItem.label,
      ]).toEqual(['A', 'Sp']);
    });

    it('connects the monomer R1 to the atom of the molecule', () => {
      const result =
        serializer.deserializeToDrawingEntities(macromoleculesKet());
      const dem = (result as NonNullable<typeof result>).drawingEntitiesManager;
      const alanine = findByLabel(dem, 'A');
      const moleculeFragment = monomersOf(dem).find(
        (item) => item.monomerItem.props.isMicromoleculeFragment,
      ) as BaseMonomer;
      const monomerToAtomBonds = [...dem.monomerToAtomBonds.values()];

      expect(monomerToAtomBonds).toHaveLength(1);
      const [bond] = monomerToAtomBonds;

      expect(bond.monomer).toBe(alanine);
      expect(alanine.getAttachmentPointByBond(bond)).toBe('R1');
      expect(bond.atom.monomer).toBe(moleculeFragment);
      expect(bond.atom.atomIdInMicroMode).toBe(5);
      expect(
        MacromoleculesConverter.findAtomByMicromoleculeAtomId(
          dem,
          5,
          moleculeFragment,
        ),
      ).toBe(bond.atom);
    });

    it('creates the atoms and bonds of the molecule', () => {
      const result =
        serializer.deserializeToDrawingEntities(macromoleculesKet());
      const dem = (result as NonNullable<typeof result>).drawingEntitiesManager;

      expect(dem.atoms.size).toBe(6);
      expect(dem.bonds.size).toBe(6);
    });

    it('returns undefined for content that is not JSON', () => {
      expect(
        serializer.deserializeToDrawingEntities('not a ket'),
      ).toBeUndefined();
    });
  });

  describe('deserialize and deserializeToStruct', () => {
    it.each(['deserialize', 'deserializeToStruct'] as const)(
      '%s returns a Struct with one SUP S-group per non-molecule monomer',
      (method) => {
        const struct = serializer[method](macromoleculesKet());

        expect(struct).toBeInstanceOf(Struct);
        const sgroups = [...struct.sgroups.values()];

        expect(sgroups).toHaveLength(4);
        sgroups.forEach((sgroup) => {
          expect(sgroup.type).toBe(SGroup.TYPES.SUP);
        });
        expect(sgroups.map((sgroup) => sgroup.data.name).sort()).toEqual(
          ['%', 'A', 'G', 'Sp'].sort(),
        );
      },
    );

    it('returns the atoms and bonds of the monomers, the molecule and the connections', () => {
      const struct = serializer.deserialize(macromoleculesKet());

      // A 7 + G 6 + Sp 4 + the ambiguous monomer (atoms of its first option A) 7
      // + benzene 6
      expect(struct.atoms.size).toBe(30);
      // A 6 + G 5 + Sp 3 + the ambiguous monomer 6 + benzene 6, plus three
      // polymer bonds, one hydrogen bond and one monomer-to-molecule bond
      expect(struct.bonds.size).toBe(31);

      const bonds = [...struct.bonds.values()];

      expect(
        bonds.filter((bond) => bond.type === Bond.PATTERN.TYPE.HYDROGEN),
      ).toHaveLength(1);
    });
  });

  describe('serialize', () => {
    const deserializeToManager = (ket: string) =>
      (
        serializer.deserializeToDrawingEntities(ket) as NonNullable<
          ReturnType<typeof serializer.deserializeToDrawingEntities>
        >
      ).drawingEntitiesManager;

    it('serializeMacromolecules writes the monomer nodes, the connections and the molecule endpoint of a monomer-to-molecule bond', () => {
      const source = createMacromoleculesKet();
      const dem = deserializeToManager(JSON.stringify(source));

      const { serializedMacromolecules, micromoleculesStruct } =
        serializer.serializeMacromolecules(new Struct(), dem);

      expect(serializedMacromolecules.root.nodes).toEqual([
        { $ref: 'monomer0' },
        { $ref: 'monomer1' },
        { $ref: 'monomer2' },
        { $ref: 'monomer3' },
      ]);
      expect(serializedMacromolecules.root.connections).toEqual(
        source.root.connections,
      );
      expect(serializedMacromolecules.root.templates).toEqual(
        source.root.templates,
      );
      expect(micromoleculesStruct.atoms.size).toBe(6);
      expect(micromoleculesStruct.bonds.size).toBe(6);
    });

    it('serializeMacromolecules writes the molecule endpoint of a polymer bond to a superatom molecule', () => {
      const source = createSuperatomMoleculeKet();
      const dem = deserializeToManager(JSON.stringify(source));

      expect(dem.polymerBonds.size).toBe(1);
      expect(dem.monomerToAtomBonds.size).toBe(0);

      const { serializedMacromolecules, micromoleculesStruct } =
        serializer.serializeMacromolecules(new Struct(), dem);

      expect(serializedMacromolecules.root.nodes).toEqual([
        { $ref: 'monomer0' },
      ]);
      expect(serializedMacromolecules.root.connections).toEqual([
        {
          connectionType: 'single',
          endpoint1: { monomerId: 'monomer0', attachmentPointId: 'R2' },
          endpoint2: { moleculeId: 'mol0', atomId: '2' },
        },
      ]);
      expect(micromoleculesStruct.atoms.size).toBe(8);
    });

    it('serialize of a micromolecules Struct writes the molecule node', () => {
      const struct = serializer.deserializeMicromolecules(
        JSON.stringify({
          root: { nodes: [{ $ref: 'mol0' }] },
          mol0: benzeneMolecule,
        }),
      );

      const written = JSON.parse(serializer.serialize(struct));

      expect(written.root.nodes).toEqual([{ $ref: 'mol0' }]);
      expect(written.root.connections ?? []).toEqual([]);
      expect(written.mol0.type).toBe('molecule');
      expect(written.mol0.atoms).toHaveLength(6);
      expect(
        written.mol0.atoms.every(
          (atom: { label: string }) => atom.label === 'C',
        ),
      ).toBe(true);
      expect(written.mol0.bonds).toHaveLength(6);
    });

    it('serialize of the deserialized content keeps the nodes, the connections and the templates', () => {
      const source = createMacromoleculesKet();

      const written = JSON.parse(
        serializer.serialize(serializer.deserialize(JSON.stringify(source))),
      );

      expect(written.root.nodes).toEqual(source.root.nodes);
      expect(written.root.connections).toEqual(source.root.connections);
      expect(written.root.templates).toEqual(source.root.templates);

      ['monomer0', 'monomer1', 'monomer2', 'monomer3'].forEach((ref) => {
        expect(written[ref]).toMatchObject({
          type: source[ref].type,
          alias: source[ref].alias,
          templateId: source[ref].templateId,
        });
      });
      [ALANINE_TEMPLATE_ID, GLYCINE_TEMPLATE_ID, SPACER_TEMPLATE_ID].forEach(
        (templateId) => {
          const key = `monomerTemplate-${templateId}`;

          expect(written[key].id).toBe(templateId);
          expect(written[key].class).toBe(source[key].class);
          expect(written[key].atoms).toHaveLength(source[key].atoms.length);
          expect(written[key].bonds).toHaveLength(source[key].bonds.length);
          expect(written[key].attachmentPoints).toHaveLength(
            source[key].attachmentPoints.length,
          );
        },
      );
      expect(
        written[`ambiguousMonomerTemplate-${AMBIGUOUS_TEMPLATE_ID}`],
      ).toMatchObject({
        subtype: 'alternatives',
        options: [
          { templateId: ALANINE_TEMPLATE_ID },
          { templateId: GLYCINE_TEMPLATE_ID },
        ],
      });
      expect(written.mol0.atoms).toHaveLength(6);
      expect(written.mol0.bonds).toHaveLength(6);
    });
  });
});
