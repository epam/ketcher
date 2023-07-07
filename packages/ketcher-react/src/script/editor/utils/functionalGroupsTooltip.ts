import Editor from '../Editor';
import { Bond, SGroup, Struct } from 'ketcher-core';

let showTooltipTimer: ReturnType<typeof setTimeout> | null = null;

export const TOOLTIP_DELAY = 300;

type InfoPanelData = {
  groupStruct: Struct;
  sGroup: SGroup;
  event: PointerEvent;
};

/**
 * Why?
 * We need somehow display sgroup attachment points (tooltips, preview, templates),
 * But due to current rendering approach for sgroups (ungrouping sgroups)
 * - we have to use RGroup attachment points on atoms for this purposes
 */
function convertSGroupAttachmentPointsToRGroupAttachmentPoints(
  struct: Struct,
  sGroup: SGroup,
  atomsIdMapping: Map<number, number>
) {
  sGroup.getAttachmentPoints().forEach((attachmentPoint) => {
    const attachmentPointAtom = struct.atoms.get(
      atomsIdMapping.get(attachmentPoint.atomId)!
    )!;
    attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
  });
}

function makeStruct(editor: Editor, sGroup: SGroup) {
  const existingStruct = editor.struct();
  const struct = new Struct();
  const atomsIdMapping = new Map();

  sGroup.atoms.forEach((atomId) => {
    const atom = existingStruct.atoms.get(atomId)!;
    const atomIdInTooltip = struct.atoms.add(atom.clone());
    atomsIdMapping.set(atomId, atomIdInTooltip);
  });
  Array.from(existingStruct.bonds).forEach((value) => {
    const [_, bond] = value as [number, Bond];
    const clonedBond = bond.clone(atomsIdMapping);
    const isInsideSGroup =
      sGroup.atoms.includes(bond.begin) || sGroup.atoms.includes(bond.end);
    if (isInsideSGroup) {
      struct.bonds.add(clonedBond);
    }
  });

  convertSGroupAttachmentPointsToRGroupAttachmentPoints(
    struct,
    sGroup,
    atomsIdMapping
  );

  return struct;
}

function hideTooltip(editor: Editor) {
  editor.event.showInfo.dispatch(null);

  if (showTooltipTimer) {
    clearTimeout(showTooltipTimer);
  }
}

function showTooltip(editor: Editor, infoPanelData: InfoPanelData | null) {
  hideTooltip(editor);

  showTooltipTimer = setTimeout(() => {
    editor.event.showInfo.dispatch(infoPanelData);
  }, TOOLTIP_DELAY);
}

export function setFunctionalGroupsTooltip({
  editor,
  event,
  isShow,
}: {
  editor: Editor;
  event?: PointerEvent;
  isShow: boolean;
}) {
  if (!isShow) {
    hideTooltip(editor);

    return;
  }

  let infoPanelData: null | InfoPanelData = null;
  const checkFunctionGroupTypes = ['sgroups', 'functionalGroups'];
  const closestCollapsibleStructures = editor.findItem(
    event,
    checkFunctionGroupTypes
  );
  if (closestCollapsibleStructures && event) {
    const sGroup = editor
      .struct()
      ?.sgroups.get(closestCollapsibleStructures.id);
    const isSGroupPresent = sGroup?.hovering;
    const isShowingTooltip =
      !sGroup?.data.expanded || SGroup.isDataSGroup(sGroup);
    if (isSGroupPresent && isShowingTooltip) {
      const groupName = sGroup.data.name;
      const groupStruct = makeStruct(editor, sGroup);
      groupStruct.name = groupName;
      infoPanelData = {
        groupStruct,
        event,
        sGroup,
      };
    }
  }
  showTooltip(editor, infoPanelData);
}
