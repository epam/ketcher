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
import type { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import type { Chain } from 'domain/entities/monomer-chains/Chain';
import type { SequenceNode } from 'domain/entities/monomer-chains/types';

describe('SequenceRenderer.setCaretPosition', () => {
  it('redraws counters even when caret is placed after the last node', () => {
    type MockRenderer = {
      redrawCounter: jest.Mock;
      redrawCaret: jest.Mock;
      antisenseNodeRenderer?: MockRenderer;
    };
    const MockBaseSequenceItemRenderer =
      BaseSequenceItemRenderer as unknown as new () => MockRenderer;
    const rendererMock = new MockBaseSequenceItemRenderer();
    const twoStrandedNode: ITwoStrandedChainItem = {
      senseNode: { renderer: rendererMock } as unknown as SequenceNode,
      antisenseNode: undefined,
      senseNodeIndex: 0,
      chain: {} as Chain,
    };

    const nodes: Array<{
      twoStrandedNode: ITwoStrandedChainItem;
      nodeIndexOverall: number;
      chainIndex: number;
      nodeIndex: number;
    }> = [
      { twoStrandedNode, nodeIndexOverall: 0, chainIndex: 0, nodeIndex: 0 },
    ];

    const sequenceViewModelMock = {
      forEachNode: (callback: (params: typeof nodes[number]) => void) => {
        nodes.forEach((params) => callback(params));
      },
    };

    type SequenceRendererState = {
      sequenceViewModelValue: unknown;
      caretPositionValue: number;
      lastUserDefinedCaretPositionValue: number;
    };
    // Directly manipulate internal static state to control caret/index mapping
    // for this isolated scenario and restore it afterwards.
    const sequenceRendererState =
      SequenceRenderer as unknown as SequenceRendererState;
    const originalSequenceViewModel =
      sequenceRendererState.sequenceViewModelValue;
    const originalCaretPosition = sequenceRendererState.caretPositionValue;
    const originalLastUserDefinedCaretPosition =
      sequenceRendererState.lastUserDefinedCaretPositionValue;

    sequenceRendererState.sequenceViewModelValue = sequenceViewModelMock;

    SequenceRenderer.setCaretPosition(1);

    expect(rendererMock.redrawCounter).toHaveBeenCalledWith(1);

    sequenceRendererState.sequenceViewModelValue = originalSequenceViewModel;
    sequenceRendererState.caretPositionValue = originalCaretPosition;
    sequenceRendererState.lastUserDefinedCaretPositionValue =
      originalLastUserDefinedCaretPosition;
  });
});
