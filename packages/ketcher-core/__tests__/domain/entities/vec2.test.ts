import { Vec2 } from 'domain/entities/vec2';

describe('length', () => {
  it('should show vector length', () => {
    const v0 = new Vec2(3, 3, 3);

    expect(v0.length()).toBe(4.242640687119285);
  });
});

describe('equals', () => {
  it.each([
    [true, [3, 3, 3], [3, 3, 3]],
    [false, [3, 3, 3], [2, 2, 2]],
  ])('should return %p', (expected, v0Args, v1Args) => {
    const v0 = new Vec2(...v0Args);
    const v1 = new Vec2(...v1Args);

    expect(v0.equals(v1)).toBe(expected);
  });
});

describe('add', () => {
  it('should return new vector the sum of two vectors', () => {
    const v0 = new Vec2(1, 1, 1);
    const v1 = new Vec2(1, 1, 1);
    const v2 = v0.add(v1);
    const v3 = new Vec2(2, 2, 2);

    expect(v2.equals(v3) && v0 !== v2 && v1 !== v2).toBeTruthy();
  });
});

describe('add_', () => {
  it('should add the vector to the current vector', () => {
    const v0 = new Vec2(1, 1, 1);
    const v1 = new Vec2(1, 1, 1);
    const v2 = new Vec2(2, 2, 2);

    v0.add_(v1);

    expect(v0.equals(v2)).toBeTruthy();
  });
});

describe('get_xy0', () => {
  it('should return true if new vector with current x and y, z = 0', () => {
    const v0 = new Vec2(3, 3, 3);
    const v1 = new Vec2(3, 3, 0);

    expect(v0.get_xy0().equals(v1)).toBeTruthy();
  });
});

describe('sub', () => {
  it('should return true if a new vector which is equal to the difference of 2 vectors', () => {
    const v0 = new Vec2(3, 3, 3);
    const v1 = new Vec2(1, 1, 1);
    const v2 = new Vec2(2, 2, 2);

    const result = v0.sub(v1);

    expect(result.equals(v2)).toBeTruthy();
  });
});

describe('scaled', () => {
  it('should return true if the coordinates of the new one are multiplied by 3', () => {
    const v0 = new Vec2(3, 3, 3);
    const v1 = new Vec2(9, 9, 9);

    expect(v0.scaled(3).equals(v1)).toBeTruthy();
  });

  it('should return true if the coordinates of the new one are multiplied by 0', () => {
    const v0 = new Vec2(3, 3, 3);
    const v1 = new Vec2(0, 0, 0);

    expect(v0.scaled(0).equals(v1)).toBeTruthy();
  });
});

describe('negated', () => {
  it('should return true if vector coordinates become negative', () => {
    const v0 = new Vec2(2, 2, 2);
    const v1 = new Vec2(-2, -2, -2);

    expect(v0.negated().equals(v1)).toBeTruthy();
  });
});

describe('yComplement', () => {
  it.each([
    [true, -3, 3],
    [true, -6, 0],
    [false, 5, 0],
  ])('should return %p if y = %p, y1 = %p', (expected, y, y1) => {
    const v0 = new Vec2(3, 6, 3);
    const v1 = new Vec2(3, y, 3);

    expect(v0.yComplement(y1).equals(v1)).toBe(expected);
  });
});

describe('addScaled', () => {
  it('should return true if v0 = v1', () => {
    const v0 = new Vec2(3, 3, 3);
    const v1 = new Vec2(3, 3, 3);
    const v2 = new Vec2(12, 12, 12);

    expect(v0.addScaled(v1, 3).equals(v2)).toBeTruthy();
  });
});

describe('normalized', () => {
  it('should return true if v0 = v1', () => {
    const v0 = new Vec2(3, 2, 1);
    const v1 = new Vec2(
      0.8320502943378437,
      0.5547001962252291,
      0.2773500981126146
    );

    expect(v0.normalized().equals(v1)).toBe(true);
  });
});

describe('normalize', () => {
  it('should return true if length < 0.000001', () => {
    const v0 = new Vec2(0, 0, 0);
    const defaultV0 = new Vec2(0, 0, 0);
    const isSideEffect = !v0.equals(defaultV0);

    const result = v0.normalize();

    expect(!result && !isSideEffect).toBeTruthy();
  });

  it('should return true if length > 0.000001', () => {
    const v0 = new Vec2(2, 2, 2);
    const defaultV0 = new Vec2(2, 2, 2);
    const result = v0.normalize();
    const isSideEffect = !v0.equals(defaultV0);

    expect(result && isSideEffect).toBeTruthy();
  });
});

describe('turnLeft', () => {
  it('should return true if y of the new vector becomes negative', () => {
    const v0 = new Vec2(2, 2, 2);

    const result = Math.sign(v0.turnLeft().y);

    expect(result).toBeTruthy();
  });
});

describe('coordStr', () => {
  test('should retrun string with x, y', () => {
    const v0 = new Vec2(2, 2, 2);

    expect(v0.coordStr()).toBe('2 , 2');
  });
});

describe('toString', () => {
  test('should return string with x, y', () => {
    const v0 = new Vec2(2, 2, 2);

    expect(v0.toString()).toBe('(2.00,2.00)');
  });
});

describe('max', () => {
  test('should return true if the new vector with the largest xyz', () => {
    const v0 = new Vec2(4, 2, 2);
    const v1 = new Vec2(3, 3, 5);
    const v2 = new Vec2(4, 3, 5);

    expect(v0.max(v1).equals(v2)).toBeTruthy();
  });
});

describe('min', () => {
  test('should return true if the new vector with the smallest xyz', () => {
    const v0 = new Vec2(4, 2, 2);
    const v1 = new Vec2(3, 3, 5);
    const v2 = new Vec2(3, 2, 2);

    expect(v0.min(v1).equals(v2)).toBeTruthy();
  });
});

describe('ceil', () => {
  test('must return true if a new vector is returned with coordinates rounded to a larger integer', () => {
    const v0 = new Vec2(2.2, 1.1, 3.3);
    const v1 = new Vec2(3, 2, 4);

    expect(v0.ceil().equals(v1)).toBeTruthy();
  });
});

describe('floor', () => {
  test('should return true if a new vector is returned with coordinates rounded to a smallest integer', () => {
    const v0 = new Vec2(2.2, 1.1, 3.3);
    const v1 = new Vec2(2, 1, 3);

    expect(v0.floor().equals(v1)).toBeTruthy();
  });
});

describe('rotate', () => {
  // TODO
  test('should true if x = x *', () => {
    const v0 = new Vec2(2, 1, 3);
    const v1 = new Vec2(-0.39576750238188574, -2.200765340525519, 3);

    expect(v0.rotate(180).equals(v1)).toBeTruthy();
  });
});

describe('oxAngle', () => {
  test('should returns the arctangent of x y', () => {
    const v0 = new Vec2(2, 1, 3);

    expect(v0.oxAngle()).toBe(0.4636476090008061);
  });
});
