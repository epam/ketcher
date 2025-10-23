import { KetMonomerClass } from 'ketcher-core';

import {
  MonomerTypeSelectItem,
  WizardNotificationMessageMap,
  WizardNotificationTypeMap,
} from './MonomerCreationWizard.types';

export const MonomerTypeSelectConfig: MonomerTypeSelectItem[] = [
  {
    value: KetMonomerClass.AminoAcid,
    label: 'Amino acid',
    iconName: 'peptide',
  },
  { value: KetMonomerClass.Sugar, label: 'Sugar', iconName: 'sugar' },
  { value: KetMonomerClass.Base, label: 'Base', iconName: 'base' },
  {
    value: KetMonomerClass.Phosphate,
    label: 'Phosphate',
    iconName: 'phosphate',
  },
  { value: KetMonomerClass.RNA, label: 'Nucleotide', iconName: 'nucleotide' },
  { value: KetMonomerClass.CHEM, label: 'CHEM', iconName: 'chem' },
];

export const MAX_MODIFICATION_TYPES = 5;

export const NotificationMessages: WizardNotificationMessageMap = {
  defaultAttachmentPoints:
    'Attachment points are set by default with hydrogens as leaving groups.',
  emptyMandatoryFields: 'Mandatory fields must be filled.',
  invalidSymbol:
    'The monomer symbol must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
  symbolExists:
    'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  editingIsNotAllowed: 'Editing of the structure is not allowed.',
  noAttachmentPoints: 'The monomer must have at least one attachment point.',
  incorrectAttachmentPointsOrder:
    'Attachment point numbers must be in order, but R1 and R2 may be skipped.',
  creationSuccessful: 'The monomer was successfully added to the library.',
  incontinuousStructure: 'All monomers must have a continuous structure.',
  notUniqueModificationTypes:
    'Only one amino acid within a natural analogue can have the same modification type.',
  modificationTypeExists:
    'Only one amino acid within a natural analogue can have the same modification type.',
  notMinimalViableStructure:
    'Minimal monomer structure is two atoms connected via a single bond.',
  impureStructure:
    'Monomer structure cannot contain S-groups, R-groups, special atoms, or any other query properties.',
};

export const NotificationTypes: WizardNotificationTypeMap = {
  defaultAttachmentPoints: 'info',
  emptyMandatoryFields: 'error',
  invalidSymbol: 'error',
  symbolExists: 'error',
  editingIsNotAllowed: 'error',
  noAttachmentPoints: 'error',
  incorrectAttachmentPointsOrder: 'error',
  creationSuccessful: 'info',
  incontinuousStructure: 'error',
  notUniqueModificationTypes: 'error',
  modificationTypeExists: 'error',
  notMinimalViableStructure: 'error',
  impureStructure: 'error',
};

export const MonomerCreationExternalNotificationAction =
  'MonomerCreationExternalNotification';
