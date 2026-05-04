import { BaseMonomer } from 'domain/entities/BaseMonomer';

export const HELM_ALIAS_FORMAT_ERROR_MESSAGE =
  'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';

const HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;

export function isValidHelmAlias(alias: string) {
  return HELM_ALIAS_REGEX.test(alias);
}

export function isMonomerSgroupWithAttachmentPoints(monomer: BaseMonomer) {
  const sgroups = monomer.monomerItem.struct.sgroups;

  return (
    monomer.monomerItem.props.isMicromoleculeFragment &&
    sgroups.some((sgroup) => sgroup.isSuperatomWithoutLabel)
  );
}
