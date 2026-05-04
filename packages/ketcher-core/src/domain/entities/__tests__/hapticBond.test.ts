import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';

describe('HapticBond', () => {
  it('is a Bond instance with type HAPTIC, end=-1, and a sapId', () => {
    const hb = new HapticBond({ begin: 7, sapId: 3 });
    expect(hb).toBeInstanceOf(Bond);
    expect(hb.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
    expect(hb.begin).toBe(7);
    expect(hb.end).toBe(-1);
    expect(hb.sapId).toBe(3);
    expect(hb.isHaptic()).toBe(true);
  });

  it('clone preserves sapId, begin, and the -1 end sentinel', () => {
    const hb = new HapticBond({ begin: 2, sapId: 5 });
    const cp = hb.clone();
    expect(cp).toBeInstanceOf(HapticBond);
    expect(cp.begin).toBe(2);
    expect(cp.end).toBe(-1);
    expect(cp.sapId).toBe(5);
    expect(cp.isHaptic()).toBe(true);
  });

  it('clone with aidMap remaps begin (the metal atom id) but leaves end at -1', () => {
    const hb = new HapticBond({ begin: 2, sapId: 5 });
    const aidMap = new Map<number, number>([[2, 99]]);
    const cp = hb.clone(aidMap);
    expect(cp.begin).toBe(99);
    expect(cp.end).toBe(-1);
    expect(cp.sapId).toBe(5);
  });
});
