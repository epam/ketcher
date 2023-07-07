// TODO add tests and rename to toFixed
// https://github.com/epam/ketcher/issues/2675
export function tfx<TValue extends number | string>(value: TValue): string {
  let parsedValue: number;
  if (typeof value === 'number') {
    parsedValue = value;
  } else {
    parsedValue = parseFloat(value);
  }
  return parsedValue.toFixed(8);
}
