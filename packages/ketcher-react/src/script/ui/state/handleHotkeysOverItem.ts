/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch } from 'redux';
import {
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromBondsAttrs,
  fromFragmentDeletion,
  FunctionalGroup,
  Atom,
  Action,
  KetcherLogger,
  bondChangingAction,
} from 'ketcher-core';
import { STRUCT_TYPE } from 'src/constants';
import { openDialog } from './modal';
import { getSelectedAtoms } from '../../editor/tool/select';
import { onAction } from './shared';
import type { Editor } from '../../editor';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import {
  type ElementFormData,
  fromAtom,
  toAtom,
  fromBond,
  toBond,
} from '../data/convert/structconv';
import SGroupTool from '../../editor/tool/sgroup';
import { deleteFunctionalGroups } from '../../editor/tool/helper/deleteFunctionalGroups';
import TemplateTool from '../../editor/tool/template';
import { dispatchMonomerOrGroupDialog } from '../../editor/tool/monomerDialog.helpers';
import { runDeleteWithAttachmentGroupSplitConfirm } from '../../editor/utils/attachmentGroupSplit';

type TNewAction = {
  tool?: string;
  dialog?: string;
  opts?: any;
};

type HandlersProperties = {
  hoveredItemId: number;
  newAction: TNewAction;
  editor: Editor;
  dispatch: Dispatch;
};

type HandleHotkeyOverItemProperties = {
  hoveredItem: Record<string, number>;
  newAction: TNewAction;
  editor: Editor;
  dispatch: Dispatch;
};

export function handleHotkeyOverItem(
  properties: HandleHotkeyOverItemProperties,
) {
  if (properties.newAction.tool === 'eraser') {
    handleEraser(properties);
  } else if (properties.newAction.dialog) {
    handleDialog(properties);
  } else if (properties.newAction.tool) {
    handleTool(properties);
  } else {
    handleOtherActions(properties);
  }
}

function handleOtherActions({
  dispatch,
  newAction,
}: HandleHotkeyOverItemProperties) {
  dispatch(onAction(newAction));
}

function eraseItem({
  editor,
  item,
}: {
  editor: Editor;
  item: Record<string, number[]>;
}) {
  runDeleteWithAttachmentGroupSplitConfirm(
    editor,
    item,
    () => fromFragmentDeletion(editor.render.ctab, item),
    () => editor.hover(null),
  );
}

function handleEraser({
  editor,
  hoveredItem,
  newAction,
  dispatch,
}: HandleHotkeyOverItemProperties) {
  const item = mapItemsToArrays(hoveredItem);
  const itemType = Object.keys(hoveredItem)[0];
  const activeTool = editor.tool();

  if (activeTool instanceof TemplateTool) {
    activeTool.templatePreview?.hideConnectedPreview();
  }

  if ([STRUCT_TYPE.atoms, STRUCT_TYPE.bonds].includes(itemType)) {
    isFunctionalGroupChange(
      { editor, hoveredItemId: item[itemType][0], newAction, dispatch },
      itemType,
    ).then((resource) => {
      if (resource) {
        eraseItem({ editor, item });
      }
    });
  } else {
    eraseItem({ editor, item });
  }
}

function handleDialog({
  hoveredItem,
  newAction,
  editor,
  dispatch,
}: HandleHotkeyOverItemProperties) {
  const dialogType = Object.keys(hoveredItem)[0];
  const dialogHandler = getDialogHandler(dialogType);
  const hoveredItemId = hoveredItem[dialogType];

  if (dialogHandler) {
    const properties: HandlersProperties = {
      hoveredItemId,
      newAction,
      editor,
      dispatch,
    };
    return dialogHandler(properties);
  }
}

function getDialogHandler(itemType: string) {
  const dialogs = {
    atoms: (properties: HandlersProperties) =>
      handleAtomPropertiesDialog(properties),
    bonds: (properties: HandlersProperties) =>
      handleBondPropertiesDialog(properties),
  };

  const dialog = dialogs[itemType];
  return dialog;
}

function handleAtomPropertiesDialog({
  hoveredItemId,
  newAction,
  editor,
  dispatch,
}: HandlersProperties) {
  const selection = editor.selection();
  const restruct = editor.render.ctab;

  if (selection?.atoms?.includes(hoveredItemId)) {
    const atoms = getSelectedAtoms(selection, restruct.molecule);
    const changeAtomPromise = editor.event.elementEdit.dispatch(atoms);

    updateSelectedAtoms({
      atoms: selection.atoms || [],
      editor,
      changeAtomPromise,
    });
  } else {
    const atomFromStruct = restruct.atoms.get(hoveredItemId);
    const convertedAtomForModal = fromAtom(atomFromStruct?.a);

    if (!newAction.dialog) return;

    openDialog(dispatch, newAction.dialog, convertedAtomForModal ?? undefined)
      .then((resource) => {
        const updatedAtom = fromAtomsAttrs(
          restruct,
          hoveredItemId,
          toAtom(resource as ElementFormData),
          false,
        );

        editor.update(updatedAtom);
      })
      .catch((error) => {
        KetcherLogger.error(
          'handleHotkeysOverItem.ts::handleAtomPropsDialog',
          error,
        );
      });
  }
}

function handleBondPropertiesDialog({
  hoveredItemId,
  newAction,
  editor,
  dispatch,
}: HandlersProperties) {
  const restruct = editor.render.ctab;
  const bondFromStruct = restruct.bonds.get(hoveredItemId);
  const convertedBondForModal = fromBond(bondFromStruct?.b);

  if (!newAction.dialog) return;

  openDialog(dispatch, newAction.dialog, convertedBondForModal ?? undefined)
    .then((resource) => {
      const convertedBond = toBond(resource as ReturnType<typeof fromBond>);
      if (!convertedBond) return;

      const updatedBond = fromBondsAttrs(
        restruct,
        hoveredItemId,
        convertedBond,
        false,
      );

      editor.update(updatedBond);
    })
    .catch((error) => {
      KetcherLogger.error(
        'handleHoutkeysOverItem.ts::handleBondPropsDialog',
        error,
      );
    });
}

function handleTool({
  hoveredItem,
  newAction,
  editor,
  dispatch,
}: HandleHotkeyOverItemProperties) {
  for (const item in hoveredItem) {
    const toolHandler = getToolHandler(item, newAction.tool);
    const isChangeStructureTool = newAction.tool !== 'hand';
    const hoveredItemId = hoveredItem[item];

    if (toolHandler) {
      const properties: HandlersProperties = {
        hoveredItemId,
        editor,
        newAction,
        dispatch,
      };
      isFunctionalGroupChange(properties, item).then((result) => {
        if (!result && isChangeStructureTool) return;
        toolHandler(properties);
      });
    }
  }
}

async function isFunctionalGroupChange(
  properties: HandlersProperties,
  type: string,
): Promise<boolean> {
  if (type === 'sgroups') return true;
  return await isChangingFunctionalGroup(properties, type);
}

function getToolHandler(itemType: string, toolName = '') {
  const items = {
    atoms: {
      atom: (properties: HandlersProperties) => handleAtomTool(properties),
      bond: (properties: HandlersProperties) => handleBondTool(properties),
      charge: (properties: HandlersProperties) => handleChargeTool(properties),
      rgroupatom: (properties: HandlersProperties) =>
        handleRGroupAtomTool(properties),
      sgroup: ({ editor, hoveredItemId }: HandlersProperties) => {
        SGroupTool.sgroupDialog(editor, hoveredItemId);
      },
      hand: ({ dispatch }: HandlersProperties) =>
        dispatch(onAction({ tool: 'hand' })),
    },
    bonds: {
      bond: (properties: HandlersProperties) =>
        handleBondTypeChangeTool(properties),
    },
    sgroups: {
      atom: (properties: HandlersProperties) => handleSgroupsTool(properties),
    },
    _default: {},
  };

  const item = items[itemType];

  if (item) {
    return item[toolName];
  }
  return items._default[toolName];
}

function handleAtomTool({
  hoveredItemId,
  newAction,
  editor,
}: HandlersProperties) {
  const atomProperties = { ...newAction.opts };
  const updatedAtoms = fromAtomsAttrs(
    editor.render.ctab,
    hoveredItemId,
    atomProperties,
    true,
  );
  editor.update(updatedAtoms);
}

function handleSgroupsTool({
  hoveredItemId,
  newAction,
  editor,
}: HandlersProperties) {
  const atomProperties = { ...newAction.opts };
  const action = new Action();
  const ctab = editor.render.ctab;
  const sGroup = ctab.molecule.sgroups.get(hoveredItemId);
  if (sGroup == null) {
    throw new Error(
      `unexpected error, sgroup with id "${hoveredItemId}" is not found`,
    );
  }
  const { atomId: SGroupPositionAtomId } = sGroup.getContractedPosition(
    ctab.molecule,
  );
  deleteFunctionalGroups([hoveredItemId], ctab, action);
  action.mergeWith(
    fromAtomsAttrs(
      editor.render.ctab,
      SGroupPositionAtomId,
      atomProperties,
      true,
    ),
  );
  editor.update(action);
}

function handleBondTool({
  hoveredItemId,
  newAction,
  editor,
}: HandlersProperties) {
  const newBond = fromBondAddition(
    editor.render.ctab,
    newAction.opts,
    hoveredItemId,
    { label: 'C' },
  )[0];
  editor.update(newBond);
}

function handleBondTypeChangeTool({
  hoveredItemId,
  newAction,
  editor,
}: HandlersProperties) {
  const restruct = editor.render.ctab;
  const bond = restruct.bonds.get(hoveredItemId)?.b;
  if (!bond) return;

  const action = bondChangingAction(restruct, hoveredItemId, bond, {
    ...newAction.opts,
  });
  editor.update(action);
}

function handleChargeTool({
  hoveredItemId,
  newAction,
  editor,
}: HandlersProperties) {
  const existingAtom = editor.render.ctab.atoms.get(hoveredItemId)?.a;
  if (existingAtom) {
    const updatedAtom = fromAtomsAttrs(
      editor.render.ctab,
      hoveredItemId,
      {
        charge: existingAtom.charge + newAction.opts,
      },
      null,
    );
    editor.update(updatedAtom);
  }
}

function mapItemsToArrays(
  items: Record<string, number>,
): Record<string, number[]> {
  const mappedItems = {};
  for (const item in items) {
    mappedItems[item] = [items[item]];
  }
  return mappedItems;
}

async function handleRGroupAtomTool({
  hoveredItemId,
  editor,
}: HandlersProperties) {
  const struct = editor.render.ctab.molecule;
  const atom =
    hoveredItemId || hoveredItemId === 0
      ? struct.atoms.get(hoveredItemId)
      : null;
  const rglabel = atom ? atom.rglabel : 0;
  const label = atom ? atom.label : 'R#';

  try {
    let element = await editor.event.elementEdit.dispatch({
      label: 'R#',
      rglabel,
      fragId: atom ? atom.fragment : null,
    });
    element = { ...Atom.attrlist, ...element };

    if (!hoveredItemId && hoveredItemId !== 0 && element.rglabel) {
      editor.update(fromAtomAddition(editor.render.ctab, null, element));
    } else if (rglabel !== element.rglabel) {
      if (label !== 'R#' && !element.rglabel) {
        element.label = label;
      }

      editor.update(
        fromAtomsAttrs(editor.render.ctab, hoveredItemId, element, false),
      );
    }
  } catch (error) {
    KetcherLogger.error(
      'handleHotkeysOverItem.ts::handleRGroupAtomTool',
      error,
    );
  } // w/o changes
}

function getFunctionalGroupIdByItem(
  editor: Editor,
  hoveredItemId: number,
  type: string,
): number | null {
  const molecule = editor.render.ctab.molecule;
  const functionalGroups = molecule.functionalGroups;

  return type === 'atoms'
    ? FunctionalGroup.findFunctionalGroupByAtom(functionalGroups, hoveredItemId)
    : FunctionalGroup.findFunctionalGroupByBond(
        molecule,
        functionalGroups,
        hoveredItemId,
      );
}

async function isChangingFunctionalGroup(
  { hoveredItemId, editor }: HandlersProperties,
  type: string,
) {
  const fgId = getFunctionalGroupIdByItem(editor, hoveredItemId, type);

  if (fgId !== null) {
    dispatchMonomerOrGroupDialog(editor, [fgId]);

    return false;
  }

  return true;
}
