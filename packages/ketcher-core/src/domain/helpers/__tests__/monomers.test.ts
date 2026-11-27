import type { IRnaPreset } from 'application/editor/tools/Tool';
import { libraryItemHasR1AttachmentPoint } from '../monomers';

describe('libraryItemHasR1AttachmentPoint', () => {
  const presetWithCaps = (caps: object): IRnaPreset =>
    ({ sugar: { props: { MonomerCaps: caps } } }) as unknown as IRnaPreset;

  it('requires an own, truthy cap on RNA presets', () => {
    expect(libraryItemHasR1AttachmentPoint(presetWithCaps({ R1: 'H' }))).toBe(
      true,
    );
    expect(libraryItemHasR1AttachmentPoint(presetWithCaps({ R1: '' }))).toBe(
      false,
    );
    expect(
      libraryItemHasR1AttachmentPoint(
        presetWithCaps(Object.create({ R1: 'H' })),
      ),
    ).toBe(false);
    expect(libraryItemHasR1AttachmentPoint(presetWithCaps({}))).toBe(false);
  });
});
