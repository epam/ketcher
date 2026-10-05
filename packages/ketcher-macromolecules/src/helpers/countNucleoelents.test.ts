import {
  CoreEditor,
  Entities,
  LabeledNodesWithPositionInSequence,
  SequenceMode,
  STRAND_TYPE,
} from 'ketcher-core';
import { getCountOfMirroredNucleoelements } from './countNucleoelents';

const selection: LabeledNodesWithPositionInSequence[] = [
  {
    type: Entities.Nucleotide,
    baseLabel: 'A',
    phosphateLabel: 'P',
    sugarLabel: 'R',
    nodeIndexOverall: 0,
    hasR1Connection: false,
    strandType: STRAND_TYPE.SENSE,
  },
];

describe('getCountOfMirroredNucleoelements', () => {
  it('is 0 without an editor', () => {
    expect(getCountOfMirroredNucleoelements(undefined, selection)).toBe(0);
  });

  it('is 0 when the editor is not in sequence mode', () => {
    const editor = { mode: {} } as unknown as CoreEditor;

    expect(getCountOfMirroredNucleoelements(editor, selection)).toBe(0);
  });

  it('asks the sequence mode for the count of mirrored base changes', () => {
    const countMirroredBaseChanges = jest.fn(() => 3);
    const editor = {
      mode: Object.assign(Object.create(SequenceMode.prototype), {
        countMirroredBaseChanges,
      }),
    } as unknown as CoreEditor;

    expect(getCountOfMirroredNucleoelements(editor, selection)).toBe(3);
    expect(countMirroredBaseChanges).toHaveBeenCalledWith(selection);
  });
});
