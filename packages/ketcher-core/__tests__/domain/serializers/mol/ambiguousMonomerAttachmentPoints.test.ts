import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { SGroup } from 'domain/entities/sgroup';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { ambiguousPeptidePresetKet } from '../../entities/fixtures/ambiguousPeptidePreset';

KetSerializer.setMonomerFactory(monomerFactory);

// Regression test for https://github.com/epam/ketcher/issues/9866:
// after fixing Struct.clone() to preserve monomer attachment points, an
// "ambiguous monomer" (alternatives, e.g. peptide "X") with more than one
// attachment point (R1/R2) had every attachment point collapsed onto the
// same placeholder atom id (hardcoded to 0), producing duplicate
// SGroupAttachmentPoints. That went unnoticed on load (which adds
// attachment points with validateUniqueness=false), but crashed with
// "The same attachment point cannot be added to an S-group more than once"
// as soon as anything re-added them with validation on - e.g. Undo, via
// SGroupAttachmentPointAdd.execute(), after Ctrl+A -> Delete in Micro mode.
describe('Ambiguous monomer SGroupAttachmentPoint uniqueness', () => {
  it('assigns distinct atom ids to each attachment point of an ambiguous monomer', () => {
    const struct = new KetSerializer().deserializeToStruct(
      ambiguousPeptidePresetKet,
    );

    const monomerSgroups: MonomerMicromolecule[] = [];
    struct.sgroups.forEach((sgroup) => {
      if (sgroup instanceof MonomerMicromolecule) monomerSgroups.push(sgroup);
    });
    expect(monomerSgroups).toHaveLength(1);

    const attachmentPoints = monomerSgroups[0].getAttachmentPoints();
    expect(attachmentPoints).toHaveLength(2);

    const pairs = attachmentPoints.map(
      (point) => `${point.atomId}:${point.leaveAtomId}`,
    );
    expect(new Set(pairs).size).toBe(pairs.length);

    // Re-adding the attachment points with validation on is exactly what
    // SGroupAttachmentPointAdd.execute() does when Undo replays a deleted
    // monomer's attachment points - it must not throw.
    expect(() => {
      const freshSgroup = new SGroup('SUP');
      freshSgroup.addAttachmentPoints(attachmentPoints);
    }).not.toThrow();
  });
});
