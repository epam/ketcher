import {
  CoreEditor,
  Entities,
  LabeledNodesWithPositionInSequence,
  Nucleotide,
  Nucleoside,
  SequenceMode,
} from 'ketcher-core';

export const getCountOfNucleoelements = <T extends { [key: string]: unknown }>(
  selections: T[],
): number =>
  selections.filter((selection) => {
    if (selection.type) {
      return (
        selection.type === Entities.Nucleotide ||
        selection.type === Entities.Nucleoside
      );
    } else if (selection.node) {
      return (
        selection.node instanceof Nucleotide ||
        selection.node instanceof Nucleoside
      );
    }
    return false;
  }).length;

export const getCountOfMirroredNucleoelements = (
  editor: CoreEditor | undefined,
  sequenceSelection: LabeledNodesWithPositionInSequence[],
): number =>
  editor?.mode instanceof SequenceMode
    ? editor.mode.countMirroredBaseChanges(sequenceSelection)
    : 0;
