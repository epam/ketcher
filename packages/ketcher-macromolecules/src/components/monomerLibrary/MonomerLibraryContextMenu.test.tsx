import { fireEvent, render, screen } from '@testing-library/react';
import {
  Atom,
  CoreEditor,
  KetMonomerClass,
  MonomerItemType,
  Struct,
} from 'ketcher-core';
import { MonomerItem } from './monomerLibraryItem/MonomerItem';
import { MonomerLibraryContextMenu } from './MonomerLibraryContextMenu';

jest.mock('react-contexify', () =>
  jest.requireActual(
    '../../../../../node_modules/react-contexify/dist/index.js',
  ),
);

jest.mock('./monomerLibraryItem/hooks/useLibraryItemDrag', () => ({
  useLibraryItemDrag: jest.fn(),
}));

describe('monomer library menu', () => {
  const openWizard = jest.fn();
  const removeMonomer = jest.fn();
  const removePreset = jest.fn();
  const revertMonomer = jest.fn();
  const openConfirmation = jest.fn();
  const onClick = jest.fn();
  let root: HTMLDivElement;
  let monomer: MonomerItemType;

  beforeEach(() => {
    jest.clearAllMocks();
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
    isEdited = false,
    presets = [] as object[],
  } = {}) => {
    const editor = {
      events: {
        openMonomerCreationWizard: { dispatch: openWizard },
        openConfirmationDialog: { dispatch: openConfirmation },
      },
      removeMonomerFromLibrary: removeMonomer,
      removePresetFromLibrary: removePreset,
      isMonomerReferencedInLibrary: jest.fn(() => false),
      isUserMadeMonomer: jest.fn(() => isUserMade),
      isEditedDefaultMonomer: jest.fn(() => isEdited),
      revertMonomerToDefault: revertMonomer,
      isMonomerPlacedOnCanvas: jest.fn(() => isOnCanvas),
      getReferencingPresets: jest.fn(() => presets),
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

  it('offers Edit before Duplicate and Edit, then a separator before Delete', () => {
    renderMenu();
    const items = root.querySelectorAll('.contexify_item');
    expect(Array.from(items, (item) => item.textContent)).toEqual([
      'Edit',
      'Duplicate and Edit',
      'Delete',
    ]);
    expect(
      screen.getByTestId('duplicateandedit').nextElementSibling,
    ).toHaveClass('contexify_separator');
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

  it('offers Revert to Default only for edited default monomers', () => {
    renderMenu();
    expect(screen.queryByTestId('revert')).not.toBeInTheDocument();
  });

  it('reverts an edited default monomer', () => {
    renderMenu({ isUserMade: false, isEdited: true });
    fireEvent.click(screen.getByTestId('revert'));
    expect(revertMonomer).toHaveBeenCalledWith(monomer);
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
