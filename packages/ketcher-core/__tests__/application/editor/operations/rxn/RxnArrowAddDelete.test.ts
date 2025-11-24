import { RxnArrowAdd, RxnArrowDelete } from 'application/editor/operations';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import { Struct, RxnArrowMode, Vec2 } from 'domain/entities';
import { RenderOptions } from 'application/render/render.types';

describe('RxnArrowAdd and RxnArrowDelete operations', () => {
  let restruct: ReStruct;
  let render: Render;

  beforeEach(() => {
    const struct = new Struct();
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(struct, render);
  });

  it('should preserve height when adding and deleting elliptical arrow', () => {
    const pos = [new Vec2(0, 0), new Vec2(5, 0)];
    const mode = RxnArrowMode.EllipticalArcFilledBow;
    const height = 2.5;

    // Add arrow with height
    const addOp = new RxnArrowAdd(pos, mode, undefined, height);
    addOp.execute(restruct);

    const arrowId = addOp.data.id;
    if (arrowId == null) {
      throw new Error('Arrow id was not generated');
    }
    const addedArrow = restruct.molecule.rxnArrows.get(arrowId);

    // Verify height is preserved on add
    expect(addedArrow).toBeDefined();
    expect(addedArrow?.height).toBe(height);
    expect(addedArrow?.mode).toBe(mode);

    // Delete arrow
    const deleteOp = new RxnArrowDelete(arrowId);
    deleteOp.execute(restruct);

    // Verify height is stored in delete operation data
    expect(deleteOp.data.height).toBe(height);

    // Invert delete operation (re-add)
    const invertOp = deleteOp.invert();
    invertOp.execute(restruct);

    const restoredArrow = restruct.molecule.rxnArrows.get(arrowId);

    // Verify height is preserved after invert
    expect(restoredArrow).toBeDefined();
    expect(restoredArrow?.height).toBe(height);
    expect(restoredArrow?.mode).toBe(mode);
  });

  it('should handle non-elliptical arrow without height', () => {
    const pos = [new Vec2(0, 0), new Vec2(5, 0)];
    const mode = RxnArrowMode.OpenAngle;

    // Add arrow without height
    const addOp = new RxnArrowAdd(pos, mode);
    addOp.execute(restruct);

    const arrowId = addOp.data.id;
    if (arrowId == null) {
      throw new Error('Arrow id was not generated');
    }
    const addedArrow = restruct.molecule.rxnArrows.get(arrowId);

    // Verify arrow is added correctly without height
    expect(addedArrow).toBeDefined();
    expect(addedArrow?.mode).toBe(mode);
    expect(addedArrow?.height).toBeUndefined();
  });

  it('should preserve height through add-delete-invert cycle for all elliptical types', () => {
    const ellipticalModes = [
      RxnArrowMode.EllipticalArcFilledBow,
      RxnArrowMode.EllipticalArcFilledTriangle,
      RxnArrowMode.EllipticalArcOpenAngle,
      RxnArrowMode.EllipticalArcOpenHalfAngle,
    ];

    ellipticalModes.forEach((mode) => {
      const struct = new Struct();
      const options = {
        scale: 40,
        width: 100,
        height: 100,
      } as unknown as RenderOptions;
      const localRender = new Render(
        document as unknown as HTMLElement,
        options,
      );
      const localRestruct = new ReStruct(struct, localRender);
      const pos = [new Vec2(0, 0), new Vec2(5, 0)];
      const height = 3.0;

      // Add arrow
      const addOp = new RxnArrowAdd(pos, mode, undefined, height);
      addOp.execute(localRestruct);

      const arrowId = addOp.data.id;
      if (arrowId == null) {
        throw new Error('Arrow id was not generated');
      }

      // Delete arrow
      const deleteOp = new RxnArrowDelete(arrowId);
      deleteOp.execute(localRestruct);

      // Verify height is preserved in delete data
      expect(deleteOp.data.height).toBe(height);

      // Restore via invert
      const invertOp = deleteOp.invert();
      invertOp.execute(localRestruct);

      const restoredArrow = localRestruct.molecule.rxnArrows.get(arrowId);

      // Verify height is preserved
      expect(restoredArrow?.height).toBe(height);
      expect(restoredArrow?.mode).toBe(mode);
    });
  });
});
