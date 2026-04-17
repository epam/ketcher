import toolActions from './tools';

jest.mock(
  'ketcher-core',
  () => ({
    RxnArrowMode: {},
    SimpleObjectMode: {},
    findStereoAtoms: jest.fn(() => [1]),
    IMAGE_KEY: 'images',
    MULTITAIL_ARROW_TOOL_NAME: 'multitail-arrow',
    CREATE_MONOMER_TOOL_NAME: 'create-monomer',
    Bond: {
      PATTERN: {
        TYPE: { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, AROMATIC: 4, ANY: 8 },
        STEREO: { NONE: 0, UP: 1, DOWN: 6, EITHER: 4, CIS_TRANS: 3 },
      },
    },
  }),
  { virtual: true },
);

describe('tool actions', () => {
  it('contains lone-pair toggle toolbar action', () => {
    expect(toolActions['lone-pair-toggle']).toMatchObject({
      title: 'Toggle Lone Pair Display',
      action: { tool: 'lonepair' },
    });
    expect(typeof toolActions['lone-pair-toggle'].hidden).toBe('function');
  });
});
