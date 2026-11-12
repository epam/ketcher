// macOS reserves Cmd+Option+D (show/hide the Dock), so the page never receives
// it. The sequence-type hotkeys must have a primary shortcut that macOS lets
// through, and the tooltip must show that one.

type HotkeyModules = {
  hotkeysConfig: typeof import('../editorEvents').hotkeysConfig;
  keyNorm: typeof import('../../../utilities/keynorm').keyNorm;
  initHotKeys: typeof import('../../../utilities/keynorm').initHotKeys;
  generateMenuShortcuts: typeof import('../../../utilities/shortcutsUtil').generateMenuShortcuts;
};

const loadOnPlatform = (platform: string, isMacOs: boolean): HotkeyModules => {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    configurable: true,
  });

  let modules = {} as HotkeyModules;
  jest.isolateModules(() => {
    jest.doMock('react-device-detect', () => ({ isMacOs }));
    const { hotkeysConfig } = jest.requireActual('../editorEvents');
    const { keyNorm, initHotKeys } = jest.requireActual(
      '../../../utilities/keynorm',
    );
    const { generateMenuShortcuts } = jest.requireActual(
      '../../../utilities/shortcutsUtil',
    );
    modules = {
      hotkeysConfig,
      keyNorm,
      initHotKeys,
      generateMenuShortcuts,
    };
  });
  return modules;
};

const keydown = (code: string, init: KeyboardEventInit) =>
  new KeyboardEvent('keydown', { code, ...init });

const cases = [
  { action: 'RNASequenceType', code: 'KeyR', letter: 'R' },
  { action: 'DNASequenceType', code: 'KeyD', letter: 'D' },
  { action: 'PEPTIDESequenceTYpe', code: 'KeyP', letter: 'P' },
] as const;

describe('sequence-type hotkeys', () => {
  const originalPlatform = navigator.platform;

  afterEach(() => {
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
    jest.resetModules();
  });

  describe('on macOS', () => {
    it.each(cases)(
      '$action is triggered by Ctrl+Option+$letter',
      ({ action, code }) => {
        const { hotkeysConfig, keyNorm, initHotKeys } = loadOnPlatform(
          'MacIntel',
          true,
        );
        const hotKeys = initHotKeys(hotkeysConfig);

        expect(
          keyNorm.lookup(
            hotKeys,
            keydown(code, { ctrlKey: true, altKey: true }),
          ),
        ).toEqual([action]);
      },
    );

    it.each(cases)(
      '$action still accepts Cmd+Option+$letter',
      ({ action, code }) => {
        const { hotkeysConfig, keyNorm, initHotKeys } = loadOnPlatform(
          'MacIntel',
          true,
        );
        const hotKeys = initHotKeys(hotkeysConfig);

        expect(
          keyNorm.lookup(
            hotKeys,
            keydown(code, { metaKey: true, altKey: true }),
          ),
        ).toEqual([action]);
      },
    );

    it.each(cases)(
      '$action tooltip shows Ctrl+Option+$letter',
      ({ action, letter }) => {
        const { hotkeysConfig, generateMenuShortcuts } = loadOnPlatform(
          'MacIntel',
          true,
        );

        expect(generateMenuShortcuts(hotkeysConfig)[action]).toBe(
          `Ctrl+Option+${letter}`,
        );
      },
    );
  });

  describe('on Windows and Linux', () => {
    it.each(cases)(
      '$action is triggered by Ctrl+Alt+$letter, as before',
      ({ action, code, letter }) => {
        const { hotkeysConfig, keyNorm, initHotKeys, generateMenuShortcuts } =
          loadOnPlatform('Win32', false);
        const hotKeys = initHotKeys(hotkeysConfig);

        expect(
          keyNorm.lookup(
            hotKeys,
            keydown(code, { ctrlKey: true, altKey: true }),
          ),
        ).toEqual([action]);
        expect(generateMenuShortcuts(hotkeysConfig)[action]).toBe(
          `Ctrl+Alt+${letter}`,
        );
      },
    );
  });
});
