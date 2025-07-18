/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  Atom,
  Bond,
  SGroupAttachmentPoint,
  Struct,
  UnresolvedMonomer,
  Vec2,
  RxnArrow as MicromoleculeRxnArrow,
  MultitailArrow as MicromoleculeMultitailArrow,
  RxnPlus as MicromoleculeRxnPlus,
} from 'domain/entities';
import { arrowToKet, plusToKet } from './toKet/rxnToKet';
import { Serializer } from '../serializers.types';
import { headerToKet } from './toKet/headerToKet';
import { moleculeToKet } from './toKet/moleculeToKet';
import { moleculeToStruct } from './fromKet/moleculeToStruct';
import { prepareStructForKet } from './toKet/prepare';
import { rgroupToKet } from './toKet/rgroupToKet';
import { rgroupToStruct } from './fromKet/rgroupToStruct';
import { rxnToStruct } from './fromKet/rxnToStruct';
import { simpleObjectToKet } from './toKet/simpleObjectToKet';
import { simpleObjectToStruct } from './fromKet/simpleObjectToStruct';
import { textToKet } from './toKet/textToKet';
import { textToStruct } from './fromKet/textToStruct';
import {
  IKetAmbiguousMonomerTemplate,
  IKetConnection,
  IKetConnectionEndPoint,
  IKetConnectionMoleculeEndPoint,
  IKetConnectionMonomerEndPoint,
  IKetMacromoleculesContent,
  IKetMacromoleculesContentRootProperty,
  IKetMonomerNode,
  IKetMonomerTemplate,
  KetConnectionType,
  KetNodeType,
  KetTemplateType,
} from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { CoreEditor, EditorSelection } from 'application/editor/internal';
import {
  createMonomersForVariantMonomer,
  monomerToDrawingEntity,
  templateToMonomerProps,
  variantMonomerToDrawingEntity,
} from 'domain/serializers/ket/fromKet/monomerToDrawingEntity';
import assert from 'assert';
import { polymerBondToDrawingEntity } from 'domain/serializers/ket/fromKet/polymerBondToDrawingEntity';
import { getMonomerUniqueKey } from 'domain/helpers/monomers';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { KetcherLogger } from 'utilities';
import { Chem } from 'domain/entities/Chem';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  getKetRef,
  modifyTransformation,
  populateStructWithSelection,
  setAmbiguousMonomerTemplatePrefix,
  setMonomerPrefix,
  setMonomerTemplatePrefix,
  switchIntoChemistryCoordSystem,
} from 'domain/serializers/ket/helpers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { validate } from 'domain/serializers/ket/validate';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { getAttachmentPointLabelWithBinaryShift } from 'domain/helpers/attachmentPointCalculations';
import { isNumber } from 'lodash';
import {
  AmbiguousMonomerType,
  AttachmentPointName,
  MonomerItemType,
} from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { imageToKet } from 'domain/serializers/ket/toKet/imageToKet';
import { imageToStruct } from 'domain/serializers/ket/fromKet/imageToStruct';
import {
  IMAGE_SERIALIZE_KEY,
  MULTITAIL_ARROW_SERIALIZE_KEY,
} from 'domain/constants';
import { multitailArrowToKet } from 'domain/serializers/ket/toKet/multitailArrowToKet';
import { multitailArrowToStruct } from 'domain/serializers/ket/fromKet/multitailArrowToStruct';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';
import { HydrogenBond } from 'domain/entities/HydrogenBond';

import { MACROMOLECULES_BOND_TYPES } from 'application/editor';

function parseNode(node: any, struct: any) {
  const type = node.type;
  switch (type) {
    case 'arrow': {
      rxnToStruct(node, struct);
      break;
    }
    case 'plus': {
      rxnToStruct(node, struct);
      break;
    }
    case 'simpleObject': {
      simpleObjectToStruct(node, struct);
      break;
    }
    case 'molecule': {
      const currentStruct = moleculeToStruct(node);
      if (node.stereoFlagPosition) {
        const fragment = currentStruct.frags.get(0)!;
        fragment.stereoFlagPosition = new Vec2(node.stereoFlagPosition);
      }

      currentStruct.mergeInto(struct);
      break;
    }
    case 'rgroup': {
      rgroupToStruct(node).mergeInto(struct);
      break;
    }
    case 'text': {
      textToStruct(node, struct);
      break;
    }
    case MULTITAIL_ARROW_SERIALIZE_KEY: {
      multitailArrowToStruct(node, struct);
      break;
    }
    case IMAGE_SERIALIZE_KEY: {
      imageToStruct(node, struct);
      break;
    }
    default:
      break;
  }
}
export class KetSerializer implements Serializer<Struct> {
  deserializeMicromolecules(content: string): Struct {
    const ket = JSON.parse(content);
    if (!validate(ket)) {
      throw new Error('Cannot deserialize input JSON.');
    }

    return KetSerializer.fillStruct(ket);
  }

  private static fillStruct(ket) {
    const resultingStruct = new Struct();
    const nodes = ket.root.nodes;

    Object.keys(nodes).forEach((i) => {
      if (nodes[i].type) parseNode(nodes[i], resultingStruct);
      else if (nodes[i].$ref) parseNode(ket[nodes[i].$ref], resultingStruct);
    });
    resultingStruct.name = ket.header ? ket.header.moleculeName : null;

    return resultingStruct;
  }

  serializeMicromolecules(struct: Struct, monomer?: BaseMonomer): string {
    const result: any = {
      root: {
        nodes: [],
      },
    };
    const header = headerToKet(struct);
    if (header) result.header = header;

    const ketNodes = prepareStructForKet(struct);

    let moleculeId = 0;
    ketNodes.forEach((item) => {
      switch (item.type) {
        case 'molecule': {
          result.root.nodes.push({ $ref: `mol${moleculeId}` });
          result[`mol${moleculeId++}`] = moleculeToKet(item.fragment!, monomer);
          break;
        }
        case 'rgroup': {
          result.root.nodes.push({ $ref: `rg${item.data!.rgnumber}` });
          result[`rg${item.data!.rgnumber}`] = rgroupToKet(
            item.fragment!,
            item.data,
          );
          break;
        }
        case 'plus': {
          result.root.nodes.push(plusToKet(item));
          break;
        }
        case 'arrow': {
          result.root.nodes.push(arrowToKet(item));
          break;
        }
        case 'simpleObject': {
          result.root.nodes.push(simpleObjectToKet(item));
          break;
        }
        case 'text': {
          result.root.nodes.push(textToKet(item));
          break;
        }
        case IMAGE_SERIALIZE_KEY: {
          result.root.nodes.push(imageToKet(item));
          break;
        }
        case MULTITAIL_ARROW_SERIALIZE_KEY:
          result.root.nodes.push(multitailArrowToKet(item));
          break;
        default:
          break;
      }
    });

    return JSON.stringify(result, null, 4);
  }

  private validateMonomerNodeTemplate(
    node: IKetMonomerNode,
    parsedFileContent: IKetMacromoleculesContent,
    editor: CoreEditor,
  ) {
    const template =
      parsedFileContent[setMonomerTemplatePrefix(node.templateId)];
    if (!template) {
      editor.events.error.dispatch('Error during file parsing');
      return true;
    }

    return false;
  }

  private validateConnectionTypeAndEndpoints(
    connection: IKetConnection,
    editor: CoreEditor,
  ) {
    if (
      connection.connectionType !== KetConnectionType.SINGLE &&
      connection.connectionType !== KetConnectionType.HYDROGEN
    ) {
      editor.events.error.dispatch('Error during file parsing');
      return true;
    }
    return false;
  }

  parseAndValidateMacromolecules(fileContent: string) {
    const editor = CoreEditor.provideEditorInstance();
    let parsedFileContent: IKetMacromoleculesContent;
    try {
      parsedFileContent = JSON.parse(fileContent);
    } catch (e) {
      KetcherLogger.error(
        'ketSerializer.ts::KetSerializer::parseAndValidateMacromolecules',
        e,
      );
      return { error: true };
    }
    let error = false;
    parsedFileContent.root.nodes.forEach((node) => {
      const nodeDefinition = parsedFileContent[node.$ref];

      if (nodeDefinition?.type === 'monomer') {
        error = this.validateMonomerNodeTemplate(
          nodeDefinition,
          parsedFileContent,
          editor,
        );
      }
    });
    if (error) {
      return { error: true };
    }
    parsedFileContent.root.connections?.forEach(
      (connection: IKetConnection) => {
        this.validateConnectionTypeAndEndpoints(connection, editor);
      },
    );
    return {
      error,
      parsedFileContent,
    };
  }

  deserializeToStruct(fileContent: string) {
    const struct = new Struct();
    const deserializedContent = this.deserializeToDrawingEntities(fileContent);

    assert(deserializedContent);

    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      deserializedContent?.drawingEntitiesManager,
      struct,
    );
    return struct;
  }

  private filterMacromoleculesContent(
    parsedFileContent: IKetMacromoleculesContent,
  ) {
    const fileContentForMicromolecules = {
      ...parsedFileContent,
      root: {
        nodes: parsedFileContent.root.nodes.filter((node) => {
          const nodeDefinition = parsedFileContent[node.$ref];

          return (
            nodeDefinition?.type !== KetNodeType.MONOMER &&
            nodeDefinition?.type !== KetNodeType.AMBIGUOUS_MONOMER
          );
        }),
      },
    };
    parsedFileContent.root.nodes.forEach((node) => {
      const nodeDefinition = parsedFileContent[node.$ref];
      if (
        nodeDefinition?.type === KetNodeType.MONOMER ||
        nodeDefinition?.type === KetNodeType.AMBIGUOUS_MONOMER
      ) {
        fileContentForMicromolecules[node.$ref] = undefined;
      }
    });

    parsedFileContent.root.templates?.forEach((template) => {
      fileContentForMicromolecules[template.$ref] = undefined;
    });

    Object.entries(
      fileContentForMicromolecules as IKetMacromoleculesContent,
    ).forEach(([key, value]) => {
      if (value?.type === KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE) {
        fileContentForMicromolecules[key] = undefined;
      }
    });

    return fileContentForMicromolecules;
  }

  public static getTemplateAttachmentPoints(template: IKetMonomerTemplate) {
    return template.unresolved
      ? template.attachmentPoints?.map((_, index) => {
          return {
            attachmentAtom: index,
            leavingGroup: {
              atoms: [],
            },
          };
        })
      : template.attachmentPoints;
  }

  public static convertMonomerTemplateToStruct(template: IKetMonomerTemplate) {
    const attachmentPoints = template.attachmentPoints || [];

    return KetSerializer.fillStruct({
      root: {
        nodes: [{ $ref: 'mol0' }],
      },
      mol0: {
        ...template,
        type: 'molecule',
        atoms: template.unresolved
          ? attachmentPoints?.map((_, index) => {
              return {
                label: 'C',
                location: [index, index, index],
              };
            })
          : template.atoms,
        bonds: template.unresolved
          ? attachmentPoints?.map((_, index) => {
              if (index === attachmentPoints.length - 1) {
                return {
                  type: 1,
                  atoms: [0, attachmentPoints.length - 1],
                };
              }

              return {
                type: 1,
                atoms: [index, index + 1],
              };
            })
          : template.bonds,
        attachmentPoints: KetSerializer.getTemplateAttachmentPoints(template),
      },
      header: {
        moleculeName: template.fullName,
      },
    });
  }

  public convertMonomerTemplateToLibraryItem(
    template: IKetMonomerTemplate,
  ): MonomerItemType {
    const monomerLibraryItem = {
      label: template.alias || template.id,
      struct: KetSerializer.convertMonomerTemplateToStruct(template),
      props: templateToMonomerProps(template),
      attachmentPoints: KetSerializer.getTemplateAttachmentPoints(template),
    };
    KetSerializer.fillStructRgLabelsByMonomerTemplate(
      template,
      monomerLibraryItem,
    );

    return monomerLibraryItem;
  }

  public static fillStructRgLabelsByMonomerTemplate(
    template: IKetMonomerTemplate,
    monomerItem: MonomerItemType,
  ) {
    if (monomerItem.props.unresolved) {
      return;
    }

    const { attachmentPointsList } =
      BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
        template.attachmentPoints || [],
      );

    template.attachmentPoints?.forEach(
      (attachmentPoint, attachmentPointIndex) => {
        const firstAtomInLeavingGroup = attachmentPoint.leavingGroup?.atoms[0];
        const leavingGroupAtom = monomerItem.struct.atoms.get(
          isNumber(firstAtomInLeavingGroup)
            ? firstAtomInLeavingGroup
            : attachmentPoint.attachmentAtom,
        );
        assert(leavingGroupAtom);
        leavingGroupAtom.rglabel = (
          0 |
          (1 <<
            (Number(
              (attachmentPoint.label
                ? attachmentPoint.label
                : attachmentPointsList[attachmentPointIndex]
              ).replace('R', ''),
            ) -
              1))
        ).toString();
        assert(monomerItem.props.MonomerCaps);
        monomerItem.props.MonomerCaps[
          getAttachmentPointLabelWithBinaryShift(
            Number(leavingGroupAtom.rglabel),
          )
        ] = leavingGroupAtom.label;
        leavingGroupAtom.label = 'R#';
      },
    );
  }

  deserializeToDrawingEntities(fileContent: string) {
    const { error: hasValidationErrors, parsedFileContent } =
      this.parseAndValidateMacromolecules(fileContent);
    if (hasValidationErrors || !parsedFileContent) return;
    const command = new Command();
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const monomerIdsMap = {};
    parsedFileContent.root.nodes.forEach((node) => {
      const nodeDefinition = parsedFileContent[node.$ref];

      switch (nodeDefinition?.type) {
        case KetNodeType.MONOMER: {
          const template = parsedFileContent[
            setMonomerTemplatePrefix(nodeDefinition.templateId)
          ] as IKetMonomerTemplate;
          assert(template);
          const struct = KetSerializer.convertMonomerTemplateToStruct(template);
          const monomerAdditionCommand = monomerToDrawingEntity(
            nodeDefinition,
            template,
            struct,
            drawingEntitiesManager,
          );
          const monomer = monomerAdditionCommand.operations[0]
            .monomer as BaseMonomer;
          monomerIdsMap[node.$ref] = monomer?.id;

          KetSerializer.fillStructRgLabelsByMonomerTemplate(
            template,
            monomer.monomerItem,
          );

          command.merge(monomerAdditionCommand);
          break;
        }
        case KetNodeType.AMBIGUOUS_MONOMER: {
          const template = parsedFileContent[
            setAmbiguousMonomerTemplatePrefix(nodeDefinition.templateId)
          ] as IKetAmbiguousMonomerTemplate;
          assert(template);

          const monomerAdditionCommand = variantMonomerToDrawingEntity(
            drawingEntitiesManager,
            nodeDefinition,
            template,
            parsedFileContent,
          );
          const monomer = monomerAdditionCommand.operations[0]
            .monomer as BaseMonomer;

          monomerIdsMap[node.$ref] = monomer?.id;

          command.merge(monomerAdditionCommand);
          break;
        }
        default:
          break;
      }
    });
    const fileContentForMicromolecules =
      this.filterMacromoleculesContent(parsedFileContent);

    const deserializedMicromolecules = this.deserializeMicromolecules(
      JSON.stringify(fileContentForMicromolecules),
    );

    const structToDrawingEntitiesConversionResult =
      MacromoleculesConverter.convertStructToDrawingEntities(
        deserializedMicromolecules,
        drawingEntitiesManager,
      );
    const localAtomIdToGlobalAtomId = new Map<number, number>();

    command.merge(structToDrawingEntitiesConversionResult.modelChanges);

    structToDrawingEntitiesConversionResult.fragmentIdToMonomer.forEach(
      (monomer, fragmentId) => {
        monomerIdsMap[`mol${fragmentId}`] = monomer.id;
      },
    );

    structToDrawingEntitiesConversionResult.fragmentIdToAtomIdMap.forEach(
      (_atomIdsMap) => {
        _atomIdsMap.forEach((globalAtomId, localAtomId) => {
          localAtomIdToGlobalAtomId.set(localAtomId, globalAtomId);
        });
      },
    );

    const superatomMonomerToUsedAttachmentPoint = new Map<
      BaseMonomer,
      Set<string>
    >();

    parsedFileContent.root.connections?.forEach((connection) => {
      switch (connection.connectionType) {
        case KetConnectionType.SINGLE: {
          const firstMonomer = drawingEntitiesManager.monomers.get(
            Number(
              monomerIdsMap[
                connection.endpoint1.monomerId ||
                  connection.endpoint1.moleculeId
              ],
            ),
          );
          const secondMonomer = drawingEntitiesManager.monomers.get(
            Number(
              monomerIdsMap[
                connection.endpoint2.monomerId ||
                  connection.endpoint2.moleculeId
              ],
            ),
          );

          if (!firstMonomer || !secondMonomer) {
            return;
          }

          if (
            !isMonomerSgroupWithAttachmentPoints(firstMonomer) &&
            !isMonomerSgroupWithAttachmentPoints(secondMonomer) &&
            (firstMonomer.monomerItem.props.isMicromoleculeFragment ||
              secondMonomer.monomerItem.props.isMicromoleculeFragment)
          ) {
            const atomId = Number(
              connection.endpoint1.atomId || connection.endpoint2.atomId,
            );

            const atom = MacromoleculesConverter.findAtomByMicromoleculeAtomId(
              drawingEntitiesManager,
              atomId,
              firstMonomer.monomerItem.props.isMicromoleculeFragment
                ? firstMonomer
                : secondMonomer,
            );
            const attachmentPointName =
              connection.endpoint1.attachmentPointId ||
              connection.endpoint2.attachmentPointId;

            if (!atom || !attachmentPointName) {
              return;
            }

            const bondAdditionCommand =
              drawingEntitiesManager.addMonomerToAtomBond(
                firstMonomer.monomerItem.props.isMicromoleculeFragment
                  ? secondMonomer
                  : firstMonomer,
                atom,
                attachmentPointName as AttachmentPointName,
              );

            command.merge(bondAdditionCommand);
          } else {
            const bondAdditionCommand = polymerBondToDrawingEntity(
              connection,
              drawingEntitiesManager,
              localAtomIdToGlobalAtomId,
              superatomMonomerToUsedAttachmentPoint,
              firstMonomer,
              secondMonomer,
            );

            command.merge(bondAdditionCommand);
          }

          break;
        }
        case KetConnectionType.HYDROGEN: {
          const firstMonomer = drawingEntitiesManager.monomers.get(
            Number(monomerIdsMap[connection.endpoint1.monomerId]),
          );
          const secondMonomer = drawingEntitiesManager.monomers.get(
            Number(monomerIdsMap[connection.endpoint2.monomerId]),
          );

          if (!firstMonomer || !secondMonomer) {
            return;
          }

          command.merge(
            drawingEntitiesManager.createPolymerBond(
              firstMonomer,
              secondMonomer,
              AttachmentPointName.HYDROGEN,
              AttachmentPointName.HYDROGEN,
              MACROMOLECULES_BOND_TYPES.HYDROGEN,
            ),
          );

          break;
        }
        default:
          break;
      }
    });

    return { modelChanges: command, drawingEntitiesManager };
  }

  deserialize(fileContent: string) {
    return this.deserializeToStruct(fileContent);
  }

  getConnectionMonomerEndpoint(
    monomer: BaseMonomer,
    polymerBond: PolymerBond,
    monomerIdMap: Map<number, number>,
  ): IKetConnectionMonomerEndPoint {
    const monomerId = monomerIdMap.get(monomer.id);

    return {
      monomerId: setMonomerPrefix(isNumber(monomerId) ? monomerId : monomer.id),
      attachmentPointId:
        polymerBond instanceof HydrogenBond
          ? undefined
          : monomer.getAttachmentPointByBond(polymerBond),
    };
  }

  getConnectionMoleculeEndpoint(
    monomer: BaseMonomer,
    polymerBond: PolymerBond,
    monomerToAtomIdMap: Map<BaseMonomer, Map<number, number>>,
    struct: Struct,
  ): IKetConnectionMoleculeEndPoint {
    const { attachmentAtomId, globalAttachmentAtomId } =
      MacromoleculesConverter.findAttachmentPointAtom(
        polymerBond,
        monomer,
        monomerToAtomIdMap,
      );

    return {
      moleculeId: `mol${
        struct.atoms.get(globalAttachmentAtomId as number)?.fragment
      }`,
      atomId: `${attachmentAtomId as number}`,
    };
  }

  private serializeMonomerTemplate(
    templateId: string,
    monomer: BaseMonomer,
    fileContent: IKetMacromoleculesContentRootProperty,
  ) {
    const [, , monomerClass] = monomerFactory(monomer.monomerItem);
    const templateNameWithPrefix = setMonomerTemplatePrefix(templateId);

    if (fileContent[templateNameWithPrefix]) {
      return;
    }

    fileContent[templateNameWithPrefix] = {
      ...JSON.parse(
        this.serializeMicromolecules(monomer.monomerItem.struct, monomer),
      ).mol0,
      type: 'monomerTemplate',
      class: monomer.monomerItem.props.MonomerClass || monomerClass,
      classHELM: monomer.monomerItem.props.MonomerType,
      id: templateId,
      fullName: monomer.monomerItem.props.Name,
      alias: monomer.monomerItem.label,
      attachmentPoints: monomer.monomerItem.attachmentPoints,
      idtAliases: monomer.monomerItem.props.idtAliases,
      unresolved: monomer instanceof UnresolvedMonomer ? true : undefined,
    };
    // CHEMs do not have natural analog
    if (monomer.monomerItem.props.MonomerType !== 'CHEM') {
      fileContent[templateNameWithPrefix].naturalAnalogShort =
        monomer.monomerItem.props.MonomerNaturalAnalogCode;
    }

    fileContent.root.templates.push(getKetRef(templateNameWithPrefix));
  }

  private serializeVariantMonomerTemplate(
    templateId: string,
    variantMonomer: AmbiguousMonomer,
    fileContent: IKetMacromoleculesContentRootProperty,
  ) {
    const templateNameWithPrefix =
      setAmbiguousMonomerTemplatePrefix(templateId);

    if (fileContent[templateNameWithPrefix]) {
      return;
    }

    fileContent[templateNameWithPrefix] = {
      type: 'ambiguousMonomerTemplate',
      id: templateId,
      alias: variantMonomer.label,
      idtAliases: variantMonomer.variantMonomerItem.idtAliases,
      subtype: variantMonomer.variantMonomerItem.subtype,
      options: variantMonomer.variantMonomerItem.options,
    };

    fileContent.root.templates.push(getKetRef(templateNameWithPrefix));

    variantMonomer.monomers.forEach((monomer) => {
      const monomerTemplateId =
        monomer.monomerItem.props.id ||
        getMonomerUniqueKey(monomer.monomerItem);

      this.serializeMonomerTemplate(monomerTemplateId, monomer, fileContent);
    });
  }

  serializeMacromolecules(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
    needSetSelection = false,
  ) {
    const fileContent: IKetMacromoleculesContentRootProperty = {
      root: {
        nodes: [],
        connections: [],
        templates: [],
      },
    };
    const monomerToAtomIdMap = new Map<BaseMonomer, Map<number, number>>();
    const monomerToBondIdMap = new Map<BaseMonomer, Map<number, number>>();
    const moleculesSelection: { atoms: number[]; bonds: number[] } = {
      atoms: [],
      bonds: [],
    };
    const monomerIdMap = new Map<number, number>();
    let nextMonomerId = 0;

    drawingEntitiesManager.monomers.forEach((monomer) => {
      const monomerItem = monomer.monomerItem;

      if (
        monomer instanceof Chem &&
        monomerItem.props.isMicromoleculeFragment
      ) {
        const atomIdMap = new Map<number, number>();
        const bondIdMap = new Map<number, number>();

        monomerItem.struct.mergeInto(
          struct,
          null,
          null,
          false,
          false,
          atomIdMap,
          null,
          null,
          null,
          null,
          null,
          bondIdMap,
        );
        monomerToAtomIdMap.set(monomer, atomIdMap);
        monomerToBondIdMap.set(monomer, bondIdMap);
      } else {
        let templateId;
        const monomerKey = setMonomerPrefix(nextMonomerId);
        const position: Vec2 = switchIntoChemistryCoordSystem(
          new Vec2(monomer.position.x, monomer.position.y),
        );

        monomerIdMap.set(monomer.id, nextMonomerId);

        if (monomer instanceof AmbiguousMonomer) {
          const ambiguousMonomerItem = monomer.variantMonomerItem;
          templateId =
            ambiguousMonomerItem.subtype +
            '_' +
            ambiguousMonomerItem.options.reduce(
              (templateId, option) =>
                templateId +
                '_' +
                option.templateId +
                '_' +
                (option.probability || option.ratio || ''),
              '',
            );
        } else {
          templateId = monomerItem.props.id || getMonomerUniqueKey(monomerItem);
        }

        const { seqId, expanded, transformation } = monomerItem;
        const isExpandedDefined = expanded !== undefined;
        const isTransformationDefined =
          transformation !== undefined &&
          Object.keys(transformation).length > 0;

        fileContent[monomerKey] = {
          type:
            monomer instanceof AmbiguousMonomer
              ? KetNodeType.AMBIGUOUS_MONOMER
              : KetNodeType.MONOMER,
          id: nextMonomerId.toString(),
          position: {
            x: position.x,
            y: position.y,
          },
          alias: monomer.label,
          templateId,
          seqid: seqId,
          ...(isExpandedDefined && {
            expanded,
          }),
          ...(isTransformationDefined && {
            transformation: modifyTransformation(transformation),
          }),
          selected: (needSetSelection && monomer.selected) || undefined,
        };
        fileContent.root.nodes.push(getKetRef(monomerKey));

        nextMonomerId++;

        if (monomer instanceof AmbiguousMonomer) {
          this.serializeVariantMonomerTemplate(
            templateId,
            monomer,
            fileContent,
          );
        } else {
          this.serializeMonomerTemplate(templateId, monomer, fileContent);
        }
      }
    });

    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      fileContent.root.connections.push({
        connectionType:
          polymerBond instanceof HydrogenBond
            ? KetConnectionType.HYDROGEN
            : KetConnectionType.SINGLE,
        endpoint1: polymerBond.firstMonomer.monomerItem.props
          .isMicromoleculeFragment
          ? (this.getConnectionMoleculeEndpoint(
              polymerBond.firstMonomer,
              polymerBond,
              monomerToAtomIdMap,
              struct,
            ) as IKetConnectionEndPoint)
          : (this.getConnectionMonomerEndpoint(
              polymerBond.firstMonomer,
              polymerBond,
              monomerIdMap,
            ) as IKetConnectionEndPoint),
        endpoint2: polymerBond.secondMonomer.monomerItem.props
          .isMicromoleculeFragment
          ? (this.getConnectionMoleculeEndpoint(
              polymerBond.secondMonomer,
              polymerBond,
              monomerToAtomIdMap,
              struct,
            ) as IKetConnectionEndPoint)
          : (this.getConnectionMonomerEndpoint(
              polymerBond.secondMonomer,
              polymerBond,
              monomerIdMap,
            ) as IKetConnectionEndPoint),
        selected: (needSetSelection && polymerBond.selected) || undefined,
      });
    });

    drawingEntitiesManager.monomerToAtomBonds.forEach((monomerToAtomBond) => {
      const monomer = monomerToAtomBond.monomer;
      const atomIdMap = monomerToAtomIdMap.get(monomerToAtomBond.atom.monomer);
      const globalAtomId = atomIdMap?.get(
        monomerToAtomBond.atom.atomIdInMicroMode,
      );
      const monomerId = monomerIdMap.get(monomer.id);

      if (!isNumber(globalAtomId) || !isNumber(monomerId)) {
        return;
      }

      fileContent.root.connections.push({
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerId: setMonomerPrefix(monomerId),
          attachmentPointId:
            monomerToAtomBond.monomer.getAttachmentPointByBond(
              monomerToAtomBond,
            ),
        } as IKetConnectionEndPoint,
        endpoint2: {
          moleculeId: `mol${struct.atoms.get(globalAtomId)?.fragment}`,
          atomId: String(monomerToAtomBond.atom.atomIdInMicroMode),
        } as IKetConnectionEndPoint,
        selected: (needSetSelection && monomerToAtomBond.selected) || undefined,
      });
    });

    if (needSetSelection) {
      drawingEntitiesManager.atoms.forEach((atom) => {
        if (atom.selected) {
          const atomIdMap = monomerToAtomIdMap.get(atom.monomer);
          const globalAtomId = atomIdMap?.get(atom.atomIdInMicroMode);

          if (isNumber(globalAtomId)) {
            moleculesSelection.atoms.push(globalAtomId);
          }
        }
      });

      drawingEntitiesManager.bonds.forEach((bond) => {
        if (bond.selected) {
          const bondIdMap = monomerToBondIdMap.get(bond.firstAtom.monomer);
          const globalBondId = bondIdMap?.get(bond.bondIdInMicroMode);

          if (isNumber(globalBondId)) {
            moleculesSelection.bonds.push(globalBondId);
          }
        }
      });
    }

    drawingEntitiesManager.rxnArrows.forEach((rxnArrow) => {
      const arrow = new MicromoleculeRxnArrow({
        mode: rxnArrow.type,
        pos: [rxnArrow.startPosition, rxnArrow.endPosition],
        height: rxnArrow.height,
        initiallySelected: rxnArrow.initiallySelected,
      });

      struct.rxnArrows.add(arrow);
    });

    drawingEntitiesManager.multitailArrows.forEach((multitailArrow) => {
      const arrow = MicromoleculeMultitailArrow.fromKetNode(
        multitailArrow.toKetNode(),
      );

      struct.multitailArrows.add(arrow);
    });

    drawingEntitiesManager.rxnPluses.forEach((rxnPlus) => {
      const micromoleculeRxnPlus = new MicromoleculeRxnPlus({
        pp: rxnPlus.position,
        initiallySelected: rxnPlus.initiallySelected,
      });

      struct.rxnPluses.add(micromoleculeRxnPlus);
    });

    drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);

    return {
      serializedMacromolecules: fileContent,
      micromoleculesStruct: struct,
      moleculesSelection,
    };
  }

  public static removeLeavingGroupsFromConnectedAtoms(_struct: Struct) {
    const struct = _struct.clone();

    struct.atoms.forEach((_atom, atomId) => {
      if (Atom.isHiddenLeavingGroupAtom(struct, atomId, false, true)) {
        struct.atoms.delete(atomId);
      }
    });

    struct.bonds.forEach((bond, bondId) => {
      if (Bond.isBondToHiddenLeavingGroup(struct, bond)) {
        struct.bonds.delete(bondId);
      }
    });

    struct.sgroups.forEach((sgroup) => {
      const attachmentPoints = sgroup.getAttachmentPoints();
      const attachmentPointsToReplace: Map<
        SGroupAttachmentPoint,
        SGroupAttachmentPoint
      > = new Map();
      attachmentPoints.forEach((attachmentPoint) => {
        if (
          isNumber(attachmentPoint.leaveAtomId) &&
          Atom.isHiddenLeavingGroupAtom(
            struct,
            attachmentPoint.leaveAtomId,
            true,
            true,
          )
        ) {
          const attachmentPointClone = new SGroupAttachmentPoint(
            attachmentPoint.atomId,
            undefined,
            attachmentPoint.attachmentId,
            attachmentPoint.attachmentPointNumber,
          );
          attachmentPointsToReplace.set(attachmentPoint, attachmentPointClone);
          sgroup.atoms.splice(
            sgroup.atoms.indexOf(attachmentPoint.leaveAtomId),
            1,
          );
        }
      });
      attachmentPointsToReplace.forEach(
        (attachmentPointToAdd, attachmentPointToDelete) => {
          sgroup.removeAttachmentPoint(attachmentPointToDelete);
          sgroup.addAttachmentPoint(attachmentPointToAdd);
        },
      );
    });

    return struct;
  }

  serialize(
    _struct: Struct,
    drawingEntitiesManager = new DrawingEntitiesManager(),
    selection?: EditorSelection,
    isBeautified = true, // TODO make false by default
    needSetSelectionToMacromolecules = false,
  ) {
    const struct = KetSerializer.removeLeavingGroupsFromConnectedAtoms(_struct);
    struct.enableInitiallySelected();
    const populatedStruct = populateStructWithSelection(
      struct,
      selection,
      true,
    );
    MacromoleculesConverter.convertStructToDrawingEntities(
      populatedStruct,
      drawingEntitiesManager,
    );

    const {
      serializedMacromolecules,
      micromoleculesStruct,
      moleculesSelection,
    } = this.serializeMacromolecules(
      new Struct(),
      drawingEntitiesManager,
      needSetSelectionToMacromolecules,
    );

    if (selection === undefined) {
      // if selection is not provided, then reset all initially selected flags
      // before serialization of micromolecules.
      // It is case of saving molecules in macromolecules mode, so we don't send to indigo/save selection.
      micromoleculesStruct.enableInitiallySelected();
    }

    // need for selection population to atoms and bonds from macromolecules mode
    if (needSetSelectionToMacromolecules) {
      populateStructWithSelection(micromoleculesStruct, moleculesSelection);
    }

    const serializedMicromoleculesStruct = JSON.parse(
      this.serializeMicromolecules(micromoleculesStruct),
    );

    micromoleculesStruct.disableInitiallySelected();
    const fileContent = {
      ...serializedMicromoleculesStruct,
      ...serializedMacromolecules,
    };
    fileContent.root.nodes = [
      ...serializedMacromolecules.root.nodes,
      ...serializedMicromoleculesStruct.root.nodes,
    ];

    return JSON.stringify(
      fileContent,
      null,
      isBeautified ? 4 : undefined,
    ) as unknown as string;
  }

  convertMonomersLibrary(monomersLibrary: IKetMacromoleculesContent) {
    const library: MonomerItemType[] & AmbiguousMonomerType[] = [];

    monomersLibrary.root.templates.forEach((templateRef) => {
      const template = monomersLibrary[templateRef.$ref];

      if (!template) {
        KetcherLogger.error(
          `There is a ref for monomer template ${templateRef.$ref}, but template definition is not found`,
        );

        return;
      }

      switch (template.type) {
        case KetTemplateType.MONOMER_TEMPLATE: {
          library.push(
            this.convertMonomerTemplateToLibraryItem(
              template as IKetMonomerTemplate,
            ),
          );

          break;
        }
        case KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE: {
          const variantMonomerTemplate =
            template as IKetAmbiguousMonomerTemplate;
          const variantMonomerLibraryItem: AmbiguousMonomerType = {
            id: variantMonomerTemplate.id,
            label: variantMonomerTemplate.alias || '%',
            idtAliases: variantMonomerTemplate.idtAliases,
            isAmbiguous: true,
            monomers: createMonomersForVariantMonomer(
              variantMonomerTemplate,
              monomersLibrary,
            ),
            options: variantMonomerTemplate.options,
            subtype: variantMonomerTemplate.subtype,
          };

          library.push(variantMonomerLibraryItem);

          break;
        }
      }
    });

    return library;
  }
}
