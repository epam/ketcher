export function toFixed<TValue extends number | string>(value: TValue): string {
  let parsedValue: number;
  parsedValue = typeof value === 'number' ? value : Number.parseFloat(value);
  return parsedValue.toFixed(8);
}
