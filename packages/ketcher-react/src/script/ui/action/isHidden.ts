export default function isHidden(
  options: { buttons?: {} },
  buttonName: string
): boolean {
  return Boolean(options.buttons?.[buttonName]?.hidden)
}
