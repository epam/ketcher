import { SideChainConnectionBondRendererUtility } from 'application/render/renderers/PolymerBondRenderer/SideChainConnectionBondRendererUtility';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { Vec2 } from 'domain/entities';

describe('SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath', () => {
  const { bondEndLength, smoothCornerSize } =
    SideChainConnectionBondRendererUtility;
  const verticalLineX = 50 - SnakeLayoutCellWidth / 2 - bondEndLength;

  it('leaves and enters both monomers from the left, outside their cell column', () => {
    const path =
      SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath(
        new Vec2(50, 50),
        new Vec2(50, 170),
      );

    expect(path).toBe(
      [
        'M 50,50',
        `H ${verticalLineX + smoothCornerSize}`,
        `q -${smoothCornerSize},0 -${smoothCornerSize},${smoothCornerSize}`,
        `V ${170 - smoothCornerSize}`,
        `q 0,${smoothCornerSize} ${smoothCornerSize},${smoothCornerSize}`,
        'L 50,170',
      ].join(' '),
    );
  });

  it('bends upwards when the second monomer is above the first one', () => {
    const path =
      SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath(
        new Vec2(50, 170),
        new Vec2(50, 50),
      );

    expect(path).toBe(
      [
        'M 50,170',
        `H ${verticalLineX + smoothCornerSize}`,
        `q -${smoothCornerSize},0 -${smoothCornerSize},-${smoothCornerSize}`,
        `V ${50 + smoothCornerSize}`,
        `q 0,-${smoothCornerSize} ${smoothCornerSize},-${smoothCornerSize}`,
        'L 50,50',
      ].join(' '),
    );
  });
});

describe('SideChainConnectionBondRendererUtility.assignLanes', () => {
  it('keeps connections on rows that do not overlap in the first lane', () => {
    expect(
      SideChainConnectionBondRendererUtility.assignLanes([
        { start: 0, end: 1 },
        { start: 2, end: 3 },
      ]),
    ).toEqual([0, 0]);
  });

  it('puts a nested connection inside the one that encloses it', () => {
    expect(
      SideChainConnectionBondRendererUtility.assignLanes([
        { start: 4, end: 7 },
        { start: 5, end: 6 },
      ]),
    ).toEqual([1, 0]);
  });

  it('separates partially overlapping connections', () => {
    expect(
      SideChainConnectionBondRendererUtility.assignLanes([
        { start: 0, end: 2 },
        { start: 1, end: 3 },
      ]),
    ).toEqual([0, 1]);
  });
});

describe('SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath lane', () => {
  it('moves the vertical part further left for each lane', () => {
    const { laneSpacing } = SideChainConnectionBondRendererUtility;
    const firstLanePath =
      SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath(
        new Vec2(50, 50),
        new Vec2(50, 170),
      );
    const secondLanePath =
      SideChainConnectionBondRendererUtility.generateLeftSideConnectionPath(
        new Vec2(50, 50),
        new Vec2(50, 170),
        1,
      );
    const getFirstHorizontalX = (path: string) =>
      Number(/H (-?[\d.]+)/.exec(path)?.[1]);

    expect(getFirstHorizontalX(secondLanePath)).toBe(
      getFirstHorizontalX(firstLanePath) - laneSpacing,
    );
  });
});
