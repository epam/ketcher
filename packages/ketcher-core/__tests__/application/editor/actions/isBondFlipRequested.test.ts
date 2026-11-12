import { isBondFlipRequested } from 'application/editor/actions/bond';
import { Bond } from 'domain/entities/bond';

const { TYPE, STEREO } = Bond.PATTERN;

const createBond = (type: number, stereo: number) =>
  new Bond({ begin: 0, end: 1, type, stereo });

describe('isBondFlipRequested', () => {
  it('is true when a wedge bond is chosen again with the same wedge', () => {
    expect(
      isBondFlipRequested(createBond(TYPE.SINGLE, STEREO.UP), {
        type: TYPE.SINGLE,
        stereo: STEREO.UP,
      }),
    ).toBe(true);
  });

  it('is true when a dative bond is chosen again', () => {
    expect(
      isBondFlipRequested(createBond(TYPE.DATIVE, STEREO.NONE), {
        type: TYPE.DATIVE,
        stereo: STEREO.NONE,
      }),
    ).toBe(true);
  });

  it('is false when a plain single bond is chosen again (#10377)', () => {
    expect(
      isBondFlipRequested(createBond(TYPE.SINGLE, STEREO.NONE), {
        type: TYPE.SINGLE,
        stereo: STEREO.NONE,
      }),
    ).toBe(false);
  });

  it('is false when a double bond is changed to single (#10377)', () => {
    expect(
      isBondFlipRequested(createBond(TYPE.DOUBLE, STEREO.NONE), {
        type: TYPE.SINGLE,
        stereo: STEREO.NONE,
      }),
    ).toBe(false);
  });

  it('is false when a wedge bond is changed to another wedge', () => {
    expect(
      isBondFlipRequested(createBond(TYPE.SINGLE, STEREO.UP), {
        type: TYPE.SINGLE,
        stereo: STEREO.DOWN,
      }),
    ).toBe(false);
  });
});
