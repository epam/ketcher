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
import { validate } from './validate';
import {
  IKetConnection,
  IKetMacromoleculesContent,
  IKetMonomerNode,
} from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { CoreEditor } from 'application/editor';
import { monomerToDrawingEntity } from 'domain/serializers/ket/fromKet/monomerToDrawingEntity';
import assert from 'assert';
import { polymerBondToDrawingEntity } from 'domain/serializers/ket/fromKet/polymerBondToDrawingEntity';
import { getMonomerUniqueKey } from 'domain/helpers/monomers';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';

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
    default:
      break;
  }
}
export class KetSerializer implements Serializer<Struct> {
  deserialize(content: string): Struct {
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

  serialize(struct: Struct): string {
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
          result[`mol${moleculeId++}`] = moleculeToKet(item.fragment!);
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
    const template = parsedFileContent.root.templates.find(
      (template) => template.id === node.templateId,
    );
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
      connection.connectionType !== 'single' ||
      !connection.endPoint1.monomerId ||
      !connection.endPoint2.monomerId ||
      !connection.endPoint1.attachmentPointId ||
      !connection.endPoint2.attachmentPointId
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
    } catch (error) {
      editor.events.error.dispatch('Error during file parsing');
      return { error: true };
    }
    let error = false;
    parsedFileContent.root.nodes.forEach((node) => {
      if (node.type === 'monomer') {
        error = this.validateMonomerNodeTemplate(
          node,
          parsedFileContent,
          editor,
        );
      } else {
        editor.events.error.dispatch('Error during file parsing');
        error = true;
      }
    });
    if (error) {
      return { error: true };
    }
    parsedFileContent.root.connections.forEach((connection: IKetConnection) => {
      this.validateConnectionTypeAndEndpoints(connection, editor);
    });
    return { error, parsedFileContent };
  }

  deserializeMacromolecule(fileContent: string) {
    const { error: hasValidationErrors, parsedFileContent } =
      this.parseAndValidateMacromolecules(fileContent);
    if (hasValidationErrors || !parsedFileContent) return;
    let command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    parsedFileContent.root.nodes.forEach((node) => {
      switch (node.type) {
        case 'monomer': {
          const template = parsedFileContent.root.templates.find(
            (template) => template.id === node.templateId,
          );
          assert(template);
          const struct = this.fillStruct(template);
          command.merge(monomerToDrawingEntity(node, template, struct));
          break;
        }
        default:
          break;
      }
    });
    editor.renderersContainer.update(command);
    command = new Command();
    parsedFileContent.root.connections.forEach((connection) => {
      switch (connection.connectionType) {
        case 'single': {
          const bondAdditionCommand = polymerBondToDrawingEntity(connection);
          command.merge(bondAdditionCommand);
          break;
        }
        default:
          break;
      }
    });
    editor.renderersContainer.update(command);
  }

  serializeMacromolecules() {
    const editor = CoreEditor.provideEditorInstance();
    const fileContent: IKetMacromoleculesContent = {
      root: {
        nodes: [],
        connections: [],
        templates: [],
      },
    };
    editor.drawingEntitiesManager.monomers.forEach((monomer) => {
      const templateId = getMonomerUniqueKey(monomer.monomerItem);
      fileContent.root.nodes.push({
        type: 'monomer',
        id: monomer.id.toString(),
        position: {
          x: monomer.position.x,
          y: monomer.position.y,
        },
        alias: monomer.label,
        templateId,
      });
      if (
        !fileContent.root.templates.find(
          (template) => template.id === templateId,
        )
      ) {
        const [, , monomerClass] = monomerFactory(monomer.monomerItem);
        fileContent.root.templates.push({
          type: 'monomerTemplate',
          monomerClass,
          naturalAnalogShort:
            monomer.monomerItem.props.MonomerNaturalAnalogCode,
          id: templateId,
          fullName: monomer.monomerItem.props.MonomerName,
          alias: monomer.monomerItem.label,
          ...JSON.parse(this.serialize(monomer.monomerItem.struct)),
        });
      }
    });

    editor.drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      fileContent.root.connections.push({
        connectionType: 'single',
        endPoint1: {
          monomerId: polymerBond.firstMonomer.id.toString(),
          attachmentPointId:
            polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond),
        },
        endPoint2: {
          monomerId: polymerBond.secondMonomer?.id.toString(),
          attachmentPointId:
            polymerBond.secondMonomer?.getAttachmentPointByBond(polymerBond),
        },
      });
    });
    return fileContent;
  }
}
