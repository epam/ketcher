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

import { FormatterFactory, SupportedFormat } from './formatters';
import { GenerateImageOptions, StructService } from 'domain/services';

import { CoreEditor, Editor, defaultBondThickness } from './editor';
import { Indigo } from 'application/indigo';
import { KetSerializer, MolfileFormat } from 'domain/serializers';
import { Struct } from 'domain/entities';
import assert from 'assert';
import { EventEmitter } from 'events';
import {
  LogSettings,
  LogLevel,
  runAsyncAction,
  SettingsManager,
} from 'utilities';
import {
  deleteAllEntitiesOnCanvas,
  getStructure,
  parseAndAddMacromoleculesOnCanvas,
  prepareStructToRender,
} from './utils';

const allowedApiSettings = {
  'general.dearomatize-on-load': 'dearomatize-on-load',
  ignoreChiralFlag: 'ignoreChiralFlag',
  disableQueryElements: 'disableQueryElements',
  bondThickness: 'bondThickness',
};

export class Ketcher {
  logging: LogSettings;
  #structService: StructService;
  #formatterFactory: FormatterFactory;
  #editor: Editor;
  #indigo: Indigo;
  #eventBus: EventEmitter;

  get editor(): Editor {
    return this.#editor;
  }

  get eventBus(): EventEmitter {
    return this.#eventBus;
  }

  constructor(
    editor: Editor,
    structService: StructService,
    formatterFactory: FormatterFactory,
  ) {
    assert(editor != null);
    assert(structService != null);
    assert(formatterFactory != null);

    this.#editor = editor;
    this.#structService = structService;
    this.#formatterFactory = formatterFactory;
    this.#indigo = new Indigo(this.#structService);
    this.#eventBus = new EventEmitter();
    this.logging = {
      enabled: false,
      level: LogLevel.ERROR,
      showTrace: false,
    };
  }

  get formatterFactory() {
    return this.#formatterFactory;
  }

  get indigo() {
    return this.#indigo;
  }

  // TEMP.: getting only dearomatize-on-load setting
  get settings() {
    const options = this.#editor.options();
    const result = Object.entries(allowedApiSettings).reduce(
      (acc, [apiSetting, clientSetting]) => {
        if (clientSetting in options) {
          return { ...acc, [apiSetting]: clientSetting };
        }
        return acc;
      },
      {},
    );

    if (!Object.keys(result).length) {
      throw new Error('Allowed options are not provided');
    }

    return result;
  }

  // TODO: create options type
  setSettings(settings: Record<string, string>) {
    // TODO: need to expand this and refactor this method
    if (!settings) {
      throw new Error('Please provide settings');
    }
    const options = {};
    for (const [apiSetting, clientSetting] of Object.entries(
      allowedApiSettings,
    )) {
      options[clientSetting] = settings[apiSetting];
    }

    if (Object.hasOwn(settings, 'disableCustomQuery')) {
      SettingsManager.disableCustomQuery = !!settings.disableCustomQuery;
    }

    return this.#editor.setOptions(JSON.stringify(options));
  }

  getSmiles(isExtended = false): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('SMILES format is not available in macro mode');
    }
    const format = isExtended
      ? SupportedFormat.smilesExt
      : SupportedFormat.smiles;
    return getStructure(format, this.#formatterFactory, this.editor.struct());
  }

  async getMolfile(molfileFormat?: MolfileFormat): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrrows.',
      );
    }

    const formatPassed =
      molfileFormat === 'v3000'
        ? SupportedFormat.molV3000
        : SupportedFormat.mol;
    const format = molfileFormat ? formatPassed : SupportedFormat.molAuto;

    const molfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );

    return molfile;
  }

  async getRxn(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('RXN format is not available in macro mode');
    }
    if (!this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.RXN: there is no reaction arrows.',
      );
    }
    const format =
      molfileFormat === 'v3000'
        ? SupportedFormat.rxnV3000
        : SupportedFormat.rxn;
    const rxnfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct(),
    );

    return rxnfile;
  }

  getKet(): Promise<string> {
    return getStructure(
      SupportedFormat.ket,
      this.#formatterFactory,
      this.#editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );
  }

  getSmarts(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('SMARTS format is not available in macro mode');
    }
    return getStructure(
      SupportedFormat.smarts,
      this.#formatterFactory,
      this.#editor.struct(),
    );
  }

  getCml(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CML format is not available in macro mode');
    }
    return getStructure(
      SupportedFormat.cml,
      this.#formatterFactory,
      this.#editor.struct(),
    );
  }

  getSdf(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('SDF format is not available in macro mode');
    }
    const format =
      molfileFormat === 'v2000'
        ? SupportedFormat.sdf
        : SupportedFormat.sdfV3000;
    return getStructure(format, this.#formatterFactory, this.#editor.struct());
  }

  getCDXml(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CDXML format is not available in macro mode');
    }
    return getStructure(
      SupportedFormat.cdxml,
      this.#formatterFactory,
      this.#editor.struct(),
    );
  }

  getCDX(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CDX format is not available in macro mode');
    }
    return getStructure(
      SupportedFormat.cdx,
      this.#formatterFactory,
      this.#editor.struct(),
    );
  }

  getInchi(withAuxInfo = false): Promise<string> {
    return getStructure(
      withAuxInfo ? SupportedFormat.inChIAuxInfo : SupportedFormat.inChI,
      this.#formatterFactory,
      this.#editor.struct(),
    );
  }

  async getInChIKey(): Promise<string> {
    const struct: string = await getStructure(
      SupportedFormat.ket,
      this.#formatterFactory,
      this.#editor.struct(),
    );

    return this.#structService.getInChIKey(struct);
  }

  containsReaction(): boolean {
    const editor = CoreEditor.provideEditorInstance();
    return (
      this.editor.struct().hasRxnArrow() ||
      editor.drawingEntitiesManager.micromoleculesHiddenEntities.hasRxnArrow()
    );
  }

  async setMolecule(structStr: string): Promise<void> {
    runAsyncAction<void>(async () => {
      assert(typeof structStr === 'string');

      if (window.isPolymerEditorTurnedOn) {
        deleteAllEntitiesOnCanvas();
        await parseAndAddMacromoleculesOnCanvas(structStr, this.#structService);
      } else {
        const struct: Struct = await prepareStructToRender(
          structStr,
          this.#structService,
          this,
        );

        this.#editor.struct(struct);
        this.#editor.zoomAccordingContent(struct);
        this.#editor.centerStruct();
      }
    }, this.eventBus);
  }

  async addFragment(structStr: string): Promise<void> {
    runAsyncAction<void>(async () => {
      assert(typeof structStr === 'string');

      if (window.isPolymerEditorTurnedOn) {
        await parseAndAddMacromoleculesOnCanvas(structStr, this.#structService);
      } else {
        const struct: Struct = await prepareStructToRender(
          structStr,
          this.#structService,
          this,
        );

        this.#editor.structToAddFragment(struct);
      }
    }, this.eventBus);
  }

  async layout(): Promise<void> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('Layout is not available in macro mode');
    }

    runAsyncAction<void>(async () => {
      const struct = await this.#indigo.layout(this.#editor.struct());
      const ketSerializer = new KetSerializer();
      this.setMolecule(ketSerializer.serialize(struct));
    }, this.eventBus);
  }

  recognize(image: Blob, version?: string): Promise<Struct> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('Recognize is not available in macro mode');
    }
    return this.#indigo.recognize(image, { version });
  }

  async generateImage(
    data: string,
    options: GenerateImageOptions = {
      outputFormat: 'png',
      bondThickness: defaultBondThickness,
    },
  ): Promise<Blob> {
    let meta = '';

    switch (options.outputFormat) {
      case 'svg':
        meta = 'image/svg+xml';
        break;

      case 'png':
      default:
        meta = 'image/png';
        options.outputFormat = 'png';
    }

    const base64 = await this.#structService.generateImageAsBase64(
      data,
      options,
    );
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: meta });
    return blob;
  }
}
