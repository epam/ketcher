import { getExpandedToolbarWidth } from './getExpandedToolbarWidth';

// Expected values are the widths measured in the browser on the default
// toolbar: 21 icon buttons, three dividers, the mode switcher and the zoom.
const defaultParams = {
  hiddenButtons: [],
  customButtonsCount: 0,
  hasModeSwitcher: true,
};

describe('getExpandedToolbarWidth', () => {
  it('matches the narrow layout with icon-only mode switcher and 28px buttons', () => {
    expect(
      getExpandedToolbarWidth({ ...defaultParams, containerWidth: 800 }),
    ).toBe(732);
  });

  it('adds the mode switcher label from a 900px wide container', () => {
    expect(
      getExpandedToolbarWidth({ ...defaultParams, containerWidth: 950 }),
    ).toBe(866);
  });

  it('switches to 32px buttons from a 1024px wide container', () => {
    expect(
      getExpandedToolbarWidth({ ...defaultParams, containerWidth: 1024 }),
    ).toBe(950);
  });

  it('subtracts hidden top toolbar buttons and ignores other toolbars', () => {
    const hiddenButtons = [
      'text',
      'layout',
      'arom',
      'dearom',
      'check',
      'analyse',
      'recognize',
      'miew',
      'enhanced-stereo',
      'settings',
      'help',
      'about',
    ];

    expect(
      getExpandedToolbarWidth({
        ...defaultParams,
        containerWidth: 690,
        hiddenButtons,
      }),
    ).toBe(732 - 9 * 28);
  });

  it('drops the mode switcher and its divider when there is none', () => {
    expect(
      getExpandedToolbarWidth({
        ...defaultParams,
        containerWidth: 800,
        hasModeSwitcher: false,
      }),
    ).toBe(732 - 28 - 13);
  });

  it('drops the zoom controls but keeps their divider when zoom-list is hidden', () => {
    expect(
      getExpandedToolbarWidth({
        ...defaultParams,
        containerWidth: 800,
        hiddenButtons: ['zoom-list'],
      }),
    ).toBe(732 - 64);
  });

  it('counts custom buttons as icon buttons behind one divider', () => {
    expect(
      getExpandedToolbarWidth({
        ...defaultParams,
        containerWidth: 800,
        customButtonsCount: 2,
      }),
    ).toBe(732 + 2 * 28 + 13);
    expect(
      getExpandedToolbarWidth({
        ...defaultParams,
        containerWidth: 1100,
        customButtonsCount: 2,
      }),
    ).toBe(950 + 2 * 32 + 13);
  });
});
