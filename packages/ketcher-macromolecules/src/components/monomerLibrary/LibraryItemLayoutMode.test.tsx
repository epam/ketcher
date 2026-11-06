import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { LayoutMode, MonomerItemType, Struct } from 'ketcher-core';
import { MonomerItem } from './monomerLibraryItem/MonomerItem';
import RnaPresetItem from './RnaPresetItem/RnaPresetItem';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  ketcherProvider: {
    getKetcher: () => ({
      editor: { struct: () => ({ isBlank: () => true }) },
    }),
  },
}));

const monomer: MonomerItemType = {
  label: 'A',
  props: {
    Name: 'Alanine',
    MonomerName: 'A',
    MonomerType: 'PEPTIDE',
    MonomerNaturalAnalogCode: 'A',
    MonomerCaps: { R1: 'H' },
  },
  struct: new Struct(),
};

describe.each([
  ['monomer', <MonomerItem item={monomer} />],
  [
    'RNA preset',
    <RnaPresetItem
      preset={{ name: 'A' }}
      isSelected={false}
      onClick={jest.fn()}
      onContextMenu={jest.fn()}
      onMouseLeave={jest.fn()}
      onMouseMove={jest.fn()}
    />,
  ],
])('%s autochain button', (_name, component) => {
  it.each<[LayoutMode, LayoutMode]>([
    ['sequence-layout-mode', 'flex-layout-mode'],
    ['sequence-layout-mode', 'snake-layout-mode'],
    ['flex-layout-mode', 'sequence-layout-mode'],
    ['snake-layout-mode', 'sequence-layout-mode'],
  ])(
    'reads the initialized editor mode, then updates from %s to %s and back',
    (initialMode, targetMode) => {
      let mode = initialMode;
      const listeners = new Set<(layoutMode: LayoutMode) => void>();
      const editor = {
        get mode() {
          return { modeName: mode };
        },
        get isSequenceMode() {
          return mode === 'sequence-layout-mode';
        },
        events: {
          layoutModeChange: {
            add: (listener: (layoutMode: LayoutMode) => void) =>
              listeners.add(listener),
            remove: (listener: (layoutMode: LayoutMode) => void) =>
              listeners.delete(listener),
          },
        },
      };
      const { container, rerender, unmount } = render(
        withThemeAndStoreProvider(<StrictMode>{component}</StrictMode>),
      );
      rerender(
        withThemeAndStoreProvider(<StrictMode>{component}</StrictMode>, {
          editor: { editor },
        }),
      );

      expect(Boolean(container.querySelector('.autochain'))).toBe(
        initialMode !== 'sequence-layout-mode',
      );

      act(() => {
        mode = targetMode;
        listeners.forEach((listener) => listener(mode));
      });

      expect(Boolean(container.querySelector('.autochain'))).toBe(
        targetMode !== 'sequence-layout-mode',
      );

      act(() => {
        mode = initialMode;
        listeners.forEach((listener) => listener(mode));
      });

      expect(Boolean(container.querySelector('.autochain'))).toBe(
        initialMode !== 'sequence-layout-mode',
      );
      unmount();
      expect(listeners.size).toBe(0);
    },
  );
});
