jest.mock(
  'application/render/renderers/sequence/BaseSequenceItemRenderer',
  () => {
    class MockBaseSequenceItemRenderer {
      redrawCounter = jest.fn();
      redrawCaret = jest.fn();
      antisenseNodeRenderer?: MockBaseSequenceItemRenderer;
    }

    return { BaseSequenceItemRenderer: MockBaseSequenceItemRenderer };
  },
);
jest.mock('domain/serializers/ket/validate', () => ({
  validate: () => true,
}));

import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';

describe('SequenceRenderer.setCaretPosition', () => {
  it('redraws counters even when caret is placed after the last node', () => {
    const rendererMock =
      new (BaseSequenceItemRenderer as any)() as BaseSequenceItemRenderer & {
        redrawCounter: jest.Mock;
      };
    const twoStrandedNode = {
      senseNode: { renderer: rendererMock },
      antisenseNode: undefined,
    } as any;

    const nodes = [
      { twoStrandedNode, nodeIndexOverall: 0, chainIndex: 0, nodeIndex: 0 },
    ];

    const sequenceViewModelMock = {
      forEachNode: (callback: any) => {
        nodes.forEach((params) => callback(params));
      },
    };

    const originalSequenceViewModel = (SequenceRenderer as any)
      .sequenceViewModelValue;
    const originalCaretPosition = (SequenceRenderer as any).caretPositionValue;
    const originalLastUserDefinedCaretPosition = (SequenceRenderer as any)
      .lastUserDefinedCaretPositionValue;

    (SequenceRenderer as any).sequenceViewModelValue = sequenceViewModelMock;

    SequenceRenderer.setCaretPosition(1);

    expect(rendererMock.redrawCounter).toHaveBeenCalledWith(1);

    (SequenceRenderer as any).sequenceViewModelValue =
      originalSequenceViewModel;
    (SequenceRenderer as any).caretPositionValue = originalCaretPosition;
    (SequenceRenderer as any).lastUserDefinedCaretPositionValue =
      originalLastUserDefinedCaretPosition;
  });
});
