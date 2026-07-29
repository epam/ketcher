import type {
  MacromoleculeContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import MenuSeparator from '../MenuSeparator';
import useMonomerExpansionHandlers, {
  canExpandMonomer,
} from '../hooks/useMonomerExpansionHandlers';
import useRemoveGrouping from '../hooks/useRemoveGrouping';
import {
  type Bond,
  fromFragmentDeletion,
  isAmbiguousMonomerLibraryItem,
  ketcherProvider,
  MonomerMicromolecule,
  provideEditorInstance,
} from 'ketcher-core';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import {
  getEditAllInstancesInitialValues,
  getEditInstanceInitialValues,
} from '../../MonomerCreationWizard/MonomerCreationWizard.utils';

const MacromoleculeMenuItems = (
  props: MenuItemsProps<MacromoleculeContextMenuProps>,
) => {
  const { ketcherId } = useAppContext();
  const [action, hidden] = useMonomerExpansionHandlers();
  const removeGroupingHandler = useRemoveGrouping();

  const functionalGroups = props.propsFromTrigger?.functionalGroups;
  const totalMonomerCount = props.propsFromTrigger?.totalMonomerCount ?? 0;
  const hasNonMonomerStructure =
    props.propsFromTrigger?.hasNonMonomerStructure ?? false;

  const sgroup = functionalGroups?.[0]?.relatedSGroup;
  const multipleMonomersSelected = (functionalGroups?.length ?? 0) > 1;

  const expandingDisabled =
    functionalGroups?.every((fg) => !canExpandMonomer(fg)) ?? false;

  const expandText = multipleMonomersSelected
    ? 'Expand monomers'
    : 'Expand monomer';
  const collapseText = multipleMonomersSelected
    ? 'Collapse monomers'
    : 'Collapse monomer';

  // "Edit Monomer" is disabled when more than one monomer is in context, or the
  // sgroup is invalid/ambiguous/unresolved.
  const editMonomerDisabled =
    multipleMonomersSelected ||
    !(sgroup instanceof MonomerMicromolecule) ||
    isAmbiguousMonomerLibraryItem(sgroup.monomer.monomerItem) ||
    sgroup.monomer.monomerItem.props.unresolved;

  // "Create Monomer" is visible only when the selection contains multiple
  // monomers, or exactly one monomer plus a non-monomer chemical structure.
  const createMonomerVisible =
    multipleMonomersSelected ||
    ((functionalGroups?.length ?? 0) === 1 && hasNonMonomerStructure);

  // Monomer code for "Edit All [code] (n)" label.
  const monomerCode =
    sgroup instanceof MonomerMicromolecule
      ? sgroup.monomer.monomerItem.label
      : '';

  const handleEdit = (editAllInstances = false) => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sg = functionalGroups?.[0]?.relatedSGroup;

    if (!(sg instanceof MonomerMicromolecule)) {
      return;
    }

    const atoms = [...sg.atoms];
    const bonds: number[] = [];
    editor.struct().bonds.forEach((bond: Bond, bondId: number) => {
      if (atoms.includes(bond.begin) && atoms.includes(bond.end)) {
        bonds.push(bondId);
      }
    });

    editor.openMonomerCreationWizard(
      {
        atoms,
        bonds,
        rxnArrows: [],
        rxnPluses: [],
        texts: [],
        rgroupAttachmentPoints: [],
      },
      editAllInstances
        ? getEditAllInstancesInitialValues(
            sg.monomer,
            provideEditorInstance()?.monomersLibraryParsedJson,
          )
        : getEditInstanceInitialValues(sg.monomer),
      sg.getAttachmentPoints(),
    );
  };

  const handleEditAll = () => {
    const coreEditor = provideEditorInstance();

    coreEditor?.events.openConfirmationDialog.dispatch({
      title: 'Editing monomers',
      confirmationText: `You are going to edit ${totalMonomerCount} monomers. Are you sure?`,
      onConfirm: () => handleEdit(true),
    });
  };

  const handleDelete = () => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const molecule = editor.render.ctab;
    const itemsToDelete = editor.selection() || {};
    const action = fromFragmentDeletion(molecule, itemsToDelete);
    editor.update(action);
    editor.selection(null);
    editor.focusCliparea();
  };

  /** Apply / remove hover highlight on all canvas instances of the same monomer code. */
  const setEditAllHover = (isHovering: boolean) => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const render = editor.render;
    render.ctab.sgroups.forEach((reSGroup, sgId) => {
      const sg = render.ctab.molecule.sgroups.get(sgId);
      if (
        sg instanceof MonomerMicromolecule &&
        sg.monomer.monomerItem.label === monomerCode
      ) {
        reSGroup.setHover(isHovering, render);
      }
    });
  };

  return (
    <>
      {/* Group 1: Expand / Collapse + Remove Grouping */}
      <Item
        {...props}
        data-testid={`${expandText}-option`}
        hidden={(params) => hidden(params, true)}
        onClick={(params) => action(params, true)}
        disabled={expandingDisabled}
      >
        {expandText}
      </Item>
      <Item
        {...props}
        data-testid={`${collapseText}-option`}
        hidden={(params) => hidden(params, false)}
        onClick={(params) => action(params, false)}
      >
        {collapseText}
      </Item>
      <Item
        {...props}
        data-testid="Remove Grouping-option"
        onClick={removeGroupingHandler}
      >
        Remove Grouping
      </Item>

      <MenuSeparator />

      {/* Group 2: Create Monomer (conditional) */}
      {createMonomerVisible && (
        <>
          <Item
            {...props}
            data-testid="Create Monomer-option"
            onClick={() => handleEdit()}
          >
            Create Monomer
          </Item>
          <MenuSeparator />
        </>
      )}

      {/* Group 3: Edit Monomer / Edit All */}
      <Item
        {...props}
        data-testid="Edit Monomer-option"
        onClick={() => handleEdit()}
        disabled={editMonomerDisabled}
        title={
          editMonomerDisabled ? 'Select a single monomer to edit it' : undefined
        }
      >
        Edit Monomer
      </Item>
      <Item
        {...props}
        data-testid="Edit All-option"
        onClick={handleEditAll}
        onMouseEnter={() => setEditAllHover(true)}
        onMouseLeave={() => setEditAllHover(false)}
      >
        Edit All <strong>{monomerCode}</strong> ({totalMonomerCount})
      </Item>

      <MenuSeparator />

      {/* Group 4: Delete */}
      <Item
        {...props}
        data-testid="Delete Monomer-option"
        onClick={handleDelete}
      >
        Delete
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
