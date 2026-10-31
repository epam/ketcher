import { RxnArrow, RxnArrowMode, RxnPlus, Struct, Vec2 } from 'domain/entities';

describe('Struct.isReaction', () => {
  it('derives reaction state from symbols added directly to the pools', () => {
    const struct = new Struct();
    expect(struct.isReaction).toBe(false);
    const arrow = struct.rxnArrows.add(
      new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(0, 0), new Vec2(5, 0)],
      }),
    );
    expect(struct.isReaction).toBe(true);
    expect(struct.clone().isReaction).toBe(true);
    struct.rxnArrows.delete(arrow);
    expect(struct.isReaction).toBe(false);
  });

  it('recognizes reaction plus signs consistently with isRxn', () => {
    const struct = new Struct();
    const plus = struct.rxnPluses.add(new RxnPlus());
    expect(struct.isReaction).toBe(true);
    expect(struct.isReaction).toBe(struct.isRxn());
    struct.rxnPluses.delete(plus);
    expect(struct.isReaction).toBe(false);
  });
});
