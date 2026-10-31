import { screen, fireEvent, render as rtlRender } from '@testing-library/react';
import { LeftToolbarContainer } from '../views/toolbars';
import { Provider } from 'react-redux';
import createStore from '../state';
import { initClipboard, initKeydownListener } from './hotkeys';
import { act } from 'react';
import { ChemicalMimeType, KetSerializer, MolSerializer } from 'ketcher-core';
import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import type { Api } from 'src/script/api';
import BondTool from '../../editor/tool/bond';
import type Editor from '../../editor/Editor';

jest.mock('react-intersection-observer', () => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    useInView: jest.fn().mockReturnValue([]),
  };
});

describe('Hot keys', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should select last chosen selected tool when user press ESC', async () => {
    renderWithMockStore(<LeftToolbarContainer />);
    const text = screen.getByTestId('text');

    act(() => {
      fireEvent.click(text);
      fireEvent.keyDown(text, {
        code: 'Escape',
      });
    });
    const className = screen.getByTestId('select-rectangle').className;
    expect(className).toContain('selected');
  });

  it('Shift+Tab to switch selection tool', async () => {
    renderWithMockStore(<LeftToolbarContainer />);

    act(() => {
      fireEvent.keyDown(document, {
        code: 'Tab',
        shiftKey: true,
      });
    });
    expect(screen.getByTestId('select-lasso').className).toContain('selected');
  });

  // Regression test for https://github.com/epam/ketcher/issues/3152:
  // '0' (Any Bond) was missing from the shortcutKeys list used to tell a
  // repeated shortcut press apart from the start of an abbreviation search,
  // so pressing '0' a second time incorrectly opened the Abbreviation
  // Lookup, unlike the equivalent '1'-'4' bond shortcuts.
  it('should not open Abbreviation lookup when pressing "0" (Any Bond) several times', async () => {
    const { store } = renderWithMockStore(<LeftToolbarContainer />);
    act(() => {
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
    });
    expect(store.getState().abbreviationLookup.isOpen).toBe(false);
  });

  it.each([
    [true, ChemicalMimeType.Rxn],
    [false, ChemicalMimeType.Mol],
  ])(
    'should use %s reaction clipboard MIME mapping during legacy copy',
    (isReaction, expectedMimeType) => {
      jest.spyOn(KetSerializer.prototype, 'serialize').mockReturnValue('ket');
      jest.spyOn(MolSerializer.prototype, 'serialize').mockReturnValue('mol');

      const selection = jest.fn();
      const clipboard = initClipboard(jest.fn(), () => ({
        modal: null,
        editor: {
          selection,
          structSelected: () => ({
            isReaction,
            isBlank: () => false,
            simpleObjects: { size: 0 },
            texts: { size: 0 },
          }),
        },
      }));

      expect(clipboard.onLegacyCopy()).toEqual({
        [ChemicalMimeType.KET]: 'ket',
        'text/plain': 'mol',
        [expectedMimeType]: 'mol',
      });
      expect(selection).toHaveBeenCalledWith(null);
    },
  );

  it('does not apply a numeric bond shortcut to a haptic bond with an attachment group', () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [endpointId] }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(1, 0) }),
    );
    const hapticBondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: attachmentGroupId,
        end: centralAtomId,
      }),
    );
    const update = jest.fn();
    const editor = {
      selection: () => ({ bonds: [hapticBondId] }),
      render: { ctab: { molecule: struct } },
      update,
    } as unknown as Editor;

    const tool = new BondTool(editor, {
      type: Bond.PATTERN.TYPE.SINGLE,
      stereo: Bond.PATTERN.STEREO.NONE,
    });

    expect(tool.isNotActiveTool).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(struct.bonds.get(hapticBondId)?.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
  });
});

function renderWithMockStore(component) {
  const store = createStore({}, {} as Api, () => null);
  store.dispatch(initKeydownListener(document));
  store.dispatch({
    type: 'INIT',
    editor: {
      tool: jest.fn().mockReturnValue(true),
      historySize: () => {
        return { undo: [] };
      },
      selection: jest.fn(),
      struct: () => {
        return { atoms: { keys: () => new Set() } };
      },
      render: { ctab: {}, options: { viewOnlyMode: false } },
      zoom: jest.fn(),
      _tool: { mode: '' },
      rotateController: { isRotating: false },
    },
  });
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
