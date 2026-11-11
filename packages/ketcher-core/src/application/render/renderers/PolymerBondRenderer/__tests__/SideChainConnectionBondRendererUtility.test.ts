import { SideChainConnectionBondRendererUtility } from 'application/render/renderers/PolymerBondRenderer/SideChainConnectionBondRendererUtility';

describe('SideChainConnectionBondRendererUtility', () => {
  describe('assignOuterConnectionLanes', () => {
    it('assigns separate lanes to overlapping routes on the same side', () => {
      const lanes =
        SideChainConnectionBondRendererUtility.assignOuterConnectionLanes([
          { id: 3, side: -1, start: 3, end: 8 },
          { id: 2, side: -1, start: 1, end: 2 },
          { id: 1, side: -1, start: 0, end: 5 },
        ]);

      expect(lanes).toEqual(
        new Map([
          [1, 0],
          [2, 1],
          [3, 1],
        ]),
      );
    });

    it('reuses lanes for disjoint routes and assigns lanes independently per side', () => {
      const lanes =
        SideChainConnectionBondRendererUtility.assignOuterConnectionLanes([
          { id: 1, side: 1, start: 0, end: 2 },
          { id: 2, side: 1, start: 2, end: 4 },
          { id: 3, side: 1, start: 5, end: 7 },
          { id: 4, side: -1, start: 1, end: 6 },
        ]);

      expect(lanes).toEqual(
        new Map([
          [1, 0],
          [2, 1],
          [3, 0],
          [4, 0],
        ]),
      );
    });
  });
});
