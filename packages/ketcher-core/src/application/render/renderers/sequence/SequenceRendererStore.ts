import type { SequenceViewModel } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModel';

// Module-level state store extracted to break circular dependencies:
// SequenceRenderer → ... → BaseSequenceItemRenderer → SequenceRenderer
// SequenceRenderer ↔ NewSequenceButton
let _sequenceViewModel: SequenceViewModel;

export const sequenceRendererStore = {
  get sequenceViewModel(): SequenceViewModel {
    return _sequenceViewModel;
  },
  setSequenceViewModel(value: SequenceViewModel): void {
    _sequenceViewModel = value;
  },
};
