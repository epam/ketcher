import { SideChainConnectionBondRendererUtility } from 'application/render/renderers/PolymerBondRenderer/SideChainConnectionBondRendererUtility';

describe('SideChainConnectionBondRendererUtility', () => {
  describe('assignOuterConnectionLanes', () => {
    it('assigns separate lanes to overlapping routes on the same side', () => {
      const lanes =
        SideChainConnectionBondRendererUtility.assignOuterConnectionLanes([
          { id: 3, side: -1, start: 3, end: 8, edge: -240 },
          { id: 2, side: -1, start: 1, end: 2, edge: 0 },
          { id: 1, side: -1, start: 0, end: 5, edge: 120 },
        ]);

      expect(lanes).toEqual(
        new Map([
          [1, { index: 0, baseline: { edge: -240 } }],
          [2, { index: 1, baseline: { edge: -240 } }],
          [3, { index: 1, baseline: { edge: -240 } }],
        ]),
      );
    });

    it('reuses lanes for disjoint routes and assigns lanes independently per side', () => {
      const lanes =
        SideChainConnectionBondRendererUtility.assignOuterConnectionLanes([
          { id: 1, side: 1, start: 0, end: 2, edge: 120 },
          { id: 2, side: 1, start: 2, end: 4, edge: 0 },
          { id: 3, side: 1, start: 5, end: 7, edge: 240 },
          { id: 4, side: -1, start: 1, end: 6, edge: -30 },
        ]);

      expect(lanes).toEqual(
        new Map([
          [1, { index: 0, baseline: { edge: 120 } }],
          [2, { index: 1, baseline: { edge: 120 } }],
          [3, { index: 0, baseline: { edge: 240 } }],
          [4, { index: 0, baseline: { edge: -30 } }],
        ]),
      );
    });
  });
});
