import type {
  MacromoleculeContextMenuProperties,
  MenuItemsProperties,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import MenuSeparator from '../MenuSeparator';
import useMonomerExpansionHandlers, {
  canExpandMonomer,
} from '../hooks/useMonomerExpansionHandlers';
import useRemoveGrouping from '../hooks/useRemoveGrouping';
import {
  fromFragmentDeletion,
  isAmbiguousMonomerLibraryItem,
  ketcherProvider,
  KetcherFunctionality,
  MonomerMicromolecule,
} from 'ketcher-core';
import { useAppContext, useIsFunctionalityDisabled } from 'src/hooks';
import type Editor from 'src/script/editor';

const MacromoleculeMenuItems = (
  properties: MenuItemsProperties<MacromoleculeContextMenuProperties>,
) => {
  const { t } = useTranslation(['components', 'common']);
  const { ketcherId } = useAppContext();
  const [action, hidden] = useMonomerExpansionHandlers();
  const removeGroupingHandler = useRemoveGrouping();
  const isExpandMonomersDisabled = useIsFunctionalityDisabled(
    KetcherFunctionality.ExpandMonomers,
  );

  const functionalGroups = properties.propsFromTrigger?.functionalGroups;
  const totalMonomerCount = properties.propsFromTrigger?.totalMonomerCount ?? 0;
  const hasNonMonomerStructure =
    properties.propsFromTrigger?.hasNonMonomerStructure ?? false;

  const sgroup = functionalGroups?.[0]?.relatedSGroup;
  const areMultipleMonomersSelected = (functionalGroups?.length ?? 0) > 1;

  const expandingDisabled =
    functionalGroups?.every((fg) => !canExpandMonomer(fg)) ?? false;

  const expandText = areMultipleMonomersSelected
    ? 'Expand monomers'
    : 'Expand monomer';
  const collapseText = areMultipleMonomersSelected
    ? 'Collapse monomers'
    : 'Collapse monomer';
  const expandLabel = areMultipleMonomersSelected
    ? t('components:contextMenu.expandMonomers')
    : t('components:contextMenu.expandMonomer');
  const collapseLabel = areMultipleMonomersSelected
    ? t('components:contextMenu.collapseMonomers')
    : t('components:contextMenu.collapseMonomer');

  const unknownOrAmbiguousMonomer =
    !(sgroup instanceof MonomerMicromolecule) ||
    isAmbiguousMonomerLibraryItem(sgroup.monomer.monomerItem) ||
    sgroup.monomer.monomerItem.props.unresolved;

  // "Edit Monomer" is disabled when more than one monomer is in context, or the
  // sgroup is invalid/ambiguous/unresolved.
  const editMonomerDisabled =
    areMultipleMonomersSelected || unknownOrAmbiguousMonomer;

  // "Create Monomer" is visible only when the selection contains multiple
  // monomers, or exactly one monomer plus a non-monomer chemical structure.
  const createMonomerVisible =
    areMultipleMonomersSelected ||
    ((functionalGroups?.length ?? 0) === 1 && hasNonMonomerStructure);

  // Monomer code for "Edit All [code] (n)" label.
  const monomerCode =
    sgroup instanceof MonomerMicromolecule
      ? sgroup.monomer.monomerItem.label
      : '';

  const handleEdit = (shouldEditAllInstances = false) => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sgroupIds = (functionalGroups ?? []).map((fg) => fg.relatedSGroupId);

    editor.openEditMonomerWizard(sgroupIds, shouldEditAllInstances);
  };

  const handleEditAll = async () => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

    try {
      await editor?.event.confirm.dispatch({
        title: t('components:contextMenu.editingMonomersTitle'),
        text: t('components:contextMenu.editingMonomersQuestion', {
          count: totalMonomerCount,
        }),
        okButtonLabel: t('common:button.yes'),
      });
      // Promise resolves when the user clicks OK; do nothing on Cancel (caught below).
      handleEdit(true);
    } catch {
      // User clicked Cancel — no action needed.
    }
  };

  const handleDelete = () => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const molecule = editor.render.ctab;

    // When nothing is selected, fall back to deleting the right-clicked monomer
    // SGroups (passed via context menu props) instead of an empty selection.
    const activeSelection = editor.selection();
    const itemsToDelete = activeSelection ?? {
      sgroups: functionalGroups?.map((fg) => fg.relatedSGroupId) ?? [],
    };

    const action = fromFragmentDeletion(molecule, itemsToDelete);
    editor.update(action);
    editor.selection(null);
    editor.focusCliparea();
  };

  /**
  Apply / remove hover highlight on all canvas instances of the same monomer code.
  */
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
        {...properties}
        data-testid={`${expandText}-option`}
        hidden={(parameters) =>
          isExpandMonomersDisabled || hidden(parameters, true)
        }
        onClick={(parameters) => action(parameters, true)}
        disabled={expandingDisabled}
      >
        {expandLabel}
      </Item>
      <Item
        {...properties}
        data-testid={`${collapseText}-option`}
        hidden={(parameters) => hidden(parameters, false)}
        onClick={(parameters) => action(parameters, false)}
      >
        {collapseLabel}
      </Item>
      <Item
        {...properties}
        data-testid="Remove Grouping-option"
        onClick={removeGroupingHandler}
        disabled={unknownOrAmbiguousMonomer}
        title={
          unknownOrAmbiguousMonomer
            ? t('components:contextMenu.cannotEditUnknownMonomer')
            : undefined
        }
      >
        {t('components:contextMenu.removeGrouping')}
      </Item>

      <MenuSeparator />

      {/* Group 2: Create Monomer (conditional) */}
      {createMonomerVisible && (
        <>
          <Item
            {...properties}
            data-testid="Create Monomer-option"
            onClick={() => handleEdit()}
          >
            {t('components:contextMenu.createMonomerItem')}
          </Item>
          <MenuSeparator />
        </>
      )}

      {/* Group 3: Edit Monomer / Edit All */}
      <Item
        {...properties}
        data-testid="Edit Monomer-option"
        onClick={() => handleEdit()}
        disabled={editMonomerDisabled}
        title={
          editMonomerDisabled
            ? t('components:contextMenu.selectSingleMonomerToEdit')
            : undefined
        }
      >
        {t('components:contextMenu.editMonomer')}
      </Item>
      <Item
        {...properties}
        data-testid="Edit All-option"
        onClick={handleEditAll}
        onMouseEnter={() => setEditAllHover(true)}
        onMouseLeave={() => setEditAllHover(false)}
        disabled={unknownOrAmbiguousMonomer}
        title={
          unknownOrAmbiguousMonomer
            ? t('components:contextMenu.cannotEditUnknownMonomer')
            : undefined
        }
      >
        {t('components:contextMenu.editAllMonomers', {
          code: monomerCode,
          count: totalMonomerCount,
        })}
      </Item>

      <MenuSeparator />

      {/* Group 4: Delete */}
      <Item
        {...properties}
        data-testid="Delete Monomer-option"
        onClick={handleDelete}
      >
        {t('common:delete')}
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
