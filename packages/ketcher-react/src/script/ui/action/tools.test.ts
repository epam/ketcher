/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('./isHidden', () =>
  jest.fn((_options, name) => name === 'hidden-tool'),
);
jest.mock('./flips', () => ({ isFlipDisabled: jest.fn(() => false) }));
jest.mock('../data/convert/structconv', () => ({
  toBondType: jest.fn((type: string) => ({ type, stereo: 0 })),
}));
jest.mock('../data/schema/struct-schema', () => ({
  bond: {
    properties: {
      type: {
        enum: ['single', 'double', 'any', 'singledouble'],
        enumNames: ['Single', 'Double', 'Any', 'Single/Double'],
      },
    },
  },
}));
jest.mock('ketcher-core', () => ({
  RxnArrowMode: {},
  SimpleObjectMode: {},
  Struct: class {},
  findStereoAtoms: jest.fn(() => []),
  IMAGE_KEY: 'image',
  MULTITAIL_ARROW_TOOL_NAME: 'multitail-arrow',
  CREATE_MONOMER_TOOL_NAME: 'create-monomer',
}));

import tools from './tools';
import { findStereoAtoms } from 'ketcher-core';

const makeEditor = (overrides: Record<string, unknown> = {}) => ({
  isMonomerCreationWizardActive: false,
  struct: () => ({ atoms: new Map([[1, {}]]) }),
  ...overrides,
});

describe('tools', () => {
  describe('enhanced-stereo disabled', () => {
    const enhancedStereo = tools['enhanced-stereo'];

    it('disables when monomer creation wizard is active', () => {
      expect(
        enhancedStereo.disabled?.(
          makeEditor({ isMonomerCreationWizardActive: true }),
        ),
      ).toBe(true);
    });

    it('disables when no stereo atoms exist', () => {
      (findStereoAtoms as jest.Mock).mockReturnValueOnce([]);
      expect(enhancedStereo.disabled?.(makeEditor())).toBe(true);
    });

    it('enables when wizard inactive and stereo atoms exist', () => {
      (findStereoAtoms as jest.Mock).mockReturnValueOnce([{ id: 1 }]);
      expect(enhancedStereo.disabled?.(makeEditor())).toBe(false);
    });
  });

  describe('bond actions', () => {
    it('builds a bond entry per schema enum value', () => {
      expect(tools['bond-single']).toBeDefined();
      expect(tools['bond-double']).toBeDefined();
      expect(tools['bond-any']).toBeDefined();
      expect(tools['bond-singledouble']).toBeDefined();
    });

    it('attaches a wizard-aware disabled fn to monomer-wizard-disallowed bonds', () => {
      expect(tools['bond-any'].disabled).toBeDefined();
      expect(tools['bond-singledouble'].disabled).toBeDefined();
      expect(
        tools['bond-any'].disabled?.(
          makeEditor({ isMonomerCreationWizardActive: true }),
        ),
      ).toBe(true);
      expect(
        tools['bond-any'].disabled?.(
          makeEditor({ isMonomerCreationWizardActive: false }),
        ),
      ).toBe(false);
    });

    it('does not add a disabled fn to allowed bond types', () => {
      expect(tools['bond-single'].disabled).toBeUndefined();
      expect(tools['bond-double'].disabled).toBeUndefined();
    });

    it('hidden defers to isHidden', () => {
      expect(tools['bond-single'].hidden?.({})).toBe(false);
    });

    it('builds the action with the bond opts from toBondType', () => {
      expect(tools['bond-single'].action).toEqual({
        tool: 'bond',
        opts: { type: 'single', stereo: 0 },
      });
    });
  });
});
