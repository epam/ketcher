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

  public static generateQuadraticRelativeCurve(
    dx1: number,
    dy1: number,
    dx: number,
    dy: number,
  ): string {
    const controlPoint = `${dx1},${dy1}`;
    const endPoint = `${dx},${dy}`;
    return `q ${controlPoint} ${endPoint} `;
  }

  public static generateVerticalAbsoluteLine(y: number): string {
    return `V ${y}`;
  }
}
