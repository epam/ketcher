import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { setExpandMonomerSGroup } from 'application/editor/actions/sgroup';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { moeMonomerPresetKet } from '../../entities/fixtures/moeMonomerPreset';

KetSerializer.setMonomerFactory(monomerFactory);

// Regression test for https://github.com/epam/ketcher/issues/9866:
// "Copy as MOL" of an expanded monomer structure used to silently drop every
// SGroupAttachmentPoint before writing M SAP records (via two unconditional
// Struct.clone() calls that default needCloneAttachmentPoints to false), so
// pasting the copied MOL back could no longer fuse the monomer's connection
// points with the existing canvas and left stray atoms behind.
describe('MolSerializer attachment point round trip', () => {
  it('preserves monomer attachment points through Copy-as-MOL serialize/deserialize', () => {
    const struct = new KetSerializer().deserializeToStruct(moeMonomerPresetKet);

    const monomerSgroupIds: number[] = [];
    struct.sgroups.forEach((sgroup, id) => {
      if (sgroup instanceof MonomerMicromolecule) monomerSgroupIds.push(id);
    });
    expect(monomerSgroupIds).toHaveLength(3);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    monomerSgroupIds.forEach((id) => {
      setExpandMonomerSGroup(restruct, id, { expanded: true });
    });

    const molText = new MolSerializer().serialize(struct);

    expect(molText).toContain('M  SAP');

    const reimported = new MolSerializer().deserialize(molText);
    let attachmentPointCount = 0;
    reimported.sgroups.forEach((sgroup) => {
      attachmentPointCount += sgroup.getAttachmentPoints().length;
    });

    expect(attachmentPointCount).toBeGreaterThan(0);
  });
});
