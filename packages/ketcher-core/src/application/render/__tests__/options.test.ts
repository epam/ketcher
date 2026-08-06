import { getOptionsWithConvertedUnits } from '../options';
import { MeasurementUnits } from '../render.types';

describe('getOptionsWithConvertedUnits - bondThicknessInPx', () => {
  it('converts 0.3 pt to px without rounding to zero (regression #5544)', () => {
    const result = getOptionsWithConvertedUnits({
      bondThickness: 0.3,
      bondThicknessUnit: MeasurementUnits.Pt,
    });
    // 0.3 pt * 1.333333 ≈ 0.4 px — must not be rounded to 0
    expect(result.bondThicknessInPx).toBeGreaterThan(0);
    expect(result.bondThicknessInPx).toBeCloseTo(0.4, 1);
  });

  it('converts 0.4 px to px without rounding to zero (regression #5544)', () => {
    const result = getOptionsWithConvertedUnits({
      bondThickness: 0.4,
      bondThicknessUnit: MeasurementUnits.Px,
    });
    expect(result.bondThicknessInPx).toBeGreaterThan(0);
    expect(result.bondThicknessInPx).toBeCloseTo(0.4, 3);
  });

  it('converts 2 px to px correctly', () => {
    const result = getOptionsWithConvertedUnits({
      bondThickness: 2,
      bondThicknessUnit: MeasurementUnits.Px,
    });
    expect(result.bondThicknessInPx).toBe(2);
  });

  it('converts 1 pt to px correctly', () => {
    const result = getOptionsWithConvertedUnits({
      bondThickness: 1,
      bondThicknessUnit: MeasurementUnits.Pt,
    });
    // 1 pt * 1.333333 ≈ 1.333 px
    expect(result.bondThicknessInPx).toBeCloseTo(1.333, 2);
  });

  it('does not set bondThicknessInPx when bondThickness is not provided', () => {
    const result = getOptionsWithConvertedUnits({});
    expect(result.bondThicknessInPx).toBeUndefined();
  });
});
