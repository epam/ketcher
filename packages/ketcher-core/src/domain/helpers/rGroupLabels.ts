/** R1 through R32 are stored as a signed 32-bit mask. */
export function formatRGroupLabels(mask: number): string {
  let label = '';
  for (let index = 0; index < 32; index++) {
    if (mask & (1 << index)) label += `R${index + 1}`;
  }
  return label;
}
