import { useMemo } from 'react';
import {
  AtomLabel,
  AttachmentPointName,
  getAttachmentPointNumberFromLabel,
} from 'ketcher-core';
import { Editor } from '../../../../../editor';
import assert from 'assert';
import { isNumber } from 'lodash';
import { Option } from '../../../../component/form/Select';

export type AttachmentPointSelectData = {
  nameOptions: Array<Option>;
  leavingAtomOptions: Array<Option>;
  currentNameOption?: Option;
  currentLeavingAtomOption?: Option;
};

export const useAttachmentPointSelectsData = (
  editor: Editor,
  attachmentPointName: AttachmentPointName,
): AttachmentPointSelectData => {
  return useMemo(() => {
    assert(editor.monomerCreationState);

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
            {label}
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
  }, [editor, attachmentPointName]);
};
