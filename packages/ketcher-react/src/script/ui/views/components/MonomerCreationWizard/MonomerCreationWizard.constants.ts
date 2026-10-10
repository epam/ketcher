import {
  BILN_ALIAS_FORMAT_ERROR_MESSAGE,
  HELM_ALIAS_FORMAT_ERROR_MESSAGE,
  KetMonomerClass,
} from 'ketcher-core';

import type {
  MonomerTypeSelectItem,
  WizardNotificationMessageMap,
  WizardNotificationTypeMap,
} from './MonomerCreationWizard.types';
import i18n from 'src/i18n/i18n';

export const MonomerTypeSelectConfig: MonomerTypeSelectItem[] = [
  {
    value: KetMonomerClass.AminoAcid,
    label: i18n.t('components:monomerCreationWizard.types.aminoAcid'),
    iconName: 'peptide',
  },
  {
    value: KetMonomerClass.Sugar,
    label: i18n.t('common:monomerType.sugar'),
    iconName: 'sugar',
  },
  {
    value: KetMonomerClass.Base,
    label: i18n.t('common:monomerType.base'),
    iconName: 'base',
  },
  {
    value: KetMonomerClass.Phosphate,
    label: i18n.t('common:monomerType.phosphate'),
    iconName: 'phosphate',
  },
  {
    value: KetMonomerClass.RNA,
    label: i18n.t('components:monomerCreationWizard.types.nucleotideMonomer'),
    iconName: 'nucleotide',
  },
  {
    value: 'rnaPreset',
    label: i18n.t('components:monomerCreationWizard.types.nucleotidePreset'),
    iconName: 'preset',
  },
  {
    value: KetMonomerClass.CHEM,
    label: i18n.t('components:monomerCreationWizard.types.chem'),
    iconName: 'chem',
  },
];

export const MAX_MODIFICATION_TYPES = 5;

const n = 'components:monomerCreationWizard.notifications.';

export const NotificationMessages: WizardNotificationMessageMap = {
  defaultAttachmentPoints: i18n.t(`${n}defaultAttachmentPoints`),
  emptyMandatoryFields: i18n.t(`${n}emptyMandatoryFields`),
  invalidSymbol: i18n.t(`${n}invalidSymbol`),
  symbolExists: i18n.t(`${n}symbolExists`),
  editingIsNotAllowed: i18n.t(`${n}editingIsNotAllowed`),
  noAttachmentPoints: i18n.t(`${n}noAttachmentPoints`),
  incorrectAttachmentPointsOrder: i18n.t(`${n}incorrectAttachmentPointsOrder`),
  attachmentPointsNotUnique: i18n.t(`${n}attachmentPointsNotUnique`),
  creationSuccessful: i18n.t(`${n}creationSuccessful`),
  creationRNASuccessful: i18n.t(`${n}creationRNASuccessful`),
  incontinuousStructure: i18n.t(`${n}incontinuousStructure`),
  notUniqueModificationTypes: i18n.t(`${n}notUniqueModificationTypes`),
  modificationTypeExists: i18n.t(`${n}modificationTypeExists`),
  notMinimalViableStructure: i18n.t(`${n}notMinimalViableStructure`),
  impureStructure: i18n.t(`${n}impureStructure`),
  invalidHELMAlias: HELM_ALIAS_FORMAT_ERROR_MESSAGE,
  notUniqueHELMAlias: i18n.t(`${n}notUniqueHELMAlias`),
  invalidBILNAlias: BILN_ALIAS_FORMAT_ERROR_MESSAGE,
  notUniqueBILNAlias: i18n.t(`${n}notUniqueBILNAlias`),
  invalidRnaPresetStructure: i18n.t(`${n}invalidRnaPresetStructure`),
  rnaPresetAtomsOutsideComponents: i18n.t(
    `${n}rnaPresetAtomsOutsideComponents`,
  ),
  rnaPresetAtomsInMultipleComponents: i18n.t(
    `${n}rnaPresetAtomsInMultipleComponents`,
  ),
  rnaPresetMissingComponents: i18n.t(`${n}rnaPresetMissingComponents`),
  rnaPresetInvalidSugarConnectionBonds: i18n.t(
    `${n}rnaPresetInvalidSugarConnectionBonds`,
  ),
  rnaPresetUnexpectedBasePhosphateBond: i18n.t(
    `${n}rnaPresetUnexpectedBasePhosphateBond`,
  ),
  rnaPresetInvalidSugarBaseConnectionAttachmentPoints: i18n.t(
    `${n}rnaPresetInvalidSugarBaseConnectionAttachmentPoints`,
  ),
  rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints: i18n.t(
    `${n}rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints`,
  ),
  notUniquePresetCode: i18n.t(`${n}notUniquePresetCode`),
  invalidPresetCode: i18n.t(`${n}invalidPresetCode`),
  invalidName: i18n.t(`${n}invalidName`),
  invalidPhosphatePositionAttachmentPoints: i18n.t(
    `${n}invalidPhosphatePositionAttachmentPoints`,
  ),
  phosphatePositionNotSelected: i18n.t(`${n}phosphatePositionNotSelected`),
  editAllPresetWarning: '',
  editAllPresetError: '',
  usedAttachmentPointsWarning: '',
};

export const NotificationTypes: WizardNotificationTypeMap = {
  defaultAttachmentPoints: 'info',
  emptyMandatoryFields: 'error',
  invalidSymbol: 'error',
  symbolExists: 'error',
  editingIsNotAllowed: 'error',
  noAttachmentPoints: 'error',
  incorrectAttachmentPointsOrder: 'error',
  attachmentPointsNotUnique: 'error',
  creationSuccessful: 'info',
  creationRNASuccessful: 'info',
  incontinuousStructure: 'error',
  notUniqueModificationTypes: 'error',
  modificationTypeExists: 'error',
  notMinimalViableStructure: 'error',
  impureStructure: 'error',
  invalidHELMAlias: 'error',
  notUniqueHELMAlias: 'error',
  invalidBILNAlias: 'error',
  notUniqueBILNAlias: 'error',
  invalidRnaPresetStructure: 'error',
  rnaPresetAtomsOutsideComponents: 'error',
  rnaPresetAtomsInMultipleComponents: 'error',
  rnaPresetMissingComponents: 'error',
  rnaPresetInvalidSugarConnectionBonds: 'error',
  rnaPresetUnexpectedBasePhosphateBond: 'error',
  rnaPresetInvalidSugarBaseConnectionAttachmentPoints: 'error',
  rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints: 'error',
  notUniquePresetCode: 'error',
  invalidPresetCode: 'error',
  invalidName: 'error',
  invalidPhosphatePositionAttachmentPoints: 'error',
  phosphatePositionNotSelected: 'error',
  editAllPresetWarning: 'warning',
  editAllPresetError: 'error',
  usedAttachmentPointsWarning: 'info',
};

export const MonomerCreationExternalNotificationAction =
  'MonomerCreationExternalNotification';

export const MonomerCreationMarkAsComponentAction =
  'MonomerCreationMarkAsComponent';

export type RnaPresetComponentType = 'base' | 'sugar' | 'phosphate';
