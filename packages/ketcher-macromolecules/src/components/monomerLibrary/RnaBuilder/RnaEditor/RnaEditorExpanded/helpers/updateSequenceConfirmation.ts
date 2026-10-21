// The confirmation is needed when more than one nucleotide is modified, or
// when the update will also change unselected nucleotides on the other strand.
export const isUpdateSequenceConfirmationNeeded = (
  countOfNucleoelements: number,
  countOfMirroredNucleoelements: number,
) => countOfNucleoelements > 1 || countOfMirroredNucleoelements > 0;
