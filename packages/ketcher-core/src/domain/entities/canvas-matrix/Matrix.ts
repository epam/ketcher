export class Matrix<T> {
  private matrix: T[][];

  constructor() {
    this.matrix = [];
  }

  get(x: number, y: number): T | undefined {
    if (!this.matrix[x]) {
      return undefined;
    }
    return this.matrix[x][y];
  }

  set(x: number, y: number, value: T) {
    if (!this.matrix[x]) {
      this.matrix[x] = [];
    }
    this.matrix[x][y] = value;
  }

  forEach(callback: (value: T, x: number, y: number) => void): void {
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x]?.length; y++) {
        const value = this.matrix[x][y];
        if (value) {
          callback(value, x, y);
        }
      }
    }
  }

  forEachRightToLeft(callback: (value: T, x: number, y: number) => void): void {
    for (let x = this.matrix.length - 1; x >= 0; x--) {
      for (let y = this.matrix[x]?.length - 1; y >= 0; y--) {
        const value = this.matrix[x][y];
        if (value) {
          callback(value, x, y);
        }
      }
    }
  }

  forEachBottomToTop(callback: (value: T, x: number, y: number) => void): void {
    for (let y = this.matrix[0]?.length - 1; y >= 0; y--) {
      for (let x = this.matrix.length - 1; x >= 0; x--) {
        const value = this.matrix[x][y];
        if (value) {
          callback(value, x, y);
        }
      }
    }
  }
}
