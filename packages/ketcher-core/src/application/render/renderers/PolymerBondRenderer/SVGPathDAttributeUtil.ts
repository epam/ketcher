export class SVGPathDAttributeUtil {
  public static generateAbsoluteLine(x: number, y: number): string {
    return `L ${x},${y}`;
  }

  public static generateHorizontalAbsoluteLine(x: number): string {
    return `H ${x}`;
  }

  public static generateVerticalAbsoluteLine(y: number): string {
    return `V ${y}`;
  }
}
