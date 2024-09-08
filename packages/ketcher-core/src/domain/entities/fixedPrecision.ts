export class FixedPrecisionCoordinates {
  static MULTIPLIER = 10 ** 5;
  public readonly value: number;

  static fromFloatingPrecision(value: number) {
    return new FixedPrecisionCoordinates(
      Math.round(value * FixedPrecisionCoordinates.MULTIPLIER),
    );
  }

  constructor(value: number | FixedPrecisionCoordinates) {
    this.value =
      value instanceof FixedPrecisionCoordinates ? value.value : value;
  }

  add(
    fixedPrecisionValue: FixedPrecisionCoordinates,
  ): FixedPrecisionCoordinates {
    return new FixedPrecisionCoordinates(
      this.value + fixedPrecisionValue.value,
    );
  }

  sub(
    fixedPrecisionValue: FixedPrecisionCoordinates,
  ): FixedPrecisionCoordinates {
    return new FixedPrecisionCoordinates(
      this.value - fixedPrecisionValue.value,
    );
  }

  multiply(
    value: FixedPrecisionCoordinates | number,
  ): FixedPrecisionCoordinates {
    const isFixedPrecision = value instanceof FixedPrecisionCoordinates;
    const multiplier = isFixedPrecision ? value.value : value;
    const result = this.value * multiplier;
    return new FixedPrecisionCoordinates(
      Math.round(
        isFixedPrecision
          ? result / FixedPrecisionCoordinates.MULTIPLIER
          : result,
      ),
    );
  }

  divide(value: FixedPrecisionCoordinates | number): FixedPrecisionCoordinates {
    const isFixedPrecision = value instanceof FixedPrecisionCoordinates;
    const delimiter = isFixedPrecision ? value.value : value;
    const result = this.value / delimiter;
    return new FixedPrecisionCoordinates(
      Math.round(
        isFixedPrecision
          ? result * FixedPrecisionCoordinates.MULTIPLIER
          : result,
      ),
    );
  }

  getFloatingPrecision(): number {
    return this.value / FixedPrecisionCoordinates.MULTIPLIER;
  }
}
