import assert from 'assert';
import { Bond, SGroup, Struct } from 'ketcher-core';
import Editor from '../Editor';

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
  atomsIdMapping: Map<number, number>,
) {
  sGroup.getAttachmentPoints().forEach((attachmentPoint) => {
    const atomId = atomsIdMapping.get(attachmentPoint.atomId);
    assert(atomId != null);
    const attachmentPointAtom = struct.atoms.get(atomId);
    assert(attachmentPointAtom != null);
    attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
    const rgroupAttachmentPoint =
      attachmentPoint.convertToRGroupAttachmentPointForDisplayPurpose(atomId);
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
}

function makeStruct(editor: Editor, sGroup: SGroup) {
  const existingStruct = editor.struct();
  const struct = new Struct();

  const atomsIdMapping = makeAtoms(sGroup, existingStruct, struct);
  makeRGroupAttachmentPoints(sGroup, existingStruct, struct, atomsIdMapping);
  makeBonds(sGroup, existingStruct, struct, atomsIdMapping);

  convertSGroupAttachmentPointsToRGroupAttachmentPoints(
    struct,
    sGroup,
    atomsIdMapping,
  );

  return struct;
}

function makeBonds(
  sGroup: SGroup,
  existingStruct: Struct,
  struct: Struct,
  atomsIdMapping: Map<number, number>,
) {
  Array.from(existingStruct.bonds).forEach((value) => {
    const [_, bond] = value as [number, Bond];
    const clonedBond = bond.clone(atomsIdMapping);
    const isInsideSGroup =
      sGroup.atoms.includes(bond.begin) || sGroup.atoms.includes(bond.end);
    if (isInsideSGroup) {
      struct.bonds.add(clonedBond);
    }
  });
}

function makeRGroupAttachmentPoints(
  sGroup: SGroup,
  existingStruct: Struct,
  struct: Struct,
  atomsIdMapping: Map<number, number>,
) {
  sGroup.atoms.forEach((atomId: number) => {
    const rgroupAttachmentPointIds =
      existingStruct.getRGroupAttachmentPointsByAtomId(atomId);
    rgroupAttachmentPointIds.forEach((id) => {
      const rgroupAttachmentPoint =
        existingStruct.rgroupAttachmentPoints.get(id);
      assert(rgroupAttachmentPoint != null);
      struct.rgroupAttachmentPoints.add(
        rgroupAttachmentPoint.clone(atomsIdMapping),
      );
    });
  });
}

function makeAtoms(sGroup: SGroup, existingStruct: Struct, struct: Struct) {
  const atomsIdMapping = new Map();
  sGroup.atoms.forEach((atomId: number) => {
    const atom = existingStruct.atoms.get(atomId);
    assert(atom != null);
    const atomIdInTooltip = struct.atoms.add(atom.clone());
    atomsIdMapping.set(atomId, atomIdInTooltip);
  });
  return atomsIdMapping;
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
    checkFunctionGroupTypes,
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
