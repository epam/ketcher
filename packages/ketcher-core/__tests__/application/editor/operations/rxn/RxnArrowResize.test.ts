import {
  ARROW_MAX_SNAPPING_ANGLE,
  getSnappedArrowVector,
} from 'application/editor/operations/rxn/RxnArrowResize';
import { Vec2 } from 'domain/entities';

describe('Snap arrows to horizontal or vertical orientation', () => {
  it('snaps to positive x-axis correctly', () => {
    const arrow = new Vec2(1, 0);
    const oneDegreeInRadian = Math.PI / 180;
    const arrowToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian
    );
    const arrowToSnap2 = arrow.rotate(
      -(ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian)
    );
    expect(getSnappedArrowVector(arrowToSnap1).y).toBe(0);
    expect(getSnappedArrowVector(arrowToSnap2).y).toBe(0);
    const arrowNotToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    const arrowNotToSnap2 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    expect(getSnappedArrowVector(arrowNotToSnap1).y).not.toBe(0);
    expect(getSnappedArrowVector(arrowNotToSnap2).y).not.toBe(0);
  });

  it('snaps to positive y-axis correctly', () => {
    const arrow = new Vec2(0, 1);
    const oneDegreeInRadian = Math.PI / 180;
    const arrowToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian
    );
    const arrowToSnap2 = arrow.rotate(
      -(ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian)
    );
    expect(getSnappedArrowVector(arrowToSnap1).x).toBe(0);
    expect(getSnappedArrowVector(arrowToSnap2).x).toBe(0);
    const arrowNotToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    const arrowNotToSnap2 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    expect(getSnappedArrowVector(arrowNotToSnap1).x).not.toBe(0);
    expect(getSnappedArrowVector(arrowNotToSnap2).x).not.toBe(0);
  });

  it('snaps to negative x-axis correctly', () => {
    const arrow = new Vec2(-1, 0);
    const oneDegreeInRadian = Math.PI / 180;
    const arrowToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian
    );
    const arrowToSnap2 = arrow.rotate(
      -(ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian)
    );
    expect(getSnappedArrowVector(arrowToSnap1).y).toBe(0);
    expect(getSnappedArrowVector(arrowToSnap2).y).toBe(0);
    const arrowNotToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    const arrowNotToSnap2 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    expect(getSnappedArrowVector(arrowNotToSnap1).y).not.toBe(0);
    expect(getSnappedArrowVector(arrowNotToSnap2).y).not.toBe(0);
  });

  it('snaps to negative y-axis correctly', () => {
    const arrow = new Vec2(0, -1);
    const oneDegreeInRadian = Math.PI / 180;
    const arrowToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian
    );
    const arrowToSnap2 = arrow.rotate(
      -(ARROW_MAX_SNAPPING_ANGLE - oneDegreeInRadian)
    );
    expect(getSnappedArrowVector(arrowToSnap1).x).toBe(0);
    expect(getSnappedArrowVector(arrowToSnap2).x).toBe(0);
    const arrowNotToSnap1 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    const arrowNotToSnap2 = arrow.rotate(
      ARROW_MAX_SNAPPING_ANGLE + oneDegreeInRadian
    );
    expect(getSnappedArrowVector(arrowNotToSnap1).x).not.toBe(0);
    expect(getSnappedArrowVector(arrowNotToSnap2).x).not.toBe(0);
  });
});
