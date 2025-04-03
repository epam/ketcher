export class SVGPathDAttributeUtil {
  public static generateAbsoluteLine(x: number, y: number): string {
    return `L ${x},${y}`;
  }

  public static generateHorizontalAbsoluteLine(x: number): string {
    return `H ${x}`;
  }

  public static generateMoveTo(x: number, y: number): string {
    return `M ${x},${y}`;
  }

  public static generateVerticalAbsoluteLine(y: number): string {
    return `V ${y}`;
  }
}
