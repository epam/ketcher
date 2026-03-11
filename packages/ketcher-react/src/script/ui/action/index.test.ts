jest.mock('./atoms', () => ({}));
jest.mock('./copyAs', () => jest.fn());
jest.mock('./copyImageToClipboard', () => jest.fn());
jest.mock('./debug', () => ({}));
jest.mock('../component/cliparea/cliparea', () => ({
  exec: jest.fn(),
}));
jest.mock('./isHidden', () => jest.fn(() => false));
jest.mock('./server', () => ({}));
jest.mock('./templates', () => ({}));
jest.mock('./tools', () => ({}));
jest.mock('./zoom', () => ({}));
jest.mock('./help', () => ({
  __esModule: true,
  default: {
    help: {
      enabledInViewOnly: true,
      action: jest.fn(),
      hidden: jest.fn(() => false),
    },
  },
}));
jest.mock('./functionalGroups', () => ({}));
jest.mock('./fullscreen', () => ({}));
jest.mock('../state/shared', () => ({
  openInfoModal: jest.fn(),
  removeStructAction: jest.fn(),
}));

import action from './index';

const createEditor = (isMonomerCreationWizardActive: boolean) =>
  ({
    isMonomerCreationWizardActive,
    render: {
      options: {
        viewOnlyMode: false,
      },
    },
  } as any);

const getDisabledState = (actionName: 'settings' | 'help' | 'about') =>
  action[actionName].disabled as (editor: any) => boolean;

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
