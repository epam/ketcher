import { Pile } from 'domain/entities/pile';

describe('unionIntersections', () => {
  it('unions multiple sets which have intersections', () => {
    const setA = new Pile([0, 1]);
    const setB = new Pile([1, 2, 3]);
    const setC = new Pile([2, 3]);

    const union = Pile.unionIntersections([setA, setB, setC]);

    expect(union).toHaveLength(1);
    expect(union[0]).toEqual(new Pile([0, 1, 2, 3]));
  });

  it('does not union sets which have no intersections', () => {
    const setA = new Pile([0, 1]);
    const setB = new Pile([2, 3]);

    const union = Pile.unionIntersections([setA, setB]);

    expect(union).toHaveLength(2);
    expect(union[0]).toEqual(setA);
    expect(union[1]).toEqual(setB);
  });

  // Combines above two situations
  it('unions multiple sets which have intersections, and skips sets without intersections', () => {
    const setA = new Pile([0, 1]);
    const setB = new Pile([1, 2, 3]);
    const setC = new Pile([2, 3]);
    const setD = new Pile([4, 5]);
    const setE = new Pile([6]);

    const union = Pile.unionIntersections([setA, setB, setC, setD, setE]);

    expect(union).toHaveLength(3);
    expect(union[0]).toEqual(new Pile([0, 1, 2, 3]));
    expect(union[1]).toEqual(setD);
    expect(union[2]).toEqual(setE);
  });
});
