import type { IRnaPreset } from 'application/editor/tools/Tool';
import { libraryItemHasR1AttachmentPoint } from 'domain/helpers/monomers';
import { peptideMonomerItem } from '../../mock-data';

describe('libraryItemHasR1AttachmentPoint', () => {
  it.each([
    { cap: undefined, expected: false },
    { cap: '', expected: false },
    { cap: 'H', expected: true },
    { cap: 'OH', expected: true },
  ])('requires a nonempty preset cap: $cap', ({ cap, expected }) => {
    const preset: IRnaPreset = {
      sugar: {
        ...peptideMonomerItem,
        props: {
          ...peptideMonomerItem.props,
          MonomerCaps: { R1: cap },
        },
      },
    };

    expect(libraryItemHasR1AttachmentPoint(preset)).toBe(expected);
  });

  it('returns false for a preset without a sugar', () => {
    expect(libraryItemHasR1AttachmentPoint({ sugar: undefined })).toBe(false);
  });
});
