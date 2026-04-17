import LonePairTool from './lonepair';

jest.mock(
  'ketcher-core',
  () => ({
    Atom: class Atom {},
    fromAtomsAttrs: jest.fn(),
  }),
  { virtual: true },
);

const { fromAtomsAttrs } = jest.requireMock('ketcher-core') as {
  fromAtomsAttrs: jest.Mock;
};

describe('LonePairTool', () => {
  const createEditor = () => {
    const atom: {
      lonePairDisplay: string;
      atomList: object | null;
      rglabel: null;
    } = {
      lonePairDisplay: 'inherit',
      atomList: null,
      rglabel: null,
    };
    const molecule = {
      atoms: {
        get: jest.fn(() => atom),
      },
    };
    const ctab = { molecule };
    const render = { ctab };
    const editor = {
      selection: jest.fn(),
      findItem: jest.fn(() => ({ map: 'atoms', id: 7 })),
      update: jest.fn(),
      hover: jest.fn(),
      render,
    };

    return { editor, atom };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fromAtomsAttrs.mockReturnValue('update-payload');
  });

  it('toggles atom override from inherit to show', () => {
    const { editor, atom } = createEditor();
    atom.lonePairDisplay = 'inherit';
    const tool = new LonePairTool(editor as never);

    tool.click({} as never);

    expect(fromAtomsAttrs).toHaveBeenCalledWith(
      editor.render.ctab,
      7,
      { lonePairDisplay: 'show' },
      null,
    );
    expect(editor.update).toHaveBeenCalledWith('update-payload');
  });

  it('toggles atom override from show to hide', () => {
    const { editor, atom } = createEditor();
    atom.lonePairDisplay = 'show';
    const tool = new LonePairTool(editor as never);

    tool.click({} as never);

    expect(fromAtomsAttrs).toHaveBeenCalledWith(
      editor.render.ctab,
      7,
      { lonePairDisplay: 'hide' },
      null,
    );
    expect(editor.update).toHaveBeenCalledWith('update-payload');
  });

  it('does not update for non-toggleable atoms', () => {
    const { editor, atom } = createEditor();
    atom.atomList = {};
    const tool = new LonePairTool(editor as never);

    tool.click({} as never);

    expect(editor.update).not.toHaveBeenCalled();
  });
});
