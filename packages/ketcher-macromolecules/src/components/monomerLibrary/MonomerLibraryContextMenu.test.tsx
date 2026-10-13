import { fireEvent, render, screen } from '@testing-library/react';
import {
  Atom,
  CoreEditor,
  KetMonomerClass,
  MonomerItemType,
  Struct,
} from 'ketcher-core';
import { withThemeAndStoreProvider } from 'src/testUtils/storeProviders';
import { MonomerItem } from './monomerLibraryItem/MonomerItem';
import { MonomerLibraryContextMenu } from './MonomerLibraryContextMenu';

vi.mock('react-contexify', () =>
  vi.importActual('../../../../../node_modules/react-contexify/dist/index.js'),
);

vi.mock('./monomerLibraryItem/hooks/useLibraryItemDrag', () => ({
  useLibraryItemDrag: vi.fn(),
}));

describe('monomer library menu', () => {
  const openWizard = vi.fn();
  const removeMonomer = vi.fn();
  const removePreset = vi.fn();
  const openConfirmation = vi.fn();
  const onClick = vi.fn();
  let root: HTMLDivElement;
  let monomer: MonomerItemType;

  beforeEach(() => {
    vi.clearAllMocks();
    root = document.createElement('div');
    root.className = 'Ketcher-macromolecules-root';
    document.body.appendChild(root);
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'C' }));
    monomer = {
      label: 'A',
      struct,
      props: {
        Name: 'Alanine',
        MonomerName: 'A',
        MonomerClass: KetMonomerClass.AminoAcid,
        MonomerType: 'PEPTIDE',
        MonomerNaturalAnalogCode: 'A',
      },
    };
  });

  afterEach(() => root.remove());

  const presetTemplate = { id: 'preset', name: 'MyPreset' };

  const renderMenu = ({
    isUserMade = true,
    isOnCanvas = false,
    presets = [] as object[],
  } = {}) => {
    const editor = {
      events: {
        openMonomerCreationWizard: { dispatch: openWizard },
        openConfirmationDialog: { dispatch: openConfirmation },
      },
      removeMonomerFromLibrary: removeMonomer,
      removePresetFromLibrary: removePreset,
      isMonomerReferencedInLibrary: vi.fn(() => false),
      isUserMadeMonomer: vi.fn(() => isUserMade),
      isMonomerPlacedOnCanvas: vi.fn(() => isOnCanvas),
      getReferencingPresets: vi.fn(() => presets),
      monomersLibraryParsedJson: {
        root: { templates: [{ $ref: 'preset' }] },
        preset: presetTemplate,
      },
    } as unknown as CoreEditor;
    render(
      withThemeAndStoreProvider(
        <>
          <MonomerItem item={monomer} onClick={onClick} />
          <MonomerLibraryContextMenu />
        </>,
        { editor: { editor } },
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Actions for A' }));
  };

  it('offers Edit before Duplicate and Edit, then Delete with a separator class', () => {
    renderMenu();
    const items = root.querySelectorAll('.contexify_item');
    expect(Array.from(items, (item) => item.textContent)).toEqual([
      'Edit',
      'Duplicate and Edit',
      'Delete',
    ]);
    expect(
      screen.getByTestId('duplicateandedit').nextElementSibling,
    ).toHaveClass('context_menu-delete-item');
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ['edit', 'library'],
    ['duplicateandedit', 'duplicate'],
  ])('opens %s for built-in monomers', (item, mode) => {
    renderMenu();
    expect(screen.getByTestId(item)).not.toHaveClass('contexify_item-disabled');
    fireEvent.click(screen.getByTestId(item));
    expect(openWizard).toHaveBeenCalledWith({ mode, libraryItem: monomer });
  });

  it('disables editing unresolved monomers', () => {
    monomer.props.unresolved = true;
    renderMenu();
    expect(screen.getByTestId('edit')).toHaveClass('contexify_item-disabled');
    expect(screen.getByTestId('duplicateandedit')).toHaveClass(
      'contexify_item-disabled',
    );
    fireEvent.click(screen.getByTestId('edit'));
    expect(openWizard).not.toHaveBeenCalled();
  });

  it('disables editing when no structure is available', () => {
    monomer.struct = new Struct();
    renderMenu();
    expect(screen.getByTestId('edit')).toHaveClass('contexify_item-disabled');
    expect(screen.getByTestId('duplicateandedit')).toHaveClass(
      'contexify_item-disabled',
    );
  });

  it('hides Delete for default library monomers', () => {
    renderMenu({ isUserMade: false });
    expect(screen.queryByTestId('delete')).not.toBeInTheDocument();
  });

  it('deletes immediately without a modal when monomer is unused', () => {
    renderMenu();
    fireEvent.click(screen.getByTestId('delete'));
    expect(openConfirmation).not.toHaveBeenCalled();
    expect(removeMonomer).toHaveBeenCalledWith(monomer);
  });

  it.each([
    [{ isOnCanvas: true }, 'Monomer present on canvas', 0],
    [{ presets: [presetTemplate] }, 'Monomer participates in a preset', 1],
    [
      { isOnCanvas: true, presets: [presetTemplate] },
      'Monomer present on canvas and participates in a preset',
      1,
    ],
  ])('asks for confirmation before deleting (%#)', (options, title, count) => {
    renderMenu(options);
    fireEvent.click(screen.getByTestId('delete'));
    expect(removeMonomer).not.toHaveBeenCalled();
    expect(openConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title, onConfirm: expect.any(Function) }),
    );

    openConfirmation.mock.calls[0][0].onConfirm();
    expect(removeMonomer).toHaveBeenCalledWith(monomer);
    expect(removePreset).toHaveBeenCalledTimes(count);
    if (count) expect(removePreset).toHaveBeenCalledWith('preset');
  });
});
