// macOS reserves Cmd+Option+D (show/hide the Dock), so the page never receives
// it. The sequence-type hotkeys must have a primary shortcut that macOS lets
// through, and the tooltip must show that one.

type HotkeyModules = {
  hotkeysConfiguration: typeof import('../editorEvents').hotkeysConfig;
  keyNorm: typeof import('../../../utilities/keynorm').keyNorm;
  initHotKeys: typeof import('../../../utilities/keynorm').initHotKeys;
  generateMenuShortcuts: typeof import('../../../utilities/shortcutsUtility').generateMenuShortcuts;
};

const loadOnPlatform = async (
  platform: string,
  isMacOs: boolean,
): Promise<HotkeyModules> => {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    configurable: true,
  });

  vi.resetModules();
  vi.doMock('react-device-detect', () => ({ isMacOs }));
  const { hotkeysConfig: hotkeysConfiguration } =
    await import('../editorEvents');
  const { keyNorm, initHotKeys } = await import('../../../utilities/keynorm');
  const { generateMenuShortcuts } =
    await import('../../../utilities/shortcutsUtility');

  return {
    hotkeysConfiguration,
    keyNorm,
    initHotKeys,
    generateMenuShortcuts,
  };
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
    vi.resetModules();
  });

  describe('on macOS', () => {
    it.each(cases)(
      '$action is triggered by Ctrl+Option+$letter',
      async ({ action, code }) => {
        const { hotkeysConfiguration, keyNorm, initHotKeys } =
          await loadOnPlatform('MacIntel', true);
        const hotKeys = initHotKeys(hotkeysConfiguration);

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
      async ({ action, code }) => {
        const { hotkeysConfiguration, keyNorm, initHotKeys } =
          await loadOnPlatform('MacIntel', true);
        const hotKeys = initHotKeys(hotkeysConfiguration);

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
      async ({ action, letter }) => {
        const { hotkeysConfiguration, generateMenuShortcuts } =
          await loadOnPlatform('MacIntel', true);

        expect(generateMenuShortcuts(hotkeysConfiguration)[action]).toBe(
          `Ctrl+Option+${letter}`,
        );
      },
    );
  });

  describe('on Windows and Linux', () => {
    it.each(cases)(
      '$action is triggered by Ctrl+Alt+$letter, as before',
      async ({ action, code, letter }) => {
        const {
          hotkeysConfiguration,
          keyNorm,
          initHotKeys,
          generateMenuShortcuts,
        } = await loadOnPlatform('Win32', false);
        const hotKeys = initHotKeys(hotkeysConfiguration);

        expect(
          keyNorm.lookup(
            hotKeys,
            keydown(code, { ctrlKey: true, altKey: true }),
          ),
        ).toEqual([action]);
        expect(generateMenuShortcuts(hotkeysConfiguration)[action]).toBe(
          `Ctrl+Alt+${letter}`,
        );
      },
    );
  });
});
