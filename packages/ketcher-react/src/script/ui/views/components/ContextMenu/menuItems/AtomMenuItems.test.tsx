import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { Atom, Struct } from 'ketcher-core';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import AtomMenuItems from './AtomMenuItems';

const mockStruct = new Struct();
const mockEditor = {
  struct: () => mockStruct,
  render: { ctab: {} },
  isMonomerCreationWizardActive: false,
};

vi.mock('ketcher-core', async () => ({
  ...(await vi.importActual<typeof import('ketcher-core')>('ketcher-core')),
  atomGetAttribute: (_ctab: unknown, aid: number, name: string) =>
    (mockStruct.atoms.get(aid) as unknown as Record<string, unknown>)?.[name] ??
    null,
  ketcherProvider: { getKetcher: () => ({ editor: mockEditor }) },
}));
vi.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test' }),
}));
vi.mock('src/script/ui/state/modal/atoms', () => ({
  updateSelectedAtoms: vi.fn(),
}));
vi.mock('../hooks/useAtomEdit', () => ({ default: () => [vi.fn(), false] }));
vi.mock('../hooks/useAtomStereo', () => ({ default: () => [vi.fn(), false] }));
vi.mock('../hooks/useDelete', () => ({ default: () => vi.fn() }));
vi.mock('../hooks/useMarkAs', () => ({
  default: () => ({
    handler: vi.fn(),
    isVisible: () => false,
    isDisabled: () => false,
  }),
}));
vi.mock('../hooks/useMakeAttachmentPointMenuItems', () => ({
  default: () => null,
}));
vi.mock('./AttachmentGroupActionMenuItem', () => ({ default: () => null }));
vi.mock('src/script/ui/action/highlightColors/HighlightColors', () => ({
  default: () => <button>Highlight</button>,
}));

// Keep the menu's disabled boundary observable without its positioning/event machinery.
vi.mock('react-contexify', () => ({
  Separator: () => <hr />,
  Submenu: ({
    children,
    disabled,
    'data-testid': testId,
  }: PropsWithChildren<{ disabled?: boolean; 'data-testid'?: string }>) => (
    <fieldset disabled={disabled} data-testid={testId}>
      {children}
    </fieldset>
  ),
  Item: ({
    children,
    disabled,
    'data-testid': testId,
  }: PropsWithChildren<{ disabled?: boolean; 'data-testid'?: string }>) => (
    <button disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}));

function renderMenu(atomIds: number[]) {
  return render(
    <AtomMenuItems propsFromTrigger={{ id: 'atom-context-menu', atomIds }} />,
  );
}

describe('atom context-menu query properties', () => {
  beforeEach(() => {
    mockStruct.atoms.clear();
    mockEditor.isMonomerCreationWizardActive = false;
    mockStruct.atoms.set(0, new Atom({ label: 'C' }));
    mockStruct.atoms.set(
      1,
      new Atom({ label: 'A', queryProperties: { customQuery: '[*]' } }),
    );
  });

  it.each([{ atomIds: [1] }, { atomIds: [0, 1] }, { atomIds: [1, 0] }])(
    'disables all query actions when editable targets include a custom query ($atomIds)',
    ({ atomIds }) => {
      renderMenu(atomIds);

      expect(screen.getByTestId('Query properties-option')).toBeDisabled();
      for (const title of [
        'Ring bond count',
        'H count',
        'Substitution count',
        'Unsaturated',
        'Implicit H count',
        'Aromaticity',
        'Ring membership',
        'Ring size',
        'Connectivity',
        'Chirality',
      ]) {
        expect(screen.getByTestId(`${title}-option`)).toBeDisabled();
      }
      expect(screen.getByTestId('Edit...-option')).toBeEnabled();
      expect(screen.getByTestId('Delete-option')).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Highlight' })).toBeEnabled();
    },
  );

  it.each([null, ''])(
    'allows query edits with customQuery=%j',
    (customQuery) => {
      const atom = mockStruct.atoms.get(0);
      if (atom) atom.queryProperties.customQuery = customQuery;
      renderMenu([0]);

      expect(screen.getByTestId('Query properties-option')).toBeEnabled();
      fireEvent.click(screen.getByTestId('Implicit H count-1-option'));
      expect(updateSelectedAtoms).toHaveBeenCalledWith(
        expect.objectContaining({ atoms: [0], editor: mockEditor }),
      );
    },
  );

  it('allows query edits for a selection containing only ordinary atoms', () => {
    mockStruct.atoms.set(2, new Atom({ label: 'N' }));
    renderMenu([0, 2]);

    expect(screen.getByTestId('Query properties-option')).toBeEnabled();
    fireEvent.click(screen.getByTestId('Implicit H count-1-option'));
    expect(updateSelectedAtoms).toHaveBeenCalledWith(
      expect.objectContaining({ atoms: [0, 2] }),
    );
  });

  it('keeps query actions disabled during monomer creation', () => {
    mockEditor.isMonomerCreationWizardActive = true;
    renderMenu([0]);
    expect(screen.getByTestId('Query properties-option')).toBeDisabled();
  });

  it('keeps query actions disabled without editable atoms', () => {
    renderMenu([]);
    expect(screen.getByTestId('Query properties-option')).toBeDisabled();
  });

  it('enables query actions again after custom query is cleared', () => {
    const { rerender } = renderMenu([1]);
    expect(screen.getByTestId('Query properties-option')).toBeDisabled();

    const atom = mockStruct.atoms.get(1);
    if (atom) atom.queryProperties.customQuery = null;
    rerender(
      <AtomMenuItems
        propsFromTrigger={{ id: 'atom-context-menu', atomIds: [1] }}
      />,
    );
    expect(screen.getByTestId('Query properties-option')).toBeEnabled();
  });
});
