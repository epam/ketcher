import {
  AtomLabel,
  AttachmentPointName,
  getAttachmentPointNumberFromLabel,
} from 'ketcher-core';
import { Editor } from '../../../../../editor';
import assert from 'assert';
import { isNumber } from 'lodash';
import { Option } from '../../../../component/form/Select';
import { ReactNode } from 'react';

export type AttachmentPointSelectData = {
  nameOptions: Array<Option>;
  leavingAtomOptions: Array<Option>;
  currentNameOption?: Option;
  currentLeavingAtomOption?: Option;
};

/**
 * Formats an atom label with subscripted numbers for display in dropdowns.
 * For example: "CH3" -> "CH₃", "NH2" -> "NH₂", "O" -> "O"
 * @param label The atom label to format (e.g., "CH3", "NH2", "O")
 * @returns React node with properly formatted label with subscripted numbers
 */
const formatAtomLabelWithSubscripts = (label: string): ReactNode => {
  // Match pattern: element symbols (uppercase followed by optional lowercase) followed by one or more digits
  // This handles cases like CH3, NH2, etc.
  const regex = /([A-Z][a-z]*)(\d+)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let keyCounter = 0;
  let match;

  while ((match = regex.exec(label)) !== null) {
    // Add any text before the match
    if (match.index > lastIndex) {
      parts.push(label.substring(lastIndex, match.index));
    }

    // Add the letters
    parts.push(match[1]);

    // Add the subscripted numbers with unique key
    parts.push(<sub key={`sub-${keyCounter++}`}>{match[2]}</sub>);

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < label.length) {
    parts.push(label.substring(lastIndex));
  }

  // If no matches were found, return the original label
  return parts.length > 0 ? <>{parts}</> : label;
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
  assert(atomPair);

  const [attachmentAtomId, leavingAtomId] = atomPair;
  const attachmentAtom = editor.struct().atoms.get(attachmentAtomId);
  assert(attachmentAtom);

  const attachmentPointNameOptionsLength = Math.max(
    ...Array.from(assignedAttachmentPoints.keys()).map((name) =>
      getAttachmentPointNumberFromLabel(name),
    ),
  );

  const nameOptions: Option[] = Array.from({
    length: attachmentPointNameOptionsLength,
  }).map((_, i) => ({
    value: `R${i + 1}`,
    label: `R${i + 1}`,
  }));

  let leavingAtomOptions: Option[] = editor
    .findPotentialLeavingAtoms(attachmentAtomId)
    .map((atom) => {
      const atomId = editor.struct().atoms.keyOf(atom);
      assert(isNumber(atomId));

      const { label, implicitH } = atom;

      const children = (
        <>
          {formatAtomLabelWithSubscripts(label)}
          {implicitH > 0 &&
            (implicitH > 1 ? (
              <>
                {AtomLabel.H}
                <sub>{implicitH}</sub>
              </>
            ) : (
              AtomLabel.H
            ))}
        </>
      );

      return {
        value: atomId.toString(),
        label: '',
        children,
      };
    });

  if (attachmentAtom.implicitH > 0) {
    leavingAtomOptions = leavingAtomOptions.concat({
      value: '-1',
      label: '',
      children: <i>{AtomLabel.H}</i>,
    });
  }

  const currentNameOption = nameOptions.find(
    (option) => option.value === attachmentPointName,
  );
  const currentLeavingAtomOption = leavingAtomOptions.find(
    (option) => option.value === leavingAtomId.toString(),
  );

  return {
    nameOptions,
    leavingAtomOptions,
    currentNameOption,
    currentLeavingAtomOption,
  };
};
