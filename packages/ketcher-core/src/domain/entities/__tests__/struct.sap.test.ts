import { Atom } from 'domain/entities/atom';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';

function buildStructWithRingAndSAP() {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const ids: number[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5;
    ids.push(
      struct.atoms.add(
        new Atom({
          label: 'C',
          pp: new Vec2(Math.cos(angle), Math.sin(angle)),
          fragment: fid,
        }),
      ),
    );
  }
  const sapId = struct.superAttachmentPoints.add(
    new SuperAttachmentPoint({ atoms: ids }),
  );
  return { struct, ids, sapId };
}

describe('Struct.superAttachmentPoints pool', () => {
  it('exposes superAttachmentPoints as a Pool', () => {
    const struct = new Struct();
    expect(struct.superAttachmentPoints).toBeDefined();
    expect(struct.superAttachmentPoints.size).toBe(0);
  });

  it('preserves SAP membership through clone()', () => {
    const { struct, ids, sapId } = buildStructWithRingAndSAP();
    const clone = struct.clone();
    expect(clone.superAttachmentPoints.size).toBe(1);
    const clonedSap = clone.superAttachmentPoints.values().next().value!;
    // After clone, atom ids may be re-keyed; assert by length and that the
    // cloned atom ids resolve to atoms in the cloned struct.
    expect(clonedSap.atoms.length).toBe(ids.length);
    for (const aid of clonedSap.atoms) {
      expect(clone.atoms.get(aid)).toBeDefined();
    }
    // Original is untouched
    expect(struct.superAttachmentPoints.get(sapId)?.atoms).toEqual(ids);
  });

  it('drops a SAP whose members are not all in the atom subset', () => {
    const { struct, ids } = buildStructWithRingAndSAP();
    // Clone with only first 3 atoms — the SAP's full membership isn't
    // present, so the SAP shouldn't be carried over.
    const subset = new (require('domain/entities/pile').Pile)(ids.slice(0, 3));
    const clone = struct.clone(subset);
    expect(clone.superAttachmentPoints.size).toBe(0);
  });
});
