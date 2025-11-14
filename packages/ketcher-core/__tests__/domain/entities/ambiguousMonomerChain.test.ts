import { ChainsCollection } from '../../../src/domain/entities/monomer-chains/ChainsCollection';
import { AmbiguousMonomer } from '../../../src/domain/entities/AmbiguousMonomer';
import { Chem } from '../../../src/domain/entities/Chem';
import { PolymerBond } from '../../../src/domain/entities/PolymerBond';
import { Vec2 } from '../../../src/domain/entities/vec2';
import { KetAmbiguousMonomerTemplateSubType } from '../../../src/application/formatters';
import { Struct } from '../../../src/domain/entities/struct';
import { AttachmentPointName } from '../../../src/domain/types';

describe('Ambiguous Monomer Chain Creation', () => {
  test('consecutive ambiguous CHEM monomers should be in the same chain', () => {
    // Create mock CHEM monomers for the ambiguous alternatives
    const chem1 = new Chem(
      {
        label: 'sDBL',
        props: {
          MonomerNaturalAnalogCode: '',
          MonomerName: 'sDBL',
          Name: 'sDBL',
        },
        attachmentPoints: [
          { label: 'R1', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
          { label: 'R2', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
        ],
        struct: new Struct(),
      },
      new Vec2(0, 0),
    );

    const chem2 = new Chem(
      {
        label: '4aPEGMal',
        props: {
          MonomerNaturalAnalogCode: '',
          MonomerName: '4aPEGMal',
          Name: '4aPEGMal',
        },
        attachmentPoints: [
          { label: 'R1', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
          { label: 'R2', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
        ],
        struct: new Struct(),
      },
      new Vec2(1, 0),
    );

    // Create ambiguous monomers
    const ambiguous1 = new AmbiguousMonomer(
      {
        id: 'amb1',
        monomers: [chem1],
        label: '@',
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        options: [],
        isAmbiguous: true,
      },
      new Vec2(0, 0),
    );

    const ambiguous2 = new AmbiguousMonomer(
      {
        id: 'amb2',
        monomers: [chem2],
        label: '@',
        subtype: KetAmbiguousMonomerTemplateSubType.MIXTURE,
        options: [],
        isAmbiguous: true,
      },
      new Vec2(1, 0),
    );

    const ambiguous3 = new AmbiguousMonomer(
      {
        id: 'amb3',
        monomers: [chem1],
        label: '@',
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        options: [],
        isAmbiguous: true,
      },
      new Vec2(2, 0),
    );

    const ambiguous4 = new AmbiguousMonomer(
      {
        id: 'amb4',
        monomers: [chem2],
        label: '@',
        subtype: KetAmbiguousMonomerTemplateSubType.MIXTURE,
        options: [],
        isAmbiguous: true,
      },
      new Vec2(3, 0),
    );

    // Create bonds between them (R2 of one to R1 of next)
    const bond1 = new PolymerBond(ambiguous1, ambiguous2);
    bond1.firstMonomer = ambiguous1;
    bond1.secondMonomer = ambiguous2;
    ambiguous1.setBond(AttachmentPointName.R2, bond1);
    ambiguous2.setBond(AttachmentPointName.R1, bond1);

    const bond2 = new PolymerBond(ambiguous2, ambiguous3);
    bond2.firstMonomer = ambiguous2;
    bond2.secondMonomer = ambiguous3;
    ambiguous2.setBond(AttachmentPointName.R2, bond2);
    ambiguous3.setBond(AttachmentPointName.R1, bond2);

    const bond3 = new PolymerBond(ambiguous3, ambiguous4);
    bond3.firstMonomer = ambiguous3;
    bond3.secondMonomer = ambiguous4;
    ambiguous3.setBond(AttachmentPointName.R2, bond3);
    ambiguous4.setBond(AttachmentPointName.R1, bond3);

    // Create chains collection
    const chainsCollection = ChainsCollection.fromMonomers([
      ambiguous1,
      ambiguous2,
      ambiguous3,
      ambiguous4,
    ]);

    // Verify that all 4 ambiguous monomers are in the same chain
    expect(chainsCollection.chains.length).toBe(1);

    const chain = chainsCollection.chains[0];
    expect(chain.length).toBe(4);
    expect(chain.firstMonomer).toBe(ambiguous1);

    // Verify all monomers are in the chain
    const chainMonomers = chain.monomers;
    expect(chainMonomers).toContain(ambiguous1);
    expect(chainMonomers).toContain(ambiguous2);
    expect(chainMonomers).toContain(ambiguous3);
    expect(chainMonomers).toContain(ambiguous4);
  });

  test('ambiguous CHEM with no R1 bond should start a new chain', () => {
    // Create an ambiguous CHEM with no connections
    const chem1 = new Chem(
      {
        label: 'sDBL',
        props: {
          MonomerNaturalAnalogCode: '',
          MonomerName: 'sDBL',
          Name: 'sDBL',
        },
        attachmentPoints: [
          { label: 'R1', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
          { label: 'R2', leavingGroup: { atoms: [] }, attachmentAtom: -1 },
        ],
        struct: new Struct(),
      },
      new Vec2(0, 0),
    );

    const ambiguous1 = new AmbiguousMonomer(
      {
        id: 'amb1',
        monomers: [chem1],
        label: '@',
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        options: [],
        isAmbiguous: true,
      },
      new Vec2(0, 0),
    );

    const chainsCollection = ChainsCollection.fromMonomers([ambiguous1]);

    // Should create one chain with this monomer
    expect(chainsCollection.chains.length).toBe(1);
    expect(chainsCollection.chains[0].firstMonomer).toBe(ambiguous1);
  });
});
