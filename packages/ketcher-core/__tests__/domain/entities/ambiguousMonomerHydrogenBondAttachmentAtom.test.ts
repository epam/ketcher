import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { Peptide } from 'domain/entities/Peptide';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Struct } from 'domain/entities/struct';
import { AttachmentPointName } from 'domain/types';
import { KetAmbiguousMonomerTemplateSubType } from 'application/formatters/types/ket';
import { KetMonomerClass } from 'domain/constants/monomers';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';

// Regression test for https://github.com/epam/ketcher/issues/9866:
// a fix for ambiguous-monomer R-labeled attachment points (avoiding duplicate
// SGroupAttachmentPoints) must not change how the synthetic "hydrogen"
// pseudo-attachment-point is resolved. Hydrogen bonds rendered to/from an
// ambiguous monomer always anchor to a fixed placeholder atom (id 0),
// regardless of which real atom the underlying candidate monomer's own R1
// attachment point uses - otherwise hydrogen bonds silently stop being
// drawn after Macro -> Micro conversion (e.g. macro-micro-switcher3.spec.ts).
describe('Hydrogen bond attachment atom for ambiguous monomers', () => {
  it("resolves to atom 0 even when the candidate monomer's own R1 atom is not 0", () => {
    const candidateMonomer = new Peptide({
      favorite: false,
      label: 'D',
      props: {
        MonomerNaturalAnalogCode: 'D',
        MonomerName: 'D',
        Name: 'D',
        MonomerClass: KetMonomerClass.AminoAcid,
      },
      struct: new Struct(),
      attachmentPoints: [
        { attachmentAtom: 3, leavingGroup: { atoms: [4] }, type: 'left' },
        { attachmentAtom: 0, leavingGroup: { atoms: [9] }, type: 'right' },
      ],
    });

    const ambiguousMonomer = new AmbiguousMonomer({
      label: 'X',
      isAmbiguous: true,
      id: 'alternatives__D',
      subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
      monomers: [candidateMonomer],
      options: [{ templateId: 'D' }],
    });

    const hydrogenBond = new HydrogenBond(ambiguousMonomer);
    ambiguousMonomer.setBond(AttachmentPointName.HYDROGEN, hydrogenBond);

    const atomIdMap = new Map<number, number>([
      [0, 100],
      [3, 103],
    ]);
    const monomerToAtomIdMap = new Map([[ambiguousMonomer, atomIdMap]]);

    const result = MacromoleculesConverter.findAttachmentPointAtom(
      hydrogenBond,
      ambiguousMonomer,
      monomerToAtomIdMap,
    );

    expect(result.attachmentAtomId).toBe(0);
    expect(result.globalAttachmentAtomId).toBe(100);
  });
});
