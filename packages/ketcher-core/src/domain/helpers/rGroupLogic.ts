import type { RGroup } from 'domain/entities/rgroup';

export function rGroupLogicToString(id: number | null, rgroup: RGroup): string {
  const ifThen = rgroup.ifthen > 0 ? 'IF ' : '';
  const hasComparison = /^[><=]/.test(rgroup.range);
  const range = rgroup.range
    ? `${hasComparison ? '' : '='}${rgroup.range}`
    : '>0';
  const restH = rgroup.resth ? ' (RestH)' : '';
  const condition = rgroup.ifthen > 0 ? `\nTHEN R${rgroup.ifthen}` : '';
  return `${ifThen}R${String(id)}${range}${restH}${condition}`;
}
