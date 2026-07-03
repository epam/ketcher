import type {
  MacromoleculeContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item, Separator } from 'react-contexify';
import useMonomerExpansionHandlers, {
  canExpandMonomer,
} from '../hooks/useMonomerExpansionHandlers';
import {
  type Bond,
  Action,
  fromFragmentDeletion,
  fromSgroupDeletion,
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
import { useCallback } from 'react';

const MacromoleculeMenuItems = (
  props: MenuItemsProps<MacromoleculeContextMenuProps>,
) => {
  const { ketcherId } = useAppContext();
  const [action, hidden] = useMonomerExpansionHandlers();
  const functionalGroups = props.propsFromTrigger?.functionalGroups;

  // Separate monomer FGs from other FGs
  const monomerFGs =
    functionalGroups?.filter(
      (fg) => fg.relatedSGroup instanceof MonomerMicromolecule,
    ) ?? [];

  const singleSGroup =
    monomerFGs[0]?.relatedSGroup instanceof MonomerMicromolecule
      ? (monomerFGs[0].relatedSGroup as MonomerMicromolecule)
      : undefined;

  const expandingDisabled =
    functionalGroups?.every((fg) => !canExpandMonomer(fg)) ?? false;

  const totalFGCount = functionalGroups?.length ?? 0;
  const expandText =
    totalFGCount > 1 ? 'Expand monomers' : 'Expand monomer';
  const collapseText =
    totalFGCount > 1 ? 'Collapse monomers' : 'Collapse monomer';

  // "Edit Monomer": visible only when exactly one monomer (and nothing else) is in context
  const isSingleMonomer =
    monomerFGs.length === 1 && totalFGCount === 1;

  const editMonomerDisabled =
    !(singleSGroup instanceof MonomerMicromolecule) ||
    isAmbiguousMonomerLibraryItem(singleSGroup.monomer.monomerItem) ||
    Boolean(singleSGroup.monomer.monomerItem.props.unresolved);

  // "Edit All Monomers": visible only when >1 monomer of the same type (nothing else)
  const allSameMonomerType =
    monomerFGs.length > 1 &&
    monomerFGs.length === totalFGCount &&
    monomerFGs.every(
      (fg) =>
        (fg.relatedSGroup as MonomerMicromolecule).monomer.monomerItem.props
          .MonomerName ===
        (monomerFGs[0].relatedSGroup as MonomerMicromolecule).monomer
          .monomerItem.props.MonomerName,
    );

  const editAllMonomersDisabled =
    !allSameMonomerType ||
    monomerFGs.some((fg) => {
      const mg = fg.relatedSGroup as MonomerMicromolecule;
      return (
        isAmbiguousMonomerLibraryItem(mg.monomer.monomerItem) ||
        Boolean(mg.monomer.monomerItem.props.unresolved)
      );
    });

  // "Create Monomer": visible when multiple monomers selected, or one monomer + other items
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
  const currentSelection = editor.selection();
  const monomerAtomSet = new Set(
    monomerFGs.flatMap((fg) => fg.relatedSGroup.atoms),
  );
  const hasNonMonomerAtoms =
    currentSelection?.atoms?.some((atomId) => !monomerAtomSet.has(atomId)) ??
    false;
  const hasNonMonomerFGs = totalFGCount > monomerFGs.length;
  const createMonomerVisible =
    monomerFGs.length > 1 ||
    (monomerFGs.length === 1 && (hasNonMonomerFGs || hasNonMonomerAtoms));

  const handleEdit = (editAllInstances = false) => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sgroup = functionalGroups?.[0]?.relatedSGroup;

    if (!(sgroup instanceof MonomerMicromolecule)) {
      return;
    }

    const atoms = [...sgroup.atoms];
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
            sgroup.monomer,
            provideEditorInstance()?.monomersLibraryParsedJson,
          )
        : getEditInstanceInitialValues(sgroup.monomer),
      sgroup.getAttachmentPoints(),
    );
  };

  const handleRemoveGrouping = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const removeAction = new Action();

    functionalGroups?.forEach((fg) => {
      removeAction.mergeWith(
        fromSgroupDeletion(editor.render.ctab, fg.relatedSGroupId),
      );
    });

    editor.update(removeAction);
  }, [ketcherId, functionalGroups]);

  const handleCreateMonomer = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    editor.openMonomerCreationWizard();
  }, [ketcherId]);

  const handleSelectAllIdentical = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const struct = editor.struct();
    const sgroup = monomerFGs[0]?.relatedSGroup;

    if (!(sgroup instanceof MonomerMicromolecule)) {
      return;
    }

    const targetMonomerName =
      sgroup.monomer.monomerItem.props.MonomerName;
    const atomsToSelect: number[] = [];

    struct.sgroups.forEach((sg) => {
      if (
        sg instanceof MonomerMicromolecule &&
        sg.monomer.monomerItem.props.MonomerName === targetMonomerName
      ) {
        atomsToSelect.push(...sg.atoms);
      }
    });

    editor.selection({ atoms: atomsToSelect });
  }, [ketcherId, monomerFGs]);

  const handleDelete = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const molecule = editor.render.ctab;
    const allFGAtoms =
      functionalGroups?.flatMap((fg) => fg.relatedSGroup.atoms) ?? [];

    const itemsToDelete = editor.selection() || { atoms: allFGAtoms };
    const deleteAction = fromFragmentDeletion(molecule, itemsToDelete);
    editor.update(deleteAction);
    editor.selection(null);
    editor.focusCliparea();
  }, [ketcherId, functionalGroups]);

  return (
    <>
      {/* Expand / Collapse Monomer */}
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

      {/* Remove Grouping */}
      <Item
        {...props}
        data-testid="Remove Grouping-option"
        onClick={handleRemoveGrouping}
      >
        Remove Grouping
      </Item>

      <Separator />

      {/* Create Monomer (only when multiple monomers or one monomer + other items) */}
      {createMonomerVisible && (
        <>
          <Item
            {...props}
            data-testid="Create Monomer-option"
            onClick={handleCreateMonomer}
          >
            Create Monomer
          </Item>
          <Separator />
        </>
      )}

      {/* Select All Identical Monomers */}
      <Item
        {...props}
        data-testid="Select All Identical Monomers-option"
        onClick={handleSelectAllIdentical}
      >
        Select All Identical Monomers
      </Item>

      {/* Edit Monomer (single monomer context only) */}
      <Item
        {...props}
        data-testid="Edit Monomer-option"
        onClick={() => handleEdit(false)}
        hidden={!isSingleMonomer}
        disabled={editMonomerDisabled}
      >
        Edit Monomer
      </Item>

      {/* Edit All Monomers (multiple same-type monomers only) */}
      <Item
        {...props}
        data-testid="Edit All Monomers-option"
        onClick={() => handleEdit(true)}
        hidden={!allSameMonomerType}
        disabled={editAllMonomersDisabled}
      >
        Edit All Monomers
      </Item>

      <Separator />

      {/* Delete */}
      <Item
        {...props}
        data-testid="Delete-option"
        onClick={handleDelete}
      >
        Delete
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
