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

import { Struct, Vec2 } from 'domain/entities';
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
  IKetConnection,
  IKetConnectionEndPoint,
  IKetConnectionMoleculeEndPoint,
  IKetConnectionMonomerEndPoint,
  IKetMacromoleculesContent,
  IKetMacromoleculesContentRootProperty,
  IKetMonomerNode,
  IKetMonomerTemplate,
  KetConnectionType,
  KetTemplateType,
} from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { CoreEditor, EditorSelection } from 'application/editor/internal';
import {
  monomerToDrawingEntity,
  templateToMonomerProps,
} from 'domain/serializers/ket/fromKet/monomerToDrawingEntity';
import assert from 'assert';
import { polymerBondToDrawingEntity } from 'domain/serializers/ket/fromKet/polymerBondToDrawingEntity';
import { getMonomerUniqueKey } from 'domain/helpers/monomers';
import {
  MONOMER_CONST,
  monomerFactory,
} from 'application/editor/operations/monomer/monomerFactory';
import { KetcherLogger } from 'utilities';
import { Chem } from 'domain/entities/Chem';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  getKetRef,
  populateStructWithSelection,
  setMonomerPrefix,
  setMonomerTemplatePrefix,
  switchIntoChemistryCoordSystem,
} from 'domain/serializers/ket/helpers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { validate } from 'domain/serializers/ket/validate';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { getAttachmentPointLabelWithBinaryShift } from 'domain/helpers/attachmentPointCalculations';
import { isNumber } from 'lodash';
import { MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { rasterImageToKet } from 'domain/serializers/ket/toKet/rasterImageToKet';
import { rasterImageToStruct } from 'domain/serializers/ket/fromKet/rasterImageToStruct';
import { RASTER_IMAGE_KEY } from 'domain/entities/rasterImage';

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
    case RASTER_IMAGE_KEY: {
      rasterImageToStruct(node, struct);
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

    return this.fillStruct(ket);
  }

  fillStruct(ket) {
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
        case RASTER_IMAGE_KEY: {
          result.root.nodes.push(rasterImageToKet(item));
          break;
        }
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
    if (connection.connectionType !== KetConnectionType.SINGLE) {
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
            nodeDefinition?.type !== 'monomer' &&
            nodeDefinition?.type !== 'group'
          );
        }),
      },
    };
    parsedFileContent.root.nodes.forEach((node) => {
      const nodeDefinition = parsedFileContent[node.$ref];
      if (
        nodeDefinition?.type === 'monomer' ||
        nodeDefinition?.type === 'group'
      ) {
        fileContentForMicromolecules[node.$ref] = undefined;
      }
    });

    parsedFileContent.root.templates?.forEach((template) => {
      fileContentForMicromolecules[template.$ref] = undefined;
    });

    return fileContentForMicromolecules;
  }

  public convertMonomerTemplateToStruct(template: IKetMonomerTemplate) {
    return this.fillStruct({
      root: {
        nodes: [{ $ref: 'mol0' }],
      },
      mol0: {
        ...template,
        type: 'molecule',
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
      struct: this.convertMonomerTemplateToStruct(template),
      props: templateToMonomerProps(template),
      attachmentPoints: template.attachmentPoints,
    };
    this.fillStructRgLabelsByMonomerTemplate(template, monomerLibraryItem);

    return monomerLibraryItem;
  }

  public fillStructRgLabelsByMonomerTemplate(
    template: IKetMonomerTemplate,
    monomerItem: MonomerItemType,
  ) {
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
        case 'monomer': {
          const template = parsedFileContent[
            setMonomerTemplatePrefix(nodeDefinition.templateId)
          ] as IKetMonomerTemplate;
          assert(template);
          const struct = this.convertMonomerTemplateToStruct(template);
          const monomerAdditionCommand = monomerToDrawingEntity(
            nodeDefinition,
            template,
            struct,
            drawingEntitiesManager,
          );
          const monomer = monomerAdditionCommand.operations[0]
            .monomer as BaseMonomer;
          monomerIdsMap[node.$ref] = monomer?.id;

          this.fillStructRgLabelsByMonomerTemplate(
            template,
            monomer.monomerItem,
          );

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

    let fragmentNumber = 1;
    const fragments = MacromoleculesConverter.getFragmentsGroupedBySgroup(
      deserializedMicromolecules,
    );
    const atomIdMap = new Map<number, number>();
    fragments.forEach((_fragment) => {
      const fragmentStruct = deserializedMicromolecules.getFragment(
        _fragment,
        false,
        atomIdMap,
      );
      const fragmentBbox = fragmentStruct.getCoordBoundingBox();
      const monomerAdditionCommand = drawingEntitiesManager.addMonomer(
        {
          struct: fragmentStruct,
          label: 'F' + fragmentNumber,
          colorScheme: undefined,
          favorite: false,
          props: {
            Name: 'F' + fragmentNumber,
            MonomerNaturalAnalogCode: '',
            MonomerName: 'F' + fragmentNumber,
            MonomerType: MONOMER_CONST.CHEM,
            isMicromoleculeFragment: true,
          },
        },
        new Vec2(
          fragmentBbox.max.x - (fragmentBbox.max.x - fragmentBbox.min.x) / 2,
          fragmentBbox.max.y - (fragmentBbox.max.y - fragmentBbox.min.y) / 2,
        ),
      );
      const monomer = monomerAdditionCommand.operations[0].monomer;
      monomerIdsMap[`mol${fragmentNumber - 1}`] = monomer?.id;
      command.merge(monomerAdditionCommand);
      fragmentNumber++;
    });

    const superatomMonomerToUsedAttachmentPoint = new Map<
      BaseMonomer,
      Set<string>
    >();

    parsedFileContent.root.connections?.forEach((connection) => {
      switch (connection.connectionType) {
        case KetConnectionType.SINGLE: {
          const bondAdditionCommand = polymerBondToDrawingEntity(
            connection,
            drawingEntitiesManager,
            monomerIdsMap,
            atomIdMap,
            superatomMonomerToUsedAttachmentPoint,
          );
          command.merge(bondAdditionCommand);
          break;
        }
        default:
          break;
      }
    });

    drawingEntitiesManager.setMicromoleculesHiddenEntities(
      deserializedMicromolecules,
    );

    return { modelChanges: command, drawingEntitiesManager };
  }

  deserialize(fileContent: string) {
    return this.deserializeToStruct(fileContent);
  }

  getConnectionMonomerEndpoint(
    monomer: BaseMonomer,
    polymerBond: PolymerBond,
  ): IKetConnectionMonomerEndPoint {
    return {
      monomerId: setMonomerPrefix(monomer.id),
      attachmentPointId: monomer.getAttachmentPointByBond(polymerBond),
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

  serializeMacromolecules(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const fileContent: IKetMacromoleculesContentRootProperty = {
      root: {
        nodes: [],
        connections: [],
        templates: [],
      },
    };
    const monomerToAtomIdMap = new Map<BaseMonomer, Map<number, number>>();

    drawingEntitiesManager.monomers.forEach((monomer) => {
      if (
        monomer instanceof Chem &&
        monomer.monomerItem.props.isMicromoleculeFragment
      ) {
        const atomIdMap = new Map<number, number>();
        monomer.monomerItem.struct.mergeInto(
          struct,
          null,
          null,
          false,
          false,
          atomIdMap,
        );
        monomerToAtomIdMap.set(monomer, atomIdMap);
      } else {
        const templateId =
          monomer.monomerItem.props.id ||
          getMonomerUniqueKey(monomer.monomerItem);
        const monomerName = setMonomerPrefix(monomer.id);
        const position: Vec2 = switchIntoChemistryCoordSystem(
          new Vec2(monomer.position.x, monomer.position.y),
        );
        fileContent[monomerName] = {
          type: 'monomer',
          id: monomer.id.toString(),
          position: {
            x: position.x,
            y: position.y,
          },
          alias: monomer.label,
          templateId,
          seqid: monomer.monomerItem.seqId,
        };
        fileContent.root.nodes.push(getKetRef(monomerName));
        const [, , monomerClass] = monomerFactory(monomer.monomerItem);
        const templateNameWithPrefix = setMonomerTemplatePrefix(templateId);
        if (!fileContent[templateNameWithPrefix]) {
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
          };
          // CHEMs do not have natural analog
          if (monomer.monomerItem.props.MonomerType !== 'CHEM') {
            fileContent[templateNameWithPrefix].naturalAnalogShort =
              monomer.monomerItem.props.MonomerNaturalAnalogCode;
          }
          fileContent.root.templates.push(getKetRef(templateNameWithPrefix));
        }
      }
    });
    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      fileContent.root.connections.push({
        connectionType: KetConnectionType.SINGLE,
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
            ) as IKetConnectionEndPoint),
      });
    });

    drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);

    return {
      serializedMacromolecules: fileContent,
      micromoleculesStruct: struct,
    };
  }

  serialize(
    struct: Struct,
    drawingEntitiesManager = new DrawingEntitiesManager(),
    selection?: EditorSelection,
  ) {
    struct.enableInitiallySelected();
    const populatedStruct = populateStructWithSelection(struct, selection);
    MacromoleculesConverter.convertStructToDrawingEntities(
      populatedStruct,
      drawingEntitiesManager,
    );

    const { serializedMacromolecules, micromoleculesStruct } =
      this.serializeMacromolecules(new Struct(), drawingEntitiesManager);

    if (selection === undefined) {
      // if selection is not provided, then reset all initially selected flags
      // before serialization of micromolecules.
      // It is case of saving molecules in macromolecules mode, so we don't send to indigo/save selection.
      micromoleculesStruct.enableInitiallySelected();
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

    return JSON.stringify(fileContent, null, 4) as unknown as string;
  }

  convertMonomersLibrary(monomersLibrary: IKetMacromoleculesContent) {
    const library: MonomerItemType[] = [];

    monomersLibrary.root.templates.forEach((templateRef) => {
      const template = monomersLibrary[templateRef.$ref];

      if (template.type !== KetTemplateType.MONOMER_TEMPLATE) {
        return;
      }

      library.push(
        this.convertMonomerTemplateToLibraryItem(
          template as IKetMonomerTemplate,
        ),
      );
    });

    return library;
  }
}
