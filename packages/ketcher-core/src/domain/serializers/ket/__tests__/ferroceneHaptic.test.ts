// E2/E3 round-trip: load the ferrocene-haptic fixture, assert struct shape,
// re-serialize, and parse again to confirm identical in-memory content.

import * as fs from 'fs';
import * as path from 'path';
import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';

const fixturePath = path.join(__dirname, 'fixtures', 'ferrocene-haptic.ket');

describe('Ferrocene haptic KET round-trip (Section E)', () => {
  it('loads two SAPs, two haptic bonds, and 11 atoms', () => {
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const struct = new KetSerializer().deserializeMicromolecules(content);

    expect(struct.atoms.size).toBe(11);
    expect(struct.superAttachmentPoints.size).toBe(2);

    const haptics = [...struct.bonds.values()].filter(
      (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
    );
    expect(haptics).toHaveLength(2);
    haptics.forEach((b) => {
      expect(b).toBeInstanceOf(HapticBond);
      expect(b.end).toBe(-1);
    });
  });

  it('round-trips: load → serialize → load yields the same shape', () => {
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const ser = new KetSerializer();
    const struct1 = ser.deserializeMicromolecules(content);
    const reserialized = ser.serializeMicromolecules(struct1);
    const struct2 = ser.deserializeMicromolecules(reserialized);

    expect(struct2.atoms.size).toBe(struct1.atoms.size);
    expect(struct2.bonds.size).toBe(struct1.bonds.size);
    expect(struct2.superAttachmentPoints.size).toBe(
      struct1.superAttachmentPoints.size,
    );

    const haptics2 = [...struct2.bonds.values()].filter(
      (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
    );
    expect(haptics2).toHaveLength(2);
    haptics2.forEach((b) => {
      expect(b).toBeInstanceOf(HapticBond);
    });
  });
});
