import { Subscription } from 'subscription';
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

import { saveAs } from 'file-saver';
import {
  FormatterFactory,
  identifyStructFormat,
  SupportedFormat,
} from './formatters';
import {
  GenerateImageOptions,
  StructService,
  CalculateData,
  type CalculateResult,
} from 'domain/services';

import { CoreEditor, Editor } from './editor';
import { Indigo } from 'application/indigo';
import { KetSerializer, MolfileFormat } from 'domain/serializers';
import { SGroup, Struct } from 'domain/entities';
import assert from 'assert';
import { EventEmitter } from 'events';
import {
  LogSettings,
  LogLevel,
  runAsyncAction,
  SettingsManager,
  getSvgFromDrawnStructures,
  KetcherLogger,
} from 'utilities';
import {
  deleteAllEntitiesOnCanvas,
  getStructure,
  ketcherProvider,
  parseAndAddMacromoleculesOnCanvas,
  prepareStructToRender,
} from './utils';
import { EditorSelection, EditorType } from './editor/editor.types';
import {
  BlobTypes,
  ExportImageParams,
  ModeTypes,
  SupportedImageFormats,
  SupportedModes,
  UpdateMonomersLibraryParams,
} from 'application/ketcher.types';
import { isNumber, uniqueId } from 'lodash';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';

type SetMoleculeOptions = {
  position?: { x: number; y: number };
};

const allowedApiSettings = {
  'general.dearomatize-on-load': 'dearomatize-on-load',
  ignoreChiralFlag: 'ignoreChiralFlag',
  disableQueryElements: 'disableQueryElements',
  bondThickness: 'bondThickness',
};

export class Ketcher {
  _id: string;
  logging: LogSettings;
  structService: StructService;
  readonly #formatterFactory: FormatterFactory;
  #editor: Editor | null = null;
  _indigo: Indigo;
  readonly #eventBus: EventEmitter;
  changeEvent: Subscription;
  libraryUpdateEvent: Subscription;

  get editor(): Editor {
    // we should assign editor exactly after ketcher creation
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    return this.#editor!;
  }

  get eventBus(): EventEmitter {
    return this.#eventBus;
  }

  constructor(
    structService: StructService,
    formatterFactory: FormatterFactory,
  ) {
    assert(structService != null);
    assert(formatterFactory != null);
    this._id = uniqueId();
    this.changeEvent = new Subscription();
    this.libraryUpdateEvent = new Subscription();
    this.structService = structService;
    this.#formatterFactory = formatterFactory;
    this._indigo = new Indigo(this.structService);
    this.#eventBus = new EventEmitter();
    this.logging = {
      enabled: false,
      level: LogLevel.ERROR,
      showTrace: false,
    };
  }

  get id() {
    return this._id;
  }

  get formatterFactory() {
    return this.#formatterFactory;
  }

  get indigo() {
    return this._indigo;
  }

  // TEMP.: getting only dearomatize-on-load setting
  get settings() {
    const options = this.editor.options();
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

  addEditor(editor: Editor) {
    this.#editor = editor;
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

    return this.editor.setOptions(JSON.stringify(options));
  }

  getSmiles(isExtended = false): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('SMILES format is not available in macro mode');
    }
    const format = isExtended
      ? SupportedFormat.smilesExt
      : SupportedFormat.smiles;
    return getStructure(
      this.id,
      format,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getExtendedSmiles(): Promise<string> {
    return this.getSmiles(true);
  }

  async getMolfile(molfileFormat?: MolfileFormat): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrows.',
      );
    }

    const formatPassed =
      molfileFormat === 'v3000'
        ? SupportedFormat.molV3000
        : SupportedFormat.mol;
    const format = molfileFormat ? formatPassed : SupportedFormat.molAuto;

    const molfile = await getStructure(
      this.id,
      format,
      this.#formatterFactory,
      this.editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );

    return molfile;
  }

  getIdt(): Promise<string> {
    return getStructure(
      this.id,
      SupportedFormat.idt,
      this.#formatterFactory,
      this.editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );
  }

  getAxoLabs(): Promise<string> {
    return getStructure(
      this.id,
      SupportedFormat.axoLabs,
      this.#formatterFactory,
      this.editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );
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
      this.id,
      format,
      this.#formatterFactory,
      this.editor.struct(),
    );

    return rxnfile;
  }

  getKet(): Promise<string> {
    return getStructure(
      this.id,
      SupportedFormat.ket,
      this.#formatterFactory,
      (CoreEditor.provideEditorInstance()?._type ??
        EditorType.Micromolecules) === EditorType.Micromolecules
        ? this.editor.struct()
        : CoreEditor.provideEditorInstance()?.drawingEntitiesManager.micromoleculesHiddenEntities?.clone(),
      (CoreEditor.provideEditorInstance()?._type ??
        EditorType.Micromolecules) === EditorType.Micromolecules
        ? undefined
        : CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
      this.editor.selection() as EditorSelection,
    );
  }

  getFasta(): Promise<string> {
    return getStructure(
      this.id,
      SupportedFormat.fasta,
      this.#formatterFactory,
      this.editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );
  }

  async getSequence(
    format: '1-letter' | '3-letter' = '1-letter',
  ): Promise<string> {
    if (format === '1-letter' || format === '3-letter') {
      const editor = CoreEditor.provideEditorInstance();
      const indigo = this.indigo;

      const ketSerializer = new KetSerializer();
      const serializedKet = ketSerializer.serialize(
        editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
        editor.drawingEntitiesManager,
      );

      const formatToUse =
        format === '1-letter'
          ? ChemicalMimeType.SEQUENCE
          : ChemicalMimeType.PeptideSequenceThreeLetter;

      try {
        const result = await indigo.convert(serializedKet, {
          outputFormat: formatToUse,
        });
        return result.struct;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(
          `Failed to convert structure to ${format} format: ${errorMessage}`,
        );
      }
    }

    return getStructure(
      this.id,
      format === '3-letter'
        ? SupportedFormat.sequence3Letter
        : SupportedFormat.sequence,
      this.#formatterFactory,
      this.editor.struct(),
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager,
    );
  }

  getSmarts(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('SMARTS format is not available in macro mode');
    }
    return getStructure(
      this.id,
      SupportedFormat.smarts,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getCml(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CML format is not available in macro mode');
    }
    return getStructure(
      this.id,
      SupportedFormat.cml,
      this.#formatterFactory,
      this.editor.struct(),
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
    return getStructure(
      this.id,
      format,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getRdf(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('RDF format is not available in macro mode');
    }
    const format =
      molfileFormat === 'v2000'
        ? SupportedFormat.rdf
        : SupportedFormat.rdfV3000;
    return getStructure(
      this.id,
      format,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getCDXml(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CDXML format is not available in macro mode');
    }
    return getStructure(
      this.id,
      SupportedFormat.cdxml,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getCDX(): Promise<string> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('CDX format is not available in macro mode');
    }
    return getStructure(
      this.id,
      SupportedFormat.cdx,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  getInchi(withAuxInfo = false): Promise<string> {
    return getStructure(
      this.id,
      withAuxInfo ? SupportedFormat.inChIAuxInfo : SupportedFormat.inChI,
      this.#formatterFactory,
      this.editor.struct(),
    );
  }

  async getInChIKey(): Promise<string> {
    const struct: string = await getStructure(
      this.id,
      SupportedFormat.ket,
      this.#formatterFactory,
      this.editor.struct(),
    );

    return this.structService.getInChIKey(struct);
  }

  containsReaction(): boolean {
    const editor = CoreEditor.provideEditorInstance();
    return (
      this.editor.struct().hasRxnArrow() ||
      editor?.drawingEntitiesManager?.micromoleculesHiddenEntities.hasRxnArrow()
    );
  }

  isQueryStructureSelected(): boolean {
    const structure = this.editor.struct();
    const selection = this.editor.selection();

    if (!selection) {
      return false;
    }

    let hasQueryAtoms = false;
    if (selection.atoms) {
      hasQueryAtoms = selection.atoms.some((atomId) => {
        const atom = structure.atoms.get(atomId);
        assert(atom);
        const sGroupIds = Array.from(atom.sgs.values());
        const isQueryComponentSGroup = sGroupIds.some((sGroupId) => {
          const sGroup = structure.sgroups.get(sGroupId);
          assert(sGroup);
          return SGroup.isQuerySGroup(sGroup);
        });
        return atom.isQuery() || isQueryComponentSGroup;
      });
    }

    let hasQueryBonds = false;
    if (selection.bonds) {
      hasQueryBonds = selection.bonds.some((bondId) => {
        const bond = structure.bonds.get(bondId);
        assert(bond);
        return bond.isQuery();
      });
    }
    return hasQueryAtoms || hasQueryBonds;
  }

  async setMolecule(
    structStr: string,
    options?: SetMoleculeOptions,
  ): Promise<void | undefined> {
    const macromoleculesEditor = CoreEditor.provideEditorInstance();
    if (macromoleculesEditor?.isSequenceEditInRNABuilderMode) return;

    await runAsyncAction<void>(async () => {
      assert(typeof structStr === 'string');

      if (window.isPolymerEditorTurnedOn) {
        deleteAllEntitiesOnCanvas();
        await parseAndAddMacromoleculesOnCanvas(structStr, this.structService);
        macromoleculesEditor?.zoomToStructuresIfNeeded();
        macromoleculesEditor.mode.initialize();
      } else {
        const struct: Struct = await prepareStructToRender(
          structStr,
          this.structService,
          this,
        );

        struct.rescale();

        const { x, y } = options?.position ?? {};

        // System coordinates for browser and for chemistry files format (mol, ket, etc.) area are different.
        // It needs to rotate them by 180 degrees in y-axis.
        this.editor.struct(struct, false, x, isNumber(y) ? -y : y);
        this.editor.zoomAccordingContent(struct);
        if (x == null && y == null) {
          this.editor.centerStruct();
        }
      }
    }, this.eventBus);
  }

  async setHelm(helmStr: string): Promise<void | undefined> {
    await runAsyncAction<void>(async () => {
      assert(typeof helmStr === 'string');
      const struct: Struct = await prepareStructToRender(
        helmStr,
        this.structService,
        this,
      );
      struct.rescale();
      this.editor.struct(struct);
      this.editor.zoomAccordingContent(struct);
      this.editor.centerStruct();
    }, this.eventBus);
  }

  async addFragment(
    structStr: string,
    options?: SetMoleculeOptions,
  ): Promise<void | undefined> {
    const macromoleculesEditor = CoreEditor.provideEditorInstance();

    if (macromoleculesEditor?.isSequenceEditInRNABuilderMode) return;

    await runAsyncAction<void>(async () => {
      assert(typeof structStr === 'string');

      if (window.isPolymerEditorTurnedOn) {
        const isCanvasEmptyBeforeOpenStructure =
          !macromoleculesEditor.drawingEntitiesManager.hasDrawingEntities;

        await parseAndAddMacromoleculesOnCanvas(structStr, this.structService);

        if (isCanvasEmptyBeforeOpenStructure) {
          macromoleculesEditor?.zoomToStructuresIfNeeded();
        }
      } else {
        const struct: Struct = await prepareStructToRender(
          structStr,
          this.structService,
          this,
        );

        struct.rescale();
        const { x, y } = options?.position ?? {};

        // System coordinates for browser and for chemistry files format (mol, ket, etc.) area are different.
        // It needs to rotate them by 180 degrees in y-axis.
        this.editor.structToAddFragment(struct, x, isNumber(y) ? -y : y);
      }
    }, this.eventBus);
  }

  async layout(): Promise<void> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('Layout is not available in macro mode');
    }

    await runAsyncAction<void>(async () => {
      const struct = await this._indigo.layout(
        this.editor.struct(),
        this.editor.serverSettings,
      );
      const ketSerializer = new KetSerializer();
      await this.setMolecule(ketSerializer.serialize(struct));
    }, this.eventBus);
  }

  async calculate(options?: CalculateData): Promise<CalculateResult> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('Calculate is not available in macro mode');
    }
    return await this._indigo.calculate(this.editor.struct(), options);
  }

  /**
   * @param {number} value - in a range [ZoomTool.instance.MINZOOMSCALE, ZoomTool.instance.MAXZOOMSCALE]
   */
  setZoom(value: number) {
    const editor = CoreEditor.provideEditorInstance();
    if (editor && value) editor.zoomTool.zoomTo(value);
  }

  setMode(mode: SupportedModes) {
    const editor = CoreEditor.provideEditorInstance();
    if (editor && mode) {
      editor.events.selectMode.dispatch(ModeTypes[mode]);
      editor.events.layoutModeChange.dispatch(ModeTypes[mode]);
    }
  }

  exportImage(format: SupportedImageFormats, params?: ExportImageParams) {
    const editor = CoreEditor.provideEditorInstance();
    const fileName = 'ketcher';
    let blobPart;

    if (format === 'svg' && editor?.canvas) {
      blobPart = getSvgFromDrawnStructures(
        editor.canvas,
        'file',
        params?.margin,
      );
    }
    if (!blobPart) {
      throw new Error('Cannot export image');
    }

    const blob = new Blob([blobPart], {
      type: BlobTypes[format],
    });
    saveAs(blob, `${fileName}.${format}`);
  }

  recognize(image: Blob, version?: string): Promise<Struct> {
    if (window.isPolymerEditorTurnedOn) {
      throw new Error('Recognize is not available in macro mode');
    }
    return this._indigo.recognize(image, { version });
  }

  async generateImage(
    data: string,
    options: GenerateImageOptions = {
      outputFormat: 'png',
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
    const serverSettings = this.editor.serverSettings;

    const base64 = await this.structService.generateImageAsBase64(data, {
      ...serverSettings,
      ...options,
    });
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: meta });
    return blob;
  }

  public reinitializeIndigo(structService: StructService) {
    this.structService = structService;
    this._indigo = new Indigo(structService);
  }

  public sendCustomAction(name: string) {
    this.eventBus.emit('CUSTOM_BUTTON_PRESSED', name);
  }

  public async ensureMonomersLibraryDataInKetFormat(
    rawMonomersData: string | JSON,
    params?: UpdateMonomersLibraryParams,
  ) {
    const rawMonomersDataString =
      typeof rawMonomersData !== 'string'
        ? JSON.stringify(rawMonomersData)
        : rawMonomersData;
    const format =
      params?.format ?? identifyStructFormat(rawMonomersDataString);

    let dataInKetFormat: string | JSON;

    if (format === SupportedFormat.ket) {
      dataInKetFormat = rawMonomersDataString;
    } else {
      const convertResult = await this.indigo.convert(rawMonomersDataString, {
        inputFormat: ChemicalMimeType.MonomerLibrary,
        outputFormat: ChemicalMimeType.MonomerLibrary,
        outputContentType: ChemicalMimeType.MonomerLibrary,
      });

      dataInKetFormat = convertResult.struct;
    }

    return dataInKetFormat;
  }

  public async ensureMonomersLibraryDataInSdfFormat(
    rawMonomersData: string | JSON,
    params?: UpdateMonomersLibraryParams,
  ) {
    const rawMonomersDataString =
      typeof rawMonomersData !== 'string'
        ? JSON.stringify(rawMonomersData)
        : rawMonomersData;

    const format =
      params?.format ?? identifyStructFormat(rawMonomersDataString);

    if (format === SupportedFormat.sdf || format === SupportedFormat.sdfV3000) {
      return rawMonomersDataString;
    }

    const convertResult = await this.indigo.convert(rawMonomersDataString, {
      inputFormat: ChemicalMimeType.MonomerLibrary,
      outputFormat: ChemicalMimeType.MonomerLibrarySdf,
      outputContentType: ChemicalMimeType.MonomerLibrarySdf,
    });

    return convertResult.struct;
  }

  public async updateMonomersLibrary(
    rawMonomersData: string | JSON,
    params?: UpdateMonomersLibraryParams,
  ) {
    const editor = CoreEditor.provideEditorInstance();

    ketcherProvider.getKetcher(this.id);

    if (!editor) {
      throw new Error(
        'Updating monomer library in small molecules mode is not allowed, please switch to macromolecules mode',
      );
    }

    const dataInKetFormat = await this.ensureMonomersLibraryDataInKetFormat(
      rawMonomersData,
      params,
    );
    editor.updateMonomersLibrary(dataInKetFormat);
    this.libraryUpdateEvent.dispatch(editor.monomersLibrary);
  }

  public async replaceMonomersLibrary(
    rawMonomersData: string | JSON,
    params?: UpdateMonomersLibraryParams,
  ) {
    const editor = CoreEditor.provideEditorInstance();

    ketcherProvider.getKetcher(this.id);

    if (!editor) {
      throw new Error(
        'Updating monomer library in small molecules mode is not allowed, please switch to macromolecules mode',
      );
    }

    const dataInKetFormat = await this.ensureMonomersLibraryDataInKetFormat(
      rawMonomersData,
      params,
    );

    editor.clearMonomersLibrary();
    editor.updateMonomersLibrary(dataInKetFormat);
    this.libraryUpdateEvent.dispatch(editor.monomersLibrary);
    editor.events.updateMonomersLibrary.dispatch();
  }

  public switchToMacromoleculesMode() {
    const editor = CoreEditor.provideEditorInstance();

    if (!editor) {
      KetcherLogger.error('Editor instance is not available');

      return;
    }

    editor.events.switchToMacromoleculesMode.dispatch();
  }

  public switchToMoleculesMode() {
    const editor = CoreEditor.provideEditorInstance();

    if (!editor) {
      KetcherLogger.error('Editor instance is not available');

      return;
    }

    editor.events.switchToMoleculesMode.dispatch();
  }
}
