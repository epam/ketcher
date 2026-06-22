import {
  isAllowedNonSapHapticBondMetal,
  isHapticBondPairAllowed,
  isSuperAttachmentPointAtom,
} from 'domain/helpers/hapticBond';

describe('hapticBond helpers', () => {
  it('detects a super-attachment point atom by label and endpoints', () => {
    expect(
      isSuperAttachmentPointAtom({ label: '*', endpoints: [1, 2, 3] }),
    ).toBe(true);
    expect(isSuperAttachmentPointAtom({ label: '*', endpoints: [] })).toBe(
      false,
    );
  });

  it('allows haptic bonds between a SAP and a regular atom only', () => {
    const sapAtom = { label: '*', endpoints: [1, 2, 3] };
    const carbonAtom = { label: 'C', endpoints: [] };

    expect(isHapticBondPairAllowed(sapAtom, carbonAtom)).toBe(true);
    expect(isHapticBondPairAllowed(sapAtom, sapAtom)).toBe(false);
  });

  it('recognizes allowed metals for non-SAP haptic bonds', () => {
    expect(isAllowedNonSapHapticBondMetal({ label: 'Ti', endpoints: [] })).toBe(
      true,
    );
    expect(isAllowedNonSapHapticBondMetal({ label: 'Al', endpoints: [] })).toBe(
      false,
    );
  });

  it('allows only one listed metal in a non-SAP haptic bond pair', () => {
    expect(
      isHapticBondPairAllowed(
        { label: 'Ti', endpoints: [] },
        { label: 'N', endpoints: [] },
      ),
    ).toBe(true);
    expect(
      isHapticBondPairAllowed(
        { label: 'Ti', endpoints: [] },
        { label: 'Au', endpoints: [] },
      ),
    ).toBe(false);
    expect(
      isHapticBondPairAllowed(
        { label: 'Al', endpoints: [] },
        { label: 'N', endpoints: [] },
      ),
    ).toBe(false);
  });
});
