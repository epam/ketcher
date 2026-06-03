import {
  type AttachmentPointName,
  type BaseMonomer,
  getMonomerTemplateRefFromMonomerItem,
  type MonomerCreationInitialValues,
  KetMonomerClass,
  KetTemplateType,
} from 'ketcher-core';

const COPY_SUFFIX = '_Copy';

const getCopiedValue = (value?: string) =>
  value ? `${value}${COPY_SUFFIX}` : '';

const isNaturalAnalogueSupported = (
  monomerType: KetMonomerClass | 'rnaPreset' | undefined,
) =>
  monomerType === KetMonomerClass.AminoAcid ||
  monomerType === KetMonomerClass.Base ||
  monomerType === KetMonomerClass.RNA;

const getInitialValues = (
  monomer: BaseMonomer,
  shouldCopyValues: boolean,
): MonomerCreationInitialValues => {
  const { label, props } = monomer.monomerItem;
  const type = props.MonomerClass ?? KetMonomerClass.CHEM;
  const symbol = props.MonomerCode ?? label;
  const name = props.MonomerName ?? props.Name ?? symbol;
  const naturalAnalogue = isNaturalAnalogueSupported(type)
    ? props.MonomerNaturalAnalogCode
    : '';
  const getValue = shouldCopyValues
    ? getCopiedValue
    : (value?: string) => value ?? '';

  return {
    type,
    symbol: getValue(symbol),
    name: getValue(name),
    naturalAnalogue,
    aliasHELM: getValue(props.aliasHELM),
    aliasBILN: getValue(props.aliasBILN),
    originalType: type,
    originalSymbol: symbol,
  };
};

export const getEditInstanceInitialValues = (
  monomer: BaseMonomer,
): MonomerCreationInitialValues => {
  return {
    ...getInitialValues(monomer, true),
    editMode: 'instance',
  };
};

const sortAttachmentPoints = (attachmentPoints: AttachmentPointName[]) =>
  [...attachmentPoints].sort((firstAttachmentPoint, secondAttachmentPoint) => {
    const firstNumber = Number(firstAttachmentPoint.slice(1));
    const secondNumber = Number(secondAttachmentPoint.slice(1));

    return firstNumber - secondNumber;
  });

type MonomersLibraryParsedJson = {
  root?: { templates?: Array<{ $ref?: string }> };
  [templateRef: string]: unknown;
};

type RnaPresetTemplate = {
  type?: string;
  class?: string;
  templates?: Array<{ $ref?: string }>;
  connections?: Array<{
    endpoint1?: { templateId?: string; attachmentPointId?: string };
    endpoint2?: { templateId?: string; attachmentPointId?: string };
  }>;
};

export const getEditAllInstancesInitialValues = (
  monomer: BaseMonomer,
  monomersLibraryParsedJson?: MonomersLibraryParsedJson | null,
): MonomerCreationInitialValues => {
  const initialValues = getInitialValues(monomer, false);
  const monomerTemplateRef = getMonomerTemplateRefFromMonomerItem(
    monomer.monomerItem,
  );
  const monomerTemplateId = monomerTemplateRef.replace(/^monomerTemplate-/, '');
  const isEditedMonomerTemplate = (templateId?: string) =>
    templateId === monomerTemplateRef || templateId === monomerTemplateId;
  const necessaryAttachmentPoints = new Set<AttachmentPointName>();

  if (
    initialValues.type === KetMonomerClass.Sugar ||
    initialValues.type === KetMonomerClass.Base ||
    initialValues.type === KetMonomerClass.Phosphate
  ) {
    monomersLibraryParsedJson?.root?.templates?.forEach(
      (templateRef: { $ref?: string }) => {
        const template = monomersLibraryParsedJson[templateRef.$ref ?? ''] as
          | RnaPresetTemplate
          | undefined;
        const isRnaPreset =
          template?.type === KetTemplateType.MONOMER_GROUP_TEMPLATE &&
          template?.class === KetMonomerClass.RNA;
        const participatesInPreset = template?.templates?.some(
          (presetMonomerRef: { $ref?: string }) =>
            isEditedMonomerTemplate(presetMonomerRef.$ref),
        );

        if (!isRnaPreset || !participatesInPreset) {
          return;
        }

        template.connections?.forEach((connection) => {
          [connection.endpoint1, connection.endpoint2].forEach((endpoint) => {
            const attachmentPointId = endpoint?.attachmentPointId;
            if (
              isEditedMonomerTemplate(endpoint?.templateId) &&
              attachmentPointId
            ) {
              necessaryAttachmentPoints.add(
                attachmentPointId as AttachmentPointName,
              );
            }
          });
        });
      },
    );
  }

  return {
    ...initialValues,
    editMode: 'all',
    ...(necessaryAttachmentPoints.size > 0
      ? {
          presetRequirements: {
            type: initialValues.type,
            attachmentPoints: sortAttachmentPoints([
              ...necessaryAttachmentPoints,
            ]),
          },
        }
      : {}),
  };
};
