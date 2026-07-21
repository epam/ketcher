import {
  AttachmentPointName,
  type BaseMonomer,
  getMonomerTemplateRefFromMonomerItem,
  type MonomerCreationInitialValues,
  KetMonomerClass,
  KetTemplateType,
  Vec2,
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
  shouldAppendCopySuffix: boolean,
): MonomerCreationInitialValues => {
  const { label, props } = monomer.monomerItem;
  const type = props.MonomerClass ?? KetMonomerClass.CHEM;
  const symbol = props.MonomerCode ?? label;
  const name = props.MonomerFullName ?? props.Name ?? symbol;
  const naturalAnalogue = isNaturalAnalogueSupported(type)
    ? props.MonomerNaturalAnalogCode
    : '';
  const getValue = shouldAppendCopySuffix
    ? getCopiedValue
    : (value?: string) => value ?? '';
  const position = monomer.position
    ? { position: new Vec2(monomer.position) }
    : {};

  return {
    type,
    symbol: getValue(symbol),
    name: getValue(name),
    naturalAnalogue,
    aliasHELM: getValue(props.aliasHELM),
    aliasBILN: getValue(props.aliasBILN),
    originalType: type,
    originalSymbol: symbol,
    ...position,
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

type RnaComponentTemplateRef = { $ref?: string; class?: string };

type MonomerTemplate = {
  class?: string;
};

type RnaPresetTemplate = {
  type?: string;
  class?: string;
  templates?: RnaComponentTemplateRef[];
  connections?: Array<{
    endpoint1?: { templateId?: string; attachmentPointId?: string };
    endpoint2?: { templateId?: string; attachmentPointId?: string };
  }>;
};

const getTemplateClass = (
  templateRef: RnaComponentTemplateRef,
  monomersLibraryParsedJson: MonomersLibraryParsedJson,
) => {
  const template = monomersLibraryParsedJson[templateRef.$ref ?? ''] as
    | MonomerTemplate
    | undefined;

  return templateRef.class ?? template?.class;
};

const addDefaultRnaPresetAttachmentPoints = (
  componentTypes: Set<string | undefined>,
  editedMonomerType: KetMonomerClass,
  necessaryAttachmentPoints: Set<AttachmentPointName>,
) => {
  if (
    editedMonomerType === KetMonomerClass.Base &&
    componentTypes.has(KetMonomerClass.Sugar)
  ) {
    necessaryAttachmentPoints.add(AttachmentPointName.R1);
  }

  if (editedMonomerType === KetMonomerClass.Sugar) {
    if (componentTypes.has(KetMonomerClass.Phosphate)) {
      necessaryAttachmentPoints.add(AttachmentPointName.R1);
    }

    if (componentTypes.has(KetMonomerClass.Base)) {
      necessaryAttachmentPoints.add(AttachmentPointName.R3);
    }
  }

  if (
    editedMonomerType === KetMonomerClass.Phosphate &&
    componentTypes.has(KetMonomerClass.Sugar)
  ) {
    necessaryAttachmentPoints.add(AttachmentPointName.R2);
  }
};

export const getEditAllInstancesInitialValues = (
  monomer: BaseMonomer,
  monomersLibraryParsedJson?: MonomersLibraryParsedJson | null,
): MonomerCreationInitialValues => {
  const initialValues = getInitialValues(monomer, true);
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

        if (!template.connections?.length) {
          const componentTypes = new Set(
            template.templates?.map((presetMonomerRef) =>
              isEditedMonomerTemplate(presetMonomerRef.$ref)
                ? initialValues.type
                : getTemplateClass(presetMonomerRef, monomersLibraryParsedJson),
            ),
          );

          addDefaultRnaPresetAttachmentPoints(
            componentTypes,
            initialValues.type,
            necessaryAttachmentPoints,
          );

          return;
        }

        template.connections.forEach((connection) => {
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
