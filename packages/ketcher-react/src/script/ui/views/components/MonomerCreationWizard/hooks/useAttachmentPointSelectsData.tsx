import {
  AtomLabel,
  AttachmentPointName,
  getAttachmentPointNumberFromLabel,
} from 'ketcher-core';
import { Editor } from '../../../../../editor';
import { Option } from '../../../../component/form/Select';

export type AttachmentPointSelectData = {
  nameOptions: Array<Option>;
  leavingAtomOptions: Array<Option>;
  currentNameOption?: Option;
  currentLeavingAtomOption?: Option;
};

// Helper to get the display label with hydrogens for an atom type
const getAtomTypeDisplayLabel = (
  label: string,
  implicitH: number,
): React.ReactNode => {
  if (implicitH > 0) {
    return implicitH > 1 ? (
      <>
        {label}
        {AtomLabel.H}
        <sub>{implicitH}</sub>
      </>
    ) : (
      <>
        {label}
        {AtomLabel.H}
      </>
    );
  }
  return label;
};

const getLeavingAtomOption = (
  label: AtomLabel,
  implicitH = label === AtomLabel.O ? 1 : 0,
): Option => ({
  value: label,
  label,
  children: <>{getAtomTypeDisplayLabel(label, implicitH)}</>,
});

export const createReadonlyAttachmentPointSelectData = (
  attachmentPointName: AttachmentPointName,
  leavingAtomLabel: AtomLabel,
): AttachmentPointSelectData => {
  const currentNameOption = {
    value: attachmentPointName,
    label: attachmentPointName,
  };
  const currentLeavingAtomOption = getLeavingAtomOption(leavingAtomLabel);

  return {
    nameOptions: [currentNameOption],
    leavingAtomOptions: [currentLeavingAtomOption],
    currentNameOption,
    currentLeavingAtomOption,
  };
};

export const useAttachmentPointSelectsData = (
  editor: Editor,
  attachmentPointName: AttachmentPointName,
): AttachmentPointSelectData | null => {
  if (!editor.monomerCreationState) {
    return null;
  }

  const { assignedAttachmentPoints } = editor.monomerCreationState;

  const atomPair = assignedAttachmentPoints.get(attachmentPointName);
  if (!atomPair) {
    return null;
  }

  const [attachmentAtomId, leavingAtomId] = atomPair;
  const attachmentAtom = editor.struct().atoms.get(attachmentAtomId);
  if (!attachmentAtom) {
    return null;
  }

  const leavingAtom = editor.struct().atoms.get(leavingAtomId);
  if (!leavingAtom) {
    return null;
  }

  const usedNumbers = Array.from(assignedAttachmentPoints.keys()).map((name) =>
    getAttachmentPointNumberFromLabel(name),
  );
  const maxUsedNumber = Math.max(...usedNumbers);

  const attachmentPointNameOptionsLength =
    maxUsedNumber <= 3 ? 3 : Math.min(maxUsedNumber, 8);

  const nameOptions: Option[] = Array.from({
    length: attachmentPointNameOptionsLength,
  }).map((_, i) => ({
    value: `R${i + 1}`,
    label: `R${i + 1}`,
  }));

  // Build atom type options for leaving group
  // According to requirements:
  // - H and OH should always be shown (in that order)
  // - If current LGA is different from H and OH, add it as third option
  const currentLeavingAtomLabel = leavingAtom.label;
  const currentLeavingAtomImplicitH = leavingAtom.implicitH;

  const isCurrentH = currentLeavingAtomLabel === AtomLabel.H;
  const isCurrentOH =
    currentLeavingAtomLabel === AtomLabel.O &&
    currentLeavingAtomImplicitH === 1;

  const leavingAtomOptions: Option[] = [
    getLeavingAtomOption(AtomLabel.H, 0),
    getLeavingAtomOption(AtomLabel.O),
  ];

  // Add current atom type as third option if it's different from H and OH
  if (!isCurrentH && !isCurrentOH) {
    leavingAtomOptions.push(
      getLeavingAtomOption(
        currentLeavingAtomLabel,
        currentLeavingAtomImplicitH,
      ),
    );
  }

  const currentNameOption = nameOptions.find(
    (option) => option.value === attachmentPointName,
  );

  // Find current leaving atom option - match by label
  const currentLeavingAtomOption = leavingAtomOptions.find((option) => {
    if (option.value === AtomLabel.H) {
      return isCurrentH;
    }
    if (option.value === AtomLabel.O) {
      return isCurrentOH;
    }
    return option.value === currentLeavingAtomLabel;
  });

  return {
    nameOptions,
    leavingAtomOptions,
    currentNameOption,
    currentLeavingAtomOption,
  };
};
