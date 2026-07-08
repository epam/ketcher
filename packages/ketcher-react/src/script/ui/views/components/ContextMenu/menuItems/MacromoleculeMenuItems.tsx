import type {
  MacromoleculeContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import useMonomerExpansionHandlers, {
  canExpandMonomer,
} from '../hooks/useMonomerExpansionHandlers';
import {
  type Bond,
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
  const functionalGroups = props.propsFromTrigger?.functionalGroups;
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
  const editInstanceDisabled =
    multipleMonomersSelected ||
    !(sgroup instanceof MonomerMicromolecule) ||
    isAmbiguousMonomerLibraryItem(sgroup.monomer.monomerItem) ||
    sgroup.monomer.monomerItem.props.unresolved;

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

  return (
    <>
      <Item
        {...props}
        data-testid="Edit Instance-option"
        onClick={() => handleEdit()}
        disabled={editInstanceDisabled}
      >
        Edit Instance
      </Item>
      <Item
        {...props}
        data-testid="Edit All Instances-option"
        onClick={() => handleEdit(true)}
        disabled={editInstanceDisabled}
      >
        Edit All Instances
      </Item>
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
    </>
  );
};

export default MacromoleculeMenuItems;
