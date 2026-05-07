import { AttachmentPointName, AtomLabel, KetMonomerClass } from 'ketcher-core';

import { Editor } from 'src/script/editor/Editor';
import { validateMonomerLeavingGroups } from './MonomerLeavingGroupValidator';

const createEditorWithLeavingAtom = (label: AtomLabel): Editor =>
  ({
    struct: () => ({
      atoms: new Map([[1, { label }]]),
    }),
  } as unknown as Editor);

describe('validateMonomerLeavingGroups', () => {
  it('returns Base warning with hydroxyl copy when R1 leaving group is not oxygen', () => {
    const notifications = validateMonomerLeavingGroups(
      createEditorWithLeavingAtom(AtomLabel.H),
      KetMonomerClass.Base,
      new Map([[AttachmentPointName.R1, [0, 1]]]),
    );

    expect(notifications).toEqual(
      new Map([
        [
          'baseLeavingGroupWarning',
          {
            type: 'warning',
            message:
              'Base monomers typically have a hydroxyl as the leaving group for R1. Do you wish to proceed with the current attachment points?',
          },
        ],
      ]),
    );
  });

  it('does not return Base warning when R1 leaving group is oxygen', () => {
    const notifications = validateMonomerLeavingGroups(
      createEditorWithLeavingAtom(AtomLabel.O),
      KetMonomerClass.Base,
      new Map([[AttachmentPointName.R1, [0, 1]]]),
    );

    expect(notifications.size).toBe(0);
  });
});
