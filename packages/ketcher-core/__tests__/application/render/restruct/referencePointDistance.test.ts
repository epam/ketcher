import ReRxnArrow from 'application/render/restruct/rerxnarrow';
import ReSimpleObject from 'application/render/restruct/resimpleObject';
import { SimpleObjectMode, Vec2 } from 'domain/entities';
import { RxnArrowMode } from 'domain/entities/rxnArrow';

describe('reference point distances', () => {
  const start = new Vec2(0, 0);
  const end = new Vec2(10, 0);
  const objects = [
    new ReRxnArrow({ mode: RxnArrowMode.OpenAngle, pos: [start, end] }),
    new ReSimpleObject({
      mode: SimpleObjectMode.line,
      pos: [start, end],
    }),
  ];

  it.each(objects)(
    'returns no reference point when there are none',
    (object) => {
      vi.spyOn(object, 'getReferencePoints').mockReturnValueOnce([]);

      expect(object.getReferencePointDistance(new Vec2(2, 0))).toEqual({
        minDist: Infinity,
        refPoint: null,
      });
    },
  );

  it.each(objects)('chooses the closest reference point', (object) => {
    const result = object.getReferencePointDistance(new Vec2(9, 0));

    expect(result).toEqual({ minDist: 1, refPoint: end });
  });
});
