import {
  AttachmentPointName,
  type BaseMonomer,
  getMonomerTemplateRefFromMonomerItem,
  type MonomerCreationInitialValues,
  type MonomerItemType,
  KetMonomerClass,
  KetTemplateType,
  type MonomerMicromolecule,
  Vec2,
} from 'ketcher-core';
import {
  getMonomerPropertyVisibility,
  isNaturalAnalogueRequired,
} from './MonomerCreationWizardFields.utilities';

const COPY_SUFFIX = '_Copy';

const getCopiedValue = (value?: string) =>
  value ? `${value}${COPY_SUFFIX}` : '';

const getInitialValues = (
  monomer: BaseMonomer | MonomerItemType,
  shouldAppendCopySuffix: boolean,
): MonomerCreationInitialValues => {
  const { label, props } =
    'monomerItem' in monomer ? monomer.monomerItem : monomer;
  const type = props.MonomerClass ?? KetMonomerClass.CHEM;
  const symbol = props.MonomerCode ?? label;
  const name = props.MonomerFullName ?? props.Name ?? symbol;
  const naturalAnalogue = isNaturalAnalogueRequired(type)
    ? props.MonomerNaturalAnalogCode
    : '';
  const getValue = shouldAppendCopySuffix
    ? getCopiedValue
    : (value?: string) => value ?? '';
  const position =
    'position' in monomer && monomer.position
      ? { position: new Vec2(monomer.position) }
      : {};
  const { displayHelmAlias, displayBilnAlias } =
    getMonomerPropertyVisibility(type);

  return {
    type,
    symbol: getValue(symbol),
    name: getValue(name),
    naturalAnalogue,
    aliasHELM: displayHelmAlias ? getValue(props.aliasHELM) : '',
    aliasBILN: displayBilnAlias ? getValue(props.aliasBILN) : '',
    originalType: type,
    originalSymbol: symbol,
    ...position,
  };
};

export const getEditInstanceInitialValues = (
  monomer: BaseMonomer | MonomerItemType,
): MonomerCreationInitialValues => {
  return {
    ...getInitialValues(monomer, true),
    editMode: 'instance',
  };
};

export const getLibraryEditInitialValues = (
  libraryItem: MonomerItemType,
): MonomerCreationInitialValues => ({
  ...getInitialValues(libraryItem, false),
  libraryOnly: true,
  originalMonomerItem: libraryItem,
  modificationTypes: [...(libraryItem.props.modificationTypes ?? [])],
});

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

type RnaComponentTemplateReference = { $ref?: string; class?: string };

type MonomerTemplate = {
  class?: string;
};

type RnaPresetTemplate = {
  type?: string;
  class?: string;
  templates?: RnaComponentTemplateReference[];
  connections?: Array<{
    endpoint1?: { templateId?: string; attachmentPointId?: string };
    endpoint2?: { templateId?: string; attachmentPointId?: string };
  }>;
};

const getTemplateClass = (
  templateReference: RnaComponentTemplateReference,
  monomersLibraryParsedJson: MonomersLibraryParsedJson,
) => {
  const template = monomersLibraryParsedJson[templateReference.$ref ?? ''] as
    MonomerTemplate | undefined;

  return templateReference.class ?? template?.class;
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
  const monomerTemplateReference = getMonomerTemplateRefFromMonomerItem(
    monomer.monomerItem,
  );
  const monomerTemplateId = monomerTemplateReference.replace(
    /^monomerTemplate-/,
    '',
  );
  const isEditedMonomerTemplate = (templateId?: string) =>
    templateId === monomerTemplateReference || templateId === monomerTemplateId;
  const necessaryAttachmentPoints = new Set<AttachmentPointName>();

  if (
    initialValues.type === KetMonomerClass.Sugar ||
    initialValues.type === KetMonomerClass.Base ||
    initialValues.type === KetMonomerClass.Phosphate
  ) {
    monomersLibraryParsedJson?.root?.templates?.forEach(
      (templateReference: { $ref?: string }) => {
        const template = monomersLibraryParsedJson[
          templateReference.$ref ?? ''
        ] as RnaPresetTemplate | undefined;
        const isRnaPreset =
          template?.type === KetTemplateType.MONOMER_GROUP_TEMPLATE &&
          template?.class === KetMonomerClass.RNA;
        const participatesInPreset = template?.templates?.some(
          (presetMonomerReference: { $ref?: string }) =>
            isEditedMonomerTemplate(presetMonomerReference.$ref),
        );

        if (!isRnaPreset || !participatesInPreset) {
          return;
        }

        if (!template.connections?.length) {
          const componentTypes = new Set(
            template.templates?.map((presetMonomerReference) =>
              isEditedMonomerTemplate(presetMonomerReference.$ref)
                ? initialValues.type
                : getTemplateClass(
                    presetMonomerReference,
                    monomersLibraryParsedJson,
                  ),
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
              attachmentPointId &&
              isEditedMonomerTemplate(endpoint?.templateId)
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

/**
 * Returns true when the given `MonomerMicromolecule` sgroup represents the
 * same monomer type and symbol as `primaryMonomer`.
 *
 * Use this to scope "edit all instances" to the sgroups the user selected.
 */
export const isSameMonomerType = (
  sgroup: MonomerMicromolecule,
  primaryMonomer: BaseMonomer,
): boolean => {
  const { props, label } = sgroup.monomer.monomerItem;
  const symbol = props.MonomerCode ?? label;
  const primarySymbol =
    primaryMonomer.monomerItem.props.MonomerCode ??
    primaryMonomer.monomerItem.label;
  return (
    props.MonomerClass === primaryMonomer.monomerItem.props.MonomerClass &&
    symbol === primarySymbol
  );
};
