import { vi } from 'vitest';

import action from './index';
vi.mock('./atoms', () => ({ default: {} }));
vi.mock('./copyAs', () => ({ default: vi.fn() }));
vi.mock('./copyImageToClipboard', () => ({ default: vi.fn() }));
vi.mock('./debug', () => ({ default: {} }));
vi.mock('../component/cliparea/cliparea', () => ({
  exec: vi.fn(),
}));
vi.mock('./isHidden', () => ({ default: vi.fn(() => false) }));
vi.mock('./server', () => ({ default: {} }));
vi.mock('./templates', () => ({ default: {} }));
vi.mock('./tools', () => ({ default: {} }));
vi.mock('./zoom', () => ({ default: {} }));
vi.mock('./help', () => ({
  __esModule: true,
  default: {
    help: {
      enabledInViewOnly: true,
      action: vi.fn(),
      hidden: vi.fn(() => false),
    },
  },
}));
vi.mock('./functionalGroups', () => ({ default: {} }));
vi.mock('./fullscreen', () => ({ default: {} }));
vi.mock('../state/shared', () => ({
  openInfoModal: vi.fn(),
  removeStructAction: vi.fn(),
}));

const createEditor = (isMonomerCreationWizardActive: boolean) => ({
  isMonomerCreationWizardActive,
  render: {
    options: {
      viewOnlyMode: false,
    },
  },
});

const getDisabledState = (actionName: 'settings' | 'help' | 'about') =>
  action[actionName].disabled as unknown as (
    editor: ReturnType<typeof createEditor>,
  ) => boolean;

describe('toolbar action state for monomer creation wizard', () => {
  it('disables settings while the wizard is active', () => {
    const getSettingsDisabledState = getDisabledState('settings');

    expect(getSettingsDisabledState(createEditor(true))).toBe(true);
    expect(getSettingsDisabledState(createEditor(false))).toBe(false);
  });

  it('keeps help and about enabled while the wizard is active', () => {
    expect(action.help.disabled).toBeUndefined();
    expect(action.about.disabled).toBeUndefined();
  });
});
