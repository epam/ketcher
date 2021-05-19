export function ifDef<TValue = any>(
  target: any,
  key: string,
  value: TValue,
  defaultValue?: TValue
) {
  if (
    value !== undefined &&
    value !== null &&
    value !== defaultValue &&
    !(Array.isArray(value) && value.length === 0)
  )
    target[key] = value
}
