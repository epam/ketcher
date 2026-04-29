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

// Unicode subscript digits — used instead of <sub> so the subscript renders
// correctly inside the MUI Select dropdown regardless of dropdown styling.
const SUBSCRIPT_DIGITS = [
  '₀',
  '₁',
  '₂',
  '₃',
  '₄',
  '₅',
  '₆',
  '₇',
  '₈',
  '₉',
];

export const toSubscript = (n: number): string =>
  String(n)
    .split('')
    .map((digit) => SUBSCRIPT_DIGITS[Number(digit)] ?? digit)
    .join('');

// Helper to get the display label with hydrogens for an atom type
const getAtomTypeDisplayLabel = (
  label: string,
  implicitH: number,
): React.ReactNode => {
  if (implicitH > 0) {
    return implicitH > 1
      ? `${label}${AtomLabel.H}${toSubscript(implicitH)}`
      : `${label}${AtomLabel.H}`;
  }
  return label;
};

const getLeavingAtomOption = (
  label: string,
  implicitH = label === AtomLabel.O ? 1 : 0,
): Option => ({
  value: label,
  label,
  children: <>{getAtomTypeDisplayLabel(label, implicitH)}</>,
});

/**
 * Builds the leaving-atom option list shared by both regular and readonly
 * attachment points:
 * - H and OH are always present (in that order)
 * - If the current leaving atom differs from both, it is appended as a third option
 */
const buildLeavingAtomOptions = (
  currentLabel: string,
  currentImplicitH = currentLabel === AtomLabel.O ? 1 : 0,
): { options: Option[]; currentOption: Option } => {
  const isCurrentH = currentLabel === AtomLabel.H;
  const isCurrentOH = currentLabel === AtomLabel.O && currentImplicitH === 1;

  const options: Option[] = [
    getLeavingAtomOption(AtomLabel.H, 0),
    getLeavingAtomOption(AtomLabel.O),
  ];

  if (!isCurrentH && !isCurrentOH) {
    options.push(getLeavingAtomOption(currentLabel, currentImplicitH));
  }

  const currentOption = options.find((opt) => {
    if (opt.value === AtomLabel.H) return isCurrentH;
    if (opt.value === AtomLabel.O) return isCurrentOH;
    return opt.value === currentLabel;
  }) as Option;

  return { options, currentOption };
};

export const createReadonlyAttachmentPointSelectData = (
  attachmentPointName: AttachmentPointName,
  leavingAtomLabel: AtomLabel,
): AttachmentPointSelectData => {
  const currentNameOption = {
    value: attachmentPointName,
    label: attachmentPointName,
  };
  const {
    options: leavingAtomOptions,
    currentOption: currentLeavingAtomOption,
  } = buildLeavingAtomOptions(leavingAtomLabel);

  return {
    nameOptions: [currentNameOption],
    leavingAtomOptions,
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
  const currentLeavingAtomLabel = leavingAtom.label;
  const currentLeavingAtomImplicitH = leavingAtom.implicitH;

  const {
    options: leavingAtomOptions,
    currentOption: currentLeavingAtomOption,
  } = buildLeavingAtomOptions(
    currentLeavingAtomLabel,
    currentLeavingAtomImplicitH,
  );

  const currentNameOption = nameOptions.find(
    (option) => option.value === attachmentPointName,
  );

  return {
    nameOptions,
    leavingAtomOptions,
    currentNameOption,
    currentLeavingAtomOption,
  };
};
