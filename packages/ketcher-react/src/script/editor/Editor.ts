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
  Action,
  Atom,
  AtomLabel,
  AttachmentPointName,
  Bond,
  Coordinates,
  Editor as KetcherEditor,
  Elements,
  fillNaturalAnalogueForPhosphateAndSugar,
  FloatingToolsParams,
  fromAtomsAttrs,
  fromBondAddition,
  fromDescriptorsAlign,
  fromMultipleMove,
  fromNewCanvas,
  fromPaste,
  fromSgroupAddition,
  genericsList,
  getAttachmentPointLabel,
  getAttachmentPointLabelWithBinaryShift,
  getAttachmentPointNumberFromLabel,
  getHELMClassByKetMonomerClass,
  getNextFreeAttachmentPoint,
  IKetAttachmentPoint,
  IKetMonomerTemplate,
  IMAGE_KEY,
  isSingleRGroupAttachmentPoint,
  KetcherLogger,
  ketcherProvider,
  KetSerializer,
  KetTemplateType,
  MacromoleculesConverter,
  MonomerCreationState,
  monomerFactory,
  MULTITAIL_ARROW_KEY,
  normalizeMonomerAtomsPositions,
  Pile,
  Pool,
  provideEditorSettings,
  Render,
  ReStruct,
  Scale,
  setMonomerTemplatePrefix,
  SGroup,
  Struct,
  Vec2,
  OperationType,
  CoordinateTransformation,
  AssignLeavingGroupAtomOperation,
  RemoveAttachmentPointOperation,
  ReassignAttachmentPointOperation,
  ReassignLeavingAtomOperation,
  AssignAttachmentAtomOperation,
  getKetRef,
  setMonomerGroupTemplatePrefix,
  KetMonomerClass,
  fromFragmentDeletion,
} from 'ketcher-core';
import {
  DOMSubscription,
  PipelineSubscription,
  Subscription,
} from 'subscription';

import closest from './shared/closest';
import { ChangeEventData, customOnChangeHandler } from './utils';
import { isEqual } from 'lodash/fp';
import { toolsMap } from './tool';
import { Highlighter } from './highlighter';
import { setFunctionalGroupsTooltip } from './utils/functionalGroupsTooltip';
import { ContextMenuInfo } from '../ui/views/components/ContextMenu/contextMenu.types';
import { HoverIcon } from './HoverIcon';
import RotateController from './tool/rotate-controller';
import {
  Tool,
  ToolConstructorInterface,
  ToolEventHandlerName,
} from './tool/Tool';
import { getSelectionMap, getStructCenter } from './utils/structLayout';
import assert from 'assert';
import { isNumber } from 'lodash';

const SCALE = provideEditorSettings().microModeScale;
const HISTORY_SIZE = 32; // put me to options

const structObjects: Array<keyof typeof ReStruct.maps> = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  'rgroupAttachmentPoints',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'functionalGroups',
  'frags',
  'merge',
  'rgroups',
  'rgroupAttachmentPoints',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

function selectStereoFlagsIfNecessary(
  atoms: Pool<Atom>,
  explicitlySelectedAtoms: number[],
): number[] {
  const fragmentToAtoms: Map<number, number[]> = new Map();
  atoms.forEach((atom, atomId) => {
    const atomFragment = atom.fragment;
    if (atomFragment === -1) {
      return;
    }

    const currentAtoms = fragmentToAtoms.get(atomFragment) ?? [];
    const updatedAtoms = currentAtoms.concat(atomId);
    fragmentToAtoms.set(atomFragment, updatedAtoms);
  });

  let stereoFlags: number[] = [];
  fragmentToAtoms.forEach((fragmentAtoms, fragmentId) => {
    const shouldSelectStereoFlag = fragmentAtoms.every((atomId) =>
      explicitlySelectedAtoms.includes(atomId),
    );

    if (shouldSelectStereoFlag) {
      stereoFlags = stereoFlags.concat(fragmentId);
    }
  });

  return stereoFlags;
}

export interface Selection {
  atoms?: Array<number>;
  bonds?: Array<number>;
  enhancedFlags?: Array<number>;
  rxnPluses?: Array<number>;
  rxnArrows?: Array<number>;
  texts?: Array<number>;
  rgroupAttachmentPoints?: Array<number>;
  [MULTITAIL_ARROW_KEY]?: Array<number>;
}

class Editor implements KetcherEditor {
  ketcherId: string;
  #origin?: any;
  render: Render;
  _selection: Selection | null;
  _tool: Tool | null;
  historyStack: Action[];
  historyPtr: number;
  errorHandler: ((message: string) => void) | null;
  highlights: Highlighter;
  hoverIcon: HoverIcon;
  lastCursorPosition: { x: number; y: number };
  contextMenu: ContextMenuInfo;
  rotateController: RotateController;
  event: {
    message: Subscription;
    elementEdit: PipelineSubscription;
    zoomIn: PipelineSubscription;
    zoomOut: PipelineSubscription;
    zoomChanged: PipelineSubscription;
    bondEdit: PipelineSubscription;
    rgroupEdit: PipelineSubscription;
    sgroupEdit: PipelineSubscription;
    sdataEdit: PipelineSubscription;
    quickEdit: PipelineSubscription;
    attachEdit: PipelineSubscription;
    removeFG: PipelineSubscription;
    change: Subscription;
    selectionChange: PipelineSubscription;
    aromatizeStruct: PipelineSubscription;
    dearomatizeStruct: PipelineSubscription;
    enhancedStereoEdit: PipelineSubscription;
    confirm: PipelineSubscription;
    showInfo: PipelineSubscription;
    apiSettings: PipelineSubscription;
    cursor: Subscription;
    updateFloatingTools: Subscription<FloatingToolsParams>;
  };

  public serverSettings = {};

  lastEvent: any;
  macromoleculeConvertionError: string | null | undefined;

  constructor(ketcherId, clientArea, options, serverSettings, prevEditor?) {
    this.render = new Render(
      clientArea,
      {
        microModeScale: SCALE,
        ...(options || {}),
      },
      prevEditor?.render,
      options.reuseRestructIfExist !== false,
    );

    this.ketcherId = ketcherId;
    this._selection = null; // eslint-disable-line
    this._tool = null; // eslint-disable-line
    this.historyStack = [];
    this.historyPtr = 0;
    this.errorHandler = null;
    this.highlights = new Highlighter(this);
    this.renderAndRecoordinateStruct =
      this.renderAndRecoordinateStruct.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setServerSettings(serverSettings);
    this.lastCursorPosition = {
      x: 0,
      y: 0,
    };
    this.hoverIcon = new HoverIcon(this);
    this.hoverIcon.updatePosition();
    this.contextMenu = {};
    this.rotateController = new RotateController(this);

    this.event = {
      message: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      zoomIn: new PipelineSubscription(),
      zoomOut: new PipelineSubscription(),
      zoomChanged: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      removeFG: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription(),
      confirm: new PipelineSubscription(),
      cursor: new PipelineSubscription(),
      showInfo: new PipelineSubscription(),
      apiSettings: new PipelineSubscription(),
      updateFloatingTools: new Subscription(),
    };

    domEventSetup(this, clientArea);
    this.render.paper.canvas.setAttribute('data-testid', 'canvas');
  }

  isDitrty(): boolean {
    const position = this.historyPtr;
    const length = this.historyStack.length;
    if (!length || !this.#origin) {
      return false;
    }
    return !isEqual(this.historyStack[position - 1], this.#origin);
  }

  setOrigin(): void {
    const position = this.historyPtr;
    this.#origin = position ? this.historyStack[position - 1] : null;
  }

  tool(name?: any, opts?: any): Tool | null {
    /* eslint-disable no-underscore-dangle */
    if (arguments.length === 0) {
      return this._tool;
    }

    if (this._tool?.cancel) {
      this._tool.cancel();
    }

    const ToolConstructor: ToolConstructorInterface = toolsMap[name];

    const tool = new ToolConstructor(this, opts);

    const isAtomToolChosen = name === 'atom';
    if (!isAtomToolChosen) {
      this.hoverIcon.hide(true);
    }

    if (!tool || tool.isNotActiveTool) {
      return null;
    }

    const isSelectToolChosen = name === 'select';
    if (!isSelectToolChosen) {
      this.rotateController.clean();
    }

    this._tool = tool;
    return this._tool;
    /* eslint-enable no-underscore-dangle */
  }

  clear() {
    this.struct(new Struct());
  }

  renderAndRecoordinateStruct(
    struct: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    const action = fromNewCanvas(this.render.ctab, struct);

    this.update(action, this.isMonomerCreationWizardActive);

    if (needToCenterStruct) {
      this.centerStruct();
    } else if (x != null && y != null) {
      this.positionStruct(x, y);
    }

    return this.render.ctab.molecule;
  }

  /** Apply {@link value}: {@link Struct} if provided to {@link render} and  */
  struct(
    value?: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    if (arguments.length === 0) {
      return this.render.ctab.molecule;
    }

    KetcherLogger.log('Editor.struct(), start', value, needToCenterStruct);

    this.selection(null);
    const struct = value || new Struct();

    const molecule = this.renderAndRecoordinateStruct(
      struct,
      needToCenterStruct,
      x,
      y,
    );

    this.hoverIcon.create();
    KetcherLogger.log('Editor.struct(), end');
    return molecule;
  }

  // this is used by API addFragment method
  structToAddFragment(struct: Struct, x?: number, y?: number): Struct {
    if (x != null && y != null) {
      const position = new Vec2(x, y);
      const [action] = fromPaste(
        this.render.ctab,
        struct,
        position,
        0,
        false,
        true,
      );
      this.update(action, true);
    } else {
      const superStruct = struct.mergeInto(this.render.ctab.molecule.clone());

      this.renderAndRecoordinateStruct(superStruct);
    }

    this.centerViewportAccordingToStruct();

    return this.render.ctab.molecule;
  }

  setOptions(opts: string) {
    const options = JSON.parse(opts);
    this.event.apiSettings.dispatch({ ...options });
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;
    const result = this.render.updateOptions(opts);
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    return result;
  }

  /** Apply options from {@link value} */
  options(value?: any) {
    if (arguments.length === 0) {
      return this.render.options;
    }

    const struct = this.render.ctab.molecule;
    const zoom = this.render.options.zoom;
    this.render.clientArea.innerHTML = '';
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;

    this.render = new Render(this.render.clientArea, {
      microModeScale: SCALE,
      ...(value || {}),
    });
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    this.render.setMolecule(struct);
    this.struct(struct.clone());
    this.render.setZoom(zoom);
    this.render.update();
    return this.render.options;
  }

  public setServerSettings(serverSettings) {
    this.serverSettings = serverSettings;
  }

  private updateToolAfterOptionsChange(wasViewOnlyEnabled: boolean) {
    const isViewOnlyEnabled = this.render.options.viewOnlyMode;
    if (
      (!wasViewOnlyEnabled && isViewOnlyEnabled === true) ||
      (wasViewOnlyEnabled && isViewOnlyEnabled === false)
    ) {
      // We need to reset the tool to make sure it was recreated
      this.tool('select');
      this.event.change.dispatch('force');
      ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch('force');
    }
  }

  zoom(value?: any, event?: WheelEvent) {
    if (arguments.length === 0 || this.render.options.zoom === value) {
      return this.render.options.zoom;
    }

    this.render.setZoom(value, event);

    this.render.update();
    this.rotateController.rerender();
    return this.render.options.zoom;
  }

  centerStruct() {
    const structure = this.render.ctab;
    const structCenter = getStructCenter(structure);
    const viewBoxCenter = new Vec2(
      this.render.viewBox.minX + this.render.viewBox.width / 2,
      this.render.viewBox.minY + this.render.viewBox.height / 2,
    );
    const viewBoxCenterInProto = Scale.canvasToModel(
      viewBoxCenter,
      this.render.options,
    );
    const shiftVector = viewBoxCenterInProto.sub(structCenter);

    const structureToMove = getSelectionMap(structure);

    const action = fromMultipleMove(structure, structureToMove, shiftVector);
    this.update(action, true);
  }

  public centerViewportAccordingToStruct(struct: Struct = this.struct()) {
    const isFitMinZoom = this.zoomAccordingContent(struct);

    const structBbox = struct.getCoordBoundingBox();
    const newScrollCoordinates = Coordinates.modelToCanvas(
      isFitMinZoom
        ? new Vec2(
            structBbox.min.x + (structBbox.max.x - structBbox.min.x) / 2,
            structBbox.min.y + (structBbox.max.y - structBbox.min.y) / 2,
          )
        : new Vec2(structBbox.min.x, structBbox.min.y),
    ).sub(
      new Vec2(this.render.viewBox.width / 2, this.render.viewBox.height / 2),
    );

    this.render.setViewBox((viewBox) => {
      return {
        ...viewBox,
        minX: newScrollCoordinates.x,
        minY: newScrollCoordinates.y,
      };
    });
  }

  positionStruct(x: number, y: number) {
    const struct = this.struct();
    const reStruct = this.render.ctab;
    const structBbox = struct.getCoordBoundingBox();
    const shiftVector = new Vec2(x, y).sub(structBbox.min);
    const structureToMove = getSelectionMap(reStruct);
    const action = fromMultipleMove(reStruct, structureToMove, shiftVector);
    this.update(action, true);
    this.centerViewportAccordingToStruct();
  }

  zoomAccordingContent(struct: Struct) {
    const MIN_ZOOM_VALUE = 0.1;
    const MAX_ZOOM_VALUE = 1;
    const MARGIN_IN_PIXELS = 60;
    const parsedStructCoordBoundingBox = struct.getCoordBoundingBox();
    const parsedStructSize = new Vec2(
      parsedStructCoordBoundingBox.max.x - parsedStructCoordBoundingBox.min.x,
      parsedStructCoordBoundingBox.max.y - parsedStructCoordBoundingBox.min.y,
    );
    const parsedStructSizeInPixels = {
      width:
        parsedStructSize.x *
        this.render.options.microModeScale *
        this.render.options.zoom,
      height:
        parsedStructSize.y *
        this.render.options.microModeScale *
        this.render.options.zoom,
    };
    const clientAreaBoundingBox =
      this.render.clientArea.getBoundingClientRect();

    if (
      parsedStructSizeInPixels.width + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.width &&
      parsedStructSizeInPixels.height + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.height
    ) {
      return true;
    }

    let newZoomValue =
      this.render.options.zoom /
      (parsedStructSizeInPixels.height - clientAreaBoundingBox.height >
      parsedStructSizeInPixels.width - clientAreaBoundingBox.width
        ? parsedStructSizeInPixels.height / clientAreaBoundingBox.height
        : parsedStructSizeInPixels.width / clientAreaBoundingBox.width);

    if (newZoomValue >= MAX_ZOOM_VALUE) {
      this.zoom(MAX_ZOOM_VALUE);
      return true;
    }

    newZoomValue -= MARGIN_IN_PIXELS / clientAreaBoundingBox.width;

    this.zoom(
      newZoomValue < MIN_ZOOM_VALUE
        ? MIN_ZOOM_VALUE
        : Number(newZoomValue.toFixed(2)),
    );
    this.event.zoomChanged.dispatch();

    return newZoomValue > MIN_ZOOM_VALUE;
  }

  public get monomerCreationState() {
    return this.render.monomerCreationState;
  }

  private set monomerCreationState(state: MonomerCreationState) {
    this.render.monomerCreationState = state;
  }

  public setMonomerCreationSelectedType(
    type: KetMonomerClass | 'rnaPreset' | undefined,
  ) {
    const currentState = this.render.monomerCreationState;
    if (!currentState) return;
    this.render.monomerCreationState = {
      ...currentState,
      selectedMonomerClass: type,
    };
    this.render.update(true);
  }

  public get isMonomerCreationWizardActive() {
    return Boolean(this.monomerCreationState);
  }

  // Pairs of [atomId, attachmentPointLabel (as R1, R10 or similar)]
  private terminalRGroupAtoms: Array<[number, string]> = [];
  private potentialLeavingAtomsForAutoAssignment: number[] = [];
  private potentialLeavingAtomsForManualAssignment: number[] = [];

  private static isBondSuitableForAttachmentPoint(bond: Bond) {
    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) {
      return false;
    }

    const acceptableStereoTypes = new Set([
      Bond.PATTERN.STEREO.NONE,
      Bond.PATTERN.STEREO.UP,
      Bond.PATTERN.STEREO.DOWN,
    ]);

    return acceptableStereoTypes.has(bond.stereo);
  }

  public get isMonomerCreationWizardEnabled() {
    if (this.isMonomerCreationWizardActive) {
      return false;
    }

    const currentStruct = this.struct();
    const selection = this.selection();

    // When there's no selection, use all atoms from the structure
    let atomsToProcess: number[] = [];
    if (selection !== null) {
      // Start with explicitly selected atoms
      atomsToProcess = selection.atoms ? [...selection.atoms] : [];

      // Include atoms from selected bonds
      if (selection.bonds) {
        const atomsFromBonds = new Set(atomsToProcess);
        selection.bonds.forEach((bondId) => {
          const bond = currentStruct.bonds.get(bondId);
          if (bond) {
            atomsFromBonds.add(bond.begin);
            atomsFromBonds.add(bond.end);
          }
        });
        atomsToProcess = Array.from(atomsFromBonds);
      }
    } else {
      atomsToProcess = Array.from(currentStruct.atoms.keys());
    }

    if (!atomsToProcess || atomsToProcess.length === 0) {
      return false;
    }

    const selectionInvalid = atomsToProcess.some((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      if (!atom) {
        return true;
      }

      const { sgs, attachmentPoints, rglabel, neighbors, label } = atom;

      const belongsToSGroup = sgs.size > 0;
      const isAttachmentPoint = attachmentPoints !== null;
      const isNonTerminalRGroupLabel = rglabel !== null && neighbors.length > 1;
      const hasMultipleRGroupLabel =
        rglabel !== null && !isSingleRGroupAttachmentPoint(Number(rglabel));
      const belongsToRGroup = currentStruct.rgroups.some((rgroup) =>
        rgroup.frags.has(atom.fragment),
      );
      const isExtendedTableAtom = genericsList.includes(label);

      return (
        belongsToSGroup ||
        isAttachmentPoint ||
        isNonTerminalRGroupLabel ||
        hasMultipleRGroupLabel ||
        belongsToRGroup ||
        isExtendedTableAtom
      );
    });

    if (selectionInvalid) {
      return false;
    }

    const terminalRGroupAtoms = atomsToProcess.filter((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      if (!atom) {
        return false;
      }

      return atom.rglabel !== null && atom.neighbors.length === 1;
    });

    const atomsToProcessSet = new Set(atomsToProcess);
    const bondsToOutside = currentStruct.bonds.filter((_, bond) => {
      return (
        (atomsToProcessSet.has(bond.begin) &&
          !atomsToProcessSet.has(bond.end)) ||
        (atomsToProcessSet.has(bond.end) && !atomsToProcessSet.has(bond.begin))
      );
    });

    const selectionHasInvalidOutgoingBonds = bondsToOutside.some(
      (bond) => !Editor.isBondSuitableForAttachmentPoint(bond),
    );
    if (selectionHasInvalidOutgoingBonds) {
      return false;
    }

    const potentialLeavingAtomsForAutoAssignment: number[] = [];
    bondsToOutside.forEach((bond) => {
      potentialLeavingAtomsForAutoAssignment.push(
        atomsToProcessSet.has(bond.begin) ? bond.end : bond.begin,
      );
    });

    const potentialLeavingAtomForManualAssignment: number[] = [];
    atomsToProcessSet.forEach((selectionAtomId) => {
      const selectionAtom = currentStruct.atoms.get(selectionAtomId);

      assert(selectionAtom);

      if (
        selectionAtom.neighbors.length > 1 ||
        isNumber(selectionAtom.rglabel)
      ) {
        return;
      }

      const bondIdToSelectionAtom = currentStruct.bonds.find((_, bond) => {
        return (
          bond.hb1 === selectionAtom.neighbors[0] ||
          bond.hb2 === selectionAtom.neighbors[0]
        );
      });

      if (bondIdToSelectionAtom === null) {
        return;
      }

      const bondToSelectionAtom = currentStruct.bonds.get(
        bondIdToSelectionAtom,
      );
      assert(bondToSelectionAtom);

      if (!Editor.isBondSuitableForAttachmentPoint(bondToSelectionAtom)) {
        return;
      }

      potentialLeavingAtomForManualAssignment.push(selectionAtomId);
    });

    const totalNumberOfAtomsForAutoAssignment =
      terminalRGroupAtoms.length +
      potentialLeavingAtomsForAutoAssignment.length;
    if (totalNumberOfAtomsForAutoAssignment > 8) {
      return false;
    }

    this.terminalRGroupAtoms = terminalRGroupAtoms.map((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      assert(atom);
      assert(atom.rglabel);

      const attachmentPointLabel = getAttachmentPointLabelWithBinaryShift(
        Number(atom.rglabel),
      );
      return [atomId, attachmentPointLabel];
    });
    this.potentialLeavingAtomsForAutoAssignment =
      potentialLeavingAtomsForAutoAssignment;
    this.potentialLeavingAtomsForManualAssignment =
      potentialLeavingAtomForManualAssignment;

    window.dispatchEvent(new CustomEvent('monomerCreationEnabled'));

    return true;
  }

  public static isMinimalViableStructure(
    structure: Struct,
    monomerCreationState: MonomerCreationState,
  ) {
    const nonLeavingAtoms = structure.atoms.filter((atomId) => {
      assert(monomerCreationState);

      return Array.from(
        monomerCreationState.assignedAttachmentPoints.values(),
      ).every((atomPair) => atomPair[1] !== atomId);
    });

    if (nonLeavingAtoms.size < 2) {
      return false;
    }

    const nonLeavingAtomBonds = structure.bonds.filter(
      (_, bond) =>
        nonLeavingAtoms.has(bond.begin) && nonLeavingAtoms.has(bond.end),
    );

    if (nonLeavingAtomBonds.size < 1) {
      return false;
    }

    const suitableBonds = nonLeavingAtomBonds.filter((_, bond) =>
      Editor.isBondSuitableForAttachmentPoint(bond),
    );

    return suitableBonds.size >= 1;
  }

  static isStructureContinuous(struct: Struct, selection?: Selection): boolean {
    let atomIds: number[];
    let bondIds: number[];

    if (selection) {
      atomIds = selection.atoms ?? [];
      bondIds = selection.bonds ?? [];
    } else {
      atomIds = Array.from(struct.atoms.keys());
      bondIds = Array.from(struct.bonds.keys());
    }

    if (!atomIds || atomIds.length === 0 || !atomIds || atomIds.length === 0) {
      return false;
    }

    const adjacencyList: Map<number, number[]> = new Map();
    for (const atomId of atomIds) {
      adjacencyList.set(atomId, []);
    }
    bondIds.forEach((bondId) => {
      const bond = struct.bonds.get(bondId);
      if (!bond) {
        return;
      }

      const { begin, end } = bond;
      if (adjacencyList.has(begin) && adjacencyList.has(end)) {
        adjacencyList.get(begin)?.push(end);
        adjacencyList.get(end)?.push(begin);
      }
    });

    const visited = new Set<number>();
    const queue = [atomIds[0]];

    while (queue.length > 0) {
      const nextAtomId = queue.shift();
      if (nextAtomId !== undefined && !visited.has(nextAtomId)) {
        visited.add(nextAtomId);
        for (const neighbor of adjacencyList.get(nextAtomId) ?? []) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }

    return visited.size === atomIds.length;
  }

  static isStructureImpure(struct: Struct) {
    const { atoms, sgroups, rgroups, functionalGroups } = struct;

    return (
      sgroups.size > 0 ||
      rgroups.size > 0 ||
      functionalGroups.size > 0 ||
      Array.from(atoms.values()).some((atom) =>
        genericsList.includes(atom.label),
      )
    );
  }

  private originalStruct: Struct = new Struct();
  private originalSelection: Selection = {};
  private originalHistoryStack: Action[] = [];
  private originalHistoryPointer = 0;

  private readonly selectedToOriginalAtomsIdMap = new Map<number, number>();

  private changeEventSubscriber: any = null;

  openMonomerCreationWizard() {
    const currentStruct = this.render.ctab.molecule;
    const selection = this.selection() ?? {
      atoms: Array.from(this.struct().atoms.keys()),
      bonds: Array.from(this.struct().bonds.keys()),
    };

    this.originalSelection = selection;
    const selectedStruct = this.structSelected(selection);

    /*
     * Upon cloning the structure each entity gets a new id thus losing the mapping between the new and original one
     * Original atom ids can be retrieved from the selection data (do not confuse with the selected struct) by index:
     * E.g. selection.atoms = [3, 5, 7] will correspond to selectedStruct.atoms = [0, 1, 2]
     * However, ids get sorted upon cloning so we have to sort the selection atoms first as well in order to retrieve the correct index
     */
    const originalToSelectedAtomsIdMap = new Map<number, number>();
    [...(selection.atoms ?? [])]
      .sort((a, b) => a - b)
      .forEach((atomId, i) => {
        originalToSelectedAtomsIdMap.set(atomId, i);
        this.selectedToOriginalAtomsIdMap.set(i, atomId);
      });

    const assignedAttachmentPoints = new Map<
      AttachmentPointName,
      [number, number]
    >();

    const sideTerminalSGroupAtoms = this.terminalRGroupAtoms.filter(
      ([, attachmentPointLabel]) =>
        attachmentPointLabel !== AttachmentPointName.R1 &&
        attachmentPointLabel !== AttachmentPointName.R2,
    );
    let sideAttachmentPointsNames: AttachmentPointName[] = [];
    for (let i = 0; i < sideTerminalSGroupAtoms.length; i++) {
      const attachmentPointNumber = i + 3;
      if (attachmentPointNumber > 8) {
        break;
      }

      sideAttachmentPointsNames = sideAttachmentPointsNames.concat(
        getAttachmentPointLabel(attachmentPointNumber),
      );
    }

    const terminalRGroupAtomsSortedByLabel = [...this.terminalRGroupAtoms].sort(
      ([, labelA], [, labelB]) => {
        const labelANumber = getAttachmentPointNumberFromLabel(
          labelA as AttachmentPointName,
        );
        const labelBNumber = getAttachmentPointNumberFromLabel(
          labelB as AttachmentPointName,
        );
        return labelANumber - labelBNumber;
      },
    );

    terminalRGroupAtomsSortedByLabel.forEach(
      ([atomId, attachmentPointLabel]) => {
        const selectedStructLeavingAtomId =
          originalToSelectedAtomsIdMap.get(atomId);

        assert(selectedStructLeavingAtomId !== undefined);

        const selectedStructLeavingAtom = selectedStruct.atoms.get(
          selectedStructLeavingAtomId,
        );

        assert(selectedStructLeavingAtom);
        assert(selectedStructLeavingAtom.rglabel);

        let attachmentPointName: AttachmentPointName;

        // Check if this is R1 or R2 and if it's already assigned
        const isR1OrR2 =
          attachmentPointLabel === AttachmentPointName.R1 ||
          attachmentPointLabel === AttachmentPointName.R2;
        const isAlreadyAssigned = assignedAttachmentPoints.has(
          attachmentPointLabel as AttachmentPointName,
        );

        if (
          (isR1OrR2 && !isAlreadyAssigned) ||
          (!isR1OrR2 &&
            sideAttachmentPointsNames.includes(
              attachmentPointLabel as AttachmentPointName,
            ))
        ) {
          attachmentPointName = attachmentPointLabel as AttachmentPointName;
        } else {
          // For duplicate R1/R2 or other cases, assign to smallest available Rn (n>2)
          // or fall back to R1/R2 if no side attachment points are available
          const assignedAttachmentPointNames = Array.from(
            assignedAttachmentPoints.keys(),
          );
          // Skip R1/R2 when:
          // 1. Processing a duplicate R1/R2 label (requirement 2.6: prefer R3+)
          // 2. Processing other labels when we haven't assigned all expected side attachments yet
          const shouldSkipR1AndR2 =
            isR1OrR2 ||
            assignedAttachmentPointNames.length <
              sideAttachmentPointsNames.length;
          attachmentPointName = getNextFreeAttachmentPoint(
            assignedAttachmentPointNames,
            shouldSkipR1AndR2,
          );
        }

        selectedStructLeavingAtom.rglabel = null;
        selectedStructLeavingAtom.label = AtomLabel.H;

        const neighborHalfBondId = selectedStructLeavingAtom.neighbors[0];

        const selectedStructAttachmentAtomId =
          selectedStruct.halfBonds.get(neighborHalfBondId)?.end;

        assert(selectedStructAttachmentAtomId !== undefined);

        assignedAttachmentPoints.set(attachmentPointName, [
          selectedStructAttachmentAtomId,
          selectedStructLeavingAtomId,
        ]);
      },
    );

    this.potentialLeavingAtomsForAutoAssignment.forEach((leavingAtomId) => {
      const leavingAtom = currentStruct.atoms.get(leavingAtomId);
      assert(leavingAtom);

      let attachmentAtomId = -1;
      leavingAtom.neighbors.forEach((halfBondId) => {
        const halfBond = currentStruct.halfBonds.get(halfBondId);
        assert(halfBond !== undefined);

        if (selection.atoms?.includes(halfBond.end)) {
          attachmentAtomId = halfBond.end;
        }
      });

      if (attachmentAtomId === -1) {
        return;
      }

      const selectedStructLeavingAtom = new Atom({
        label: AtomLabel.H,
        pp: leavingAtom.pp,
      });
      const selectedStructLeavingAtomId = selectedStruct.atoms.add(
        selectedStructLeavingAtom,
      );
      this.selectedToOriginalAtomsIdMap.set(
        selectedStructLeavingAtomId,
        leavingAtomId,
      );

      const selectedStructAttachmentAtomId =
        originalToSelectedAtomsIdMap.get(attachmentAtomId);
      assert(selectedStructAttachmentAtomId !== undefined);

      this.selectedToOriginalAtomsIdMap.set(
        selectedStructAttachmentAtomId,
        attachmentAtomId,
      );

      const bondFromOriginalAttachmentAtom = Array.from(
        currentStruct.bonds.values(),
      ).find(
        (bond) =>
          (bond.begin === leavingAtomId && bond.end === attachmentAtomId) ||
          (bond.end === leavingAtomId && bond.begin === attachmentAtomId),
      );
      assert(bondFromOriginalAttachmentAtom);

      const newBond = new Bond({
        type: bondFromOriginalAttachmentAtom.type,
        stereo: bondFromOriginalAttachmentAtom.stereo,
        begin: selectedStructAttachmentAtomId,
        end: selectedStructLeavingAtomId,
      });
      selectedStruct.bonds.add(newBond);

      const assignedAttachmentPointNames = Array.from(
        assignedAttachmentPoints.keys(),
      );
      const attachmentPointName = getNextFreeAttachmentPoint(
        assignedAttachmentPointNames,
        assignedAttachmentPointNames.length < sideAttachmentPointsNames.length,
      );

      assignedAttachmentPoints.set(attachmentPointName, [
        selectedStructAttachmentAtomId,
        selectedStructLeavingAtomId,
      ]);
    });

    const potentialAttachmentPoints = new Map<number, Set<number>>();
    this.potentialLeavingAtomsForManualAssignment.forEach((leavingAtomId) => {
      const leavingAtom = currentStruct.atoms.get(leavingAtomId);
      assert(leavingAtom);

      const originalLeavingAtomId =
        originalToSelectedAtomsIdMap.get(leavingAtomId);
      const isLeavingAtomSelected = isNumber(originalLeavingAtomId);

      if (!isLeavingAtomSelected) {
        return;
      }

      let attachmentAtomId = -1;
      leavingAtom.neighbors.forEach((halfBondId) => {
        const halfBond = currentStruct.halfBonds.get(halfBondId);
        assert(halfBond !== undefined);

        if (selection.atoms?.includes(halfBond.end)) {
          attachmentAtomId = halfBond.end;
        }
      });

      if (attachmentAtomId === -1) {
        return;
      }

      const originalAttachmentAtomId =
        originalToSelectedAtomsIdMap.get(attachmentAtomId);

      if (!isNumber(originalAttachmentAtomId)) {
        return;
      }

      const potentialLeavingAtomsSet = potentialAttachmentPoints.get(
        originalAttachmentAtomId,
      );
      if (!potentialLeavingAtomsSet) {
        const potentialLeavingAtoms = new Set([originalLeavingAtomId]);
        potentialAttachmentPoints.set(
          originalAttachmentAtomId,
          potentialLeavingAtoms,
        );
      } else {
        potentialLeavingAtomsSet.add(originalLeavingAtomId);
      }
    });

    const hasDefaultAttachmentPoints =
      this.terminalRGroupAtoms.length > 0 ||
      this.potentialLeavingAtomsForAutoAssignment.length > 0;

    this.monomerCreationState = {
      assignedAttachmentPoints,
      potentialAttachmentPoints,
      problematicAttachmentPoints: new Set(),
      hasDefaultAttachmentPoints,
    };

    this.originalHistoryStack = this.historyStack;
    this.originalHistoryPointer = this.historyPtr;
    this.originalStruct = currentStruct;

    this.historyStack = [];
    this.historyPtr = 0;
    this.struct(selectedStruct);

    this.subscribeToChangeEventInMonomerCreationWizard();
  }

  assignLeavingGroupAtom(atomId: number) {
    const action = new Action([
      new AssignLeavingGroupAtomOperation(this.monomerCreationState, atomId),
    ]).perform(this.render.ctab);

    this.update(action);
  }

  assignConnectionPointAtom(
    atomId: number,
    attachmentPointName?: AttachmentPointName,
    assignedAttachmentPointsByMonomer?: Map<
      AttachmentPointName,
      [number, number]
    >,
    monomerStructure?: Selection,
    forceAddNewLeavingGroupAtom = false,
  ) {
    assert(this.monomerCreationState);

    const potentialLeavingAtoms =
      this.monomerCreationState.potentialAttachmentPoints.get(atomId);

    let leavingAtomId: number;
    let additionalAction: Action | null = null;
    if (!forceAddNewLeavingGroupAtom && potentialLeavingAtoms) {
      const [, minimalAtomicNumberAtomId] = Array.from(potentialLeavingAtoms)
        .sort((a, b) => a - b)
        .reduce(
          (acc, currentAtomId) => {
            const atom = this.struct().atoms.get(currentAtomId);
            assert(atom);

            const atomicNumber = Elements.get(atom.label)?.number;
            if (atomicNumber !== undefined) {
              const minimalAtomicNumber = acc[0];
              if (atomicNumber < minimalAtomicNumber) {
                return [atomicNumber, currentAtomId];
              }
            }

            return acc;
          },
          [999, -1] as [number, number],
        );

      leavingAtomId = minimalAtomicNumberAtomId;
    } else {
      const [bondAdditionAction, , endAtomId, newBondId] = fromBondAddition(
        this.render.ctab,
        { type: Bond.PATTERN.TYPE.SINGLE, stereo: Bond.PATTERN.STEREO.NONE },
        atomId,
        { label: AtomLabel.H },
      );

      additionalAction = bondAdditionAction;
      leavingAtomId = endAtomId;

      if (monomerStructure) {
        monomerStructure.atoms?.push(leavingAtomId);
        monomerStructure.bonds?.push(newBondId);
      }
    }

    let finalAction = new Action([
      new AssignAttachmentAtomOperation(
        this.monomerCreationState,
        atomId,
        leavingAtomId,
        attachmentPointName,
        assignedAttachmentPointsByMonomer,
      ),
    ]).perform(this.render.ctab);

    if (additionalAction) {
      finalAction = finalAction.mergeWith(additionalAction);
    }

    this.update(finalAction);
  }

  closeMonomerCreationWizard(restoreOriginalStruct = false) {
    if (!this.isMonomerCreationWizardActive) {
      return;
    }

    this.unsubscribeFromChangeEventInMonomerCreationWizard();

    this.historyStack = this.originalHistoryStack;
    this.historyPtr = this.originalHistoryPointer;

    if (restoreOriginalStruct) {
      this.struct(this.originalStruct, false);
    }

    this.monomerCreationState = null;

    this.tool('select');
  }

  saveNewMonomer(data) {
    if (!this.monomerCreationState) {
      throw new Error(
        'Monomer creation wizard is not active, cannot save new monomer',
      );
    }
    const ketSerializer = new KetSerializer();
    const ketMicromolecule = JSON.parse(
      ketSerializer.serialize(data.structure),
    );

    const {
      symbol,
      name,
      type,
      naturalAnalogue,
      modificationTypes,
      aliasHELM,
      hidden,
    } = data;

    const attachmentPoints: IKetAttachmentPoint[] = [];
    const sortedAttachmentPointsData = new Map<string, [number, number]>(
      [...data.attachmentPoints].sort(),
    );

    sortedAttachmentPointsData.forEach(
      ([attachmentAtomId, leavingAtomId], attachmentPointName) => {
        let attachmentPointType: 'left' | 'right' | 'side' = 'side';
        if (attachmentPointName === AttachmentPointName.R1) {
          attachmentPointType = 'left';
        } else if (attachmentPointName === AttachmentPointName.R2) {
          attachmentPointType = 'right';
        }

        const attachmentPoint: IKetAttachmentPoint = {
          attachmentAtom: attachmentAtomId,
          leavingGroup: {
            atoms: [leavingAtomId],
          },
          type: attachmentPointType,
        };
        attachmentPoints.push(attachmentPoint);
      },
    );

    const monomerId = `${symbol}___${name}${hidden ? '___hidden' : ''}`;
    const monomerRef = setMonomerTemplatePrefix(monomerId);
    const monomerHELMClass = getHELMClassByKetMonomerClass(type);
    const naturalAnalogueToUse = fillNaturalAnalogueForPhosphateAndSugar(
      naturalAnalogue,
      type,
    );

    const monomerTemplate: IKetMonomerTemplate = {
      type: KetTemplateType.MONOMER_TEMPLATE,
      id: monomerId,
      class: type,
      classHELM: monomerHELMClass,
      alias: symbol,
      fullName: name,
      naturalAnalogShort: naturalAnalogueToUse,
      modificationTypes,
      aliasHELM,
      // TODO: Even though atoms positions are normalized, collapsing/expanding monomers still has some shift, investigate
      atoms: normalizeMonomerAtomsPositions(ketMicromolecule.mol0.atoms),
      bonds: ketMicromolecule.mol0.bonds,
      attachmentPoints,
      ...(hidden ? { hidden: true } : {}),
      root: {
        nodes: [],
        // TODO: Revisit IKetMonomerTemplate type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        connections: [],
        templates: [
          {
            $ref: monomerRef,
          },
        ],
      },
    };

    const monomerItem =
      ketSerializer.convertMonomerTemplateToLibraryItem(monomerTemplate);
    const [Monomer] = monomerFactory(monomerItem);
    const monomerBBox = data.structure.getCoordBoundingBoxObj();
    const monomerPosition = new Vec2(
      (monomerBBox.min.x + monomerBBox.max.x) / 2,
      (monomerBBox.min.y + monomerBBox.max.y) / 2,
    );
    const monomer = new Monomer(monomerItem, monomerPosition);

    return {
      monomer,
      monomerTemplate,
      monomerRef,
    };
  }

  finishNewMonomersCreation(monomersData, rnaPresetName?: string) {
    const ketcher = ketcherProvider.getKetcher(this.ketcherId);
    const isRnaType = Boolean(rnaPresetName);

    this.closeMonomerCreationWizard();

    const libraryItems = monomersData.map((monomerData) => {
      const {
        monomer,
        monomerTemplate,
        monomerRef,
        monomerStructureInWizard,
        atomIdMap,
      } = monomerData;
      const reversedAtomIdMap = new Map();

      for (const [key, value] of atomIdMap.entries()) {
        reversedAtomIdMap.set(value, key);
      }
      const sGroupAttachmentPoints =
        MacromoleculesConverter.convertMonomerAttachmentPointsToSGroupAttachmentPoints(
          monomer,
          reversedAtomIdMap,
        );

      const action = fromSgroupAddition(
        this.render.ctab,
        SGroup.TYPES.SUP,
        monomerStructureInWizard.atoms,
        { expanded: true },
        this.render.ctab.molecule.sgroups.newId(),
        sGroupAttachmentPoints,
        monomer.position,
        true,
        monomer.monomerItem.props.MonomerName,
        null,
        monomer,
      );

      this.render.ctab.molecule.clearFragments();
      this.render.ctab.molecule.markFragments();

      this.update(action);

      const { root: templateRoot, ...templateData } = monomerTemplate;
      const libraryItem = {
        root: {
          ...templateRoot,
        },
        [monomerRef]: {
          ...templateData,
        },
      };

      return libraryItem;
    });

    let ket = {
      root: {
        templates: libraryItems.map((libraryItem) => {
          return libraryItem.root.templates[0];
        }),
      },
    };

    libraryItems.forEach((libraryItem) => {
      ket = { ...libraryItem, ...ket };
    });

    if (isRnaType) {
      const templateId = monomersData
        .map((monomerData) => monomerData.monomerTemplate.id)
        .join('_');
      const templateRef = setMonomerGroupTemplatePrefix(templateId);
      const libraryItem = {
        root: {
          templates: [getKetRef(templateRef)],
        },
        [templateRef]: {
          type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
          class: KetMonomerClass.RNA,
          name: rnaPresetName,
          id: templateId,
          templates: [
            ...monomersData.map((monomerData) => {
              return getKetRef(monomerData.monomerRef);
            }),
          ],
        },
      };

      ket.root.templates.push(getKetRef(templateRef));
      ket[templateRef] = libraryItem[templateRef];
    }

    ketcher.updateMonomersLibrary(JSON.stringify(ket), {
      format: 'ket',
      shouldPersist: true,
      needDispatchLibraryUpdateEvent: true,
    });

    // store external bonds
    const externalBonds: Bond[] = [];

    this.originalStruct.bonds.forEach((bond) => {
      if (
        this.originalSelection.atoms?.includes(bond.begin) &&
        !this.originalSelection.atoms?.includes(bond.end)
      ) {
        externalBonds.push(bond);
      }
      if (
        this.originalSelection.atoms?.includes(bond.end) &&
        !this.originalSelection.atoms?.includes(bond.begin)
      ) {
        externalBonds.push(bond);
      }
    });

    // rerendering the original structure to clean up any leftover atoms/bonds from the wizard
    const newAction = new Action();
    const structFromWizard = this.struct();

    this.struct(this.originalStruct, false);

    // this.struct(struct) uses setTimeout to defer some calculations,
    // so we need to wait until they are done before applying further changes
    setTimeout(() => {
      newAction.mergeWith(
        fromFragmentDeletion(this.render.ctab, this.originalSelection),
      );

      this.update(newAction);

      const atomIdMap = new Map<number, number>();

      structFromWizard.mergeInto(
        this.struct(),
        undefined,
        undefined,
        undefined,
        undefined,
        atomIdMap,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );

      const originalToSelectedAtomsIdMap = new Map<number, number>();

      this.selectedToOriginalAtomsIdMap.forEach(
        (originalAtomId, selectedAtomId) => {
          originalToSelectedAtomsIdMap.set(originalAtomId, selectedAtomId);
        },
      );

      let struct = this.struct();

      externalBonds.forEach((bond) => {
        const beginIdInWizard = originalToSelectedAtomsIdMap.get(bond.begin);
        const endIdInWizard = originalToSelectedAtomsIdMap.get(bond.end);
        const newBegin =
          isNumber(beginIdInWizard) && atomIdMap.get(beginIdInWizard);
        const newEnd = isNumber(endIdInWizard) && atomIdMap.get(endIdInWizard);

        if (
          this.originalSelection.atoms?.includes(bond.begin) &&
          !this.originalSelection.atoms?.includes(bond.end) &&
          isNumber(beginIdInWizard) &&
          isNumber(newBegin)
        ) {
          const newBond = bond.clone();

          newBond.begin = newBegin;

          struct.bonds.add(newBond);
        }
        if (
          this.originalSelection.atoms?.includes(bond.end) &&
          !this.originalSelection.atoms?.includes(bond.begin) &&
          isNumber(endIdInWizard) &&
          isNumber(newEnd)
        ) {
          const newBond = bond.clone();

          newBond.end = newEnd;

          struct.bonds.add(newBond);
        }
      });

      // fully recreate canvas
      this.struct(
        this.struct().clone(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        ),
      );

      struct = this.struct();

      // fill beginSuperatomAttachmentPointNumber and endSuperatomAttachmentPointNumber for bonds
      // between monomers created in wizard together
      struct.bonds.forEach((bond) => {
        const fromSgroup = struct.getGroupFromAtomId(bond.begin);
        const toSgroup = struct.getGroupFromAtomId(bond.end);

        if (fromSgroup && fromSgroup.isMonomer && fromSgroup !== toSgroup) {
          fromSgroup.getAttachmentPoints().forEach((attachmentPoint) => {
            if (attachmentPoint.atomId === bond.begin) {
              bond.beginSuperatomAttachmentPointNumber =
                attachmentPoint.attachmentPointNumber;
            }
          });
        }

        if (toSgroup && toSgroup.isMonomer && toSgroup !== fromSgroup) {
          toSgroup.getAttachmentPoints().forEach((attachmentPoint) => {
            if (attachmentPoint.atomId === bond.end) {
              bond.endSuperatomAttachmentPointNumber =
                attachmentPoint.attachmentPointNumber;
            }
          });
        }
      });
    }, 0);
  }

  reassignAttachmentPointLeavingAtom(
    name: AttachmentPointName,
    newLeavingAtomId: number,
  ) {
    assert(this.monomerCreationState);

    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);

    const [attachmentAtomId, currentLeavingAtomId] = atomPair;

    let leavingAtomIdToUse = newLeavingAtomId;
    let additionalAction: Action | null = null;
    if (newLeavingAtomId === -1) {
      const [bondAdditionAction, , endAtomId] = fromBondAddition(
        this.render.ctab,
        { type: Bond.PATTERN.TYPE.SINGLE, stereo: Bond.PATTERN.STEREO.NONE },
        attachmentAtomId,
        { label: AtomLabel.H },
      );

      additionalAction = bondAdditionAction;
      leavingAtomIdToUse = endAtomId;
    }

    let finalAction = new Action([
      new ReassignLeavingAtomOperation(
        this.monomerCreationState,
        name,
        attachmentAtomId,
        leavingAtomIdToUse,
        currentLeavingAtomId,
      ),
    ]).perform(this.render.ctab);

    if (additionalAction) {
      finalAction = finalAction.mergeWith(additionalAction);
    }

    this.update(finalAction);
  }

  reassignAttachmentPoint(
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) {
    assert(this.monomerCreationState);

    const action = new Action([
      new ReassignAttachmentPointOperation(
        this.monomerCreationState,
        currentName,
        newName,
      ),
    ]).perform(this.render.ctab);

    this.update(action);
  }

  changeLeavingAtomLabel(
    name: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) {
    assert(this.monomerCreationState);

    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);

    const [, leavingAtomId] = atomPair;
    const leavingAtom = this.struct().atoms.get(leavingAtomId);
    assert(leavingAtom);

    // Don't do anything if the label is the same
    if (leavingAtom.label === newLeavingAtomLabel) {
      return;
    }

    // Change the atom label using fromAtomsAttrs
    const action = fromAtomsAttrs(
      this.render.ctab,
      leavingAtomId,
      { label: newLeavingAtomLabel },
      false,
    );

    this.update(action);
  }

  removeAttachmentPoint(name: AttachmentPointName) {
    assert(this.monomerCreationState);

    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);

    const [attachmentAtomId] = atomPair;

    const potentialLeavingAtoms = new Set(
      this.findPotentialLeavingAtoms(attachmentAtomId).map((atom) => {
        const atomId = this.struct().atoms.keyOf(atom);
        assert(atomId !== null);
        return atomId;
      }),
    );

    const action = new Action([
      new RemoveAttachmentPointOperation(
        this.monomerCreationState,
        name,
        potentialLeavingAtoms,
      ),
    ]).perform(this.render.ctab);

    this.update(action);
  }

  cleanupCloseAttachmentPointEditPopup() {
    assert(this.monomerCreationState);

    this.monomerCreationState.clickedAttachmentPoint = null;
    this.render.update(true);
  }

  setProblematicAttachmentPoints(problematicPoints: Set<AttachmentPointName>) {
    assert(this.monomerCreationState);

    this.monomerCreationState.problematicAttachmentPoints = problematicPoints;
    this.monomerCreationState = { ...(this.monomerCreationState || {}) };
    this.render.update(true);
  }

  highlightAttachmentPoint(name: AttachmentPointName | null) {
    if (!name) {
      this.render.ctab.setSelection(null);
      return;
    }

    assert(this.monomerCreationState);

    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);

    let selection: Selection = {
      atoms: [...atomPair],
    };

    const [attachmentAtomId, leavingAtomId] = atomPair;
    const bondId = this.struct().bonds.find((_, bond) => {
      return (
        (bond.begin === attachmentAtomId && bond.end === leavingAtomId) ||
        (bond.begin === leavingAtomId && bond.end === attachmentAtomId)
      );
    });

    if (bondId !== null) {
      selection = {
        ...selection,
        bonds: [bondId],
      };
    }

    this.render.ctab.setSelection(selection);
  }

  findPotentialLeavingAtoms(attachmentAtomId: number) {
    const bondsToOutside = this.struct().bonds.filter((_, bond) => {
      return (
        (attachmentAtomId === bond.begin && attachmentAtomId !== bond.end) ||
        (attachmentAtomId === bond.end && attachmentAtomId !== bond.begin)
      );
    });

    const potentialLeavingAtoms: Atom[] = [];
    bondsToOutside.forEach((bond) => {
      if (!Editor.isBondSuitableForAttachmentPoint(bond)) {
        return;
      }

      const atomIdToUse =
        attachmentAtomId === bond.begin ? bond.end : bond.begin;

      const atom = this.struct().atoms.get(atomIdToUse);
      assert(atom);

      if (atom.neighbors.length === 1) {
        potentialLeavingAtoms.push(atom);
      }
    });

    return potentialLeavingAtoms;
  }

  private subscribeToChangeEventInMonomerCreationWizard() {
    if (this.changeEventSubscriber) {
      return;
    }

    const handleChangeEvent = (data: ChangeEventData[]) => {
      if (!this.isMonomerCreationWizardActive || data.length === 0) {
        return;
      }

      this.collectChangesForMonomerCreationStateInvalidation(data);
    };

    this.changeEventSubscriber = this.subscribe('change', handleChangeEvent);
  }

  private unsubscribeFromChangeEventInMonomerCreationWizard() {
    if (this.changeEventSubscriber) {
      this.unsubscribe('change', this.changeEventSubscriber);
      this.changeEventSubscriber = null;
    }
  }

  private collectChangesForMonomerCreationStateInvalidation(
    data: ChangeEventData[],
  ) {
    if (!this.monomerCreationState) {
      return;
    }

    const changesMap = new Map<string, Set<number>>();

    data.forEach((entry) => {
      switch (entry.operation) {
        case OperationType.ATOM_DELETE:
        case OperationType.ATOM_ATTR:
        case OperationType.BOND_ADD:
        case OperationType.BOND_ATTR: {
          if (entry.id !== undefined) {
            const existingChanges = changesMap.get(entry.operation);
            if (existingChanges) {
              existingChanges.add(entry.id);
            } else {
              changesMap.set(entry.operation, new Set([entry.id]));
            }
          }
          break;
        }
      }
    });

    this.invalidateMonomerCreationWizardState(changesMap);
  }

  private invalidateMonomerCreationWizardState(
    changesMap: Map<string, Set<number>>,
  ) {
    if (!this.monomerCreationState) {
      return;
    }

    for (const [operation, ids] of changesMap.entries()) {
      switch (operation) {
        case OperationType.ATOM_DELETE:
          {
            // Invalidate assigned attachment points – check if any of the atoms in the atom pair is deleted
            const attachmentPointsToInvalidate = Array.from(
              this.monomerCreationState.assignedAttachmentPoints.entries(),
            ).filter(
              ([, atomPair]) => ids.has(atomPair[0]) || ids.has(atomPair[1]),
            );

            if (!attachmentPointsToInvalidate) {
              continue;
            }

            attachmentPointsToInvalidate.forEach(
              ([attachmentPointName, atomPair]) => {
                const [attachmentAtomId, leavingAtomId] = atomPair;
                if (ids.has(attachmentAtomId)) {
                  // If attachment atom is deleted, remove the entire entry
                  this.monomerCreationState?.assignedAttachmentPoints.delete(
                    attachmentPointName,
                  );
                } else if (ids.has(leavingAtomId)) {
                  // If leaving atom is deleted, try to find another suitable leaving atom
                  const potentialLeavingAtoms =
                    this.findPotentialLeavingAtoms(attachmentAtomId);
                  if (potentialLeavingAtoms.length === 0) {
                    // If no suitable leaving atom is found, remove the entire entry
                    this.monomerCreationState?.assignedAttachmentPoints.delete(
                      attachmentPointName,
                    );
                  } else {
                    // If a suitable leaving atom is found, update the entry with the new leaving atom
                    const newLeavingAtomId = this.struct().atoms.keyOf(
                      potentialLeavingAtoms[0],
                    );
                    assert(newLeavingAtomId !== null);
                    this.monomerCreationState?.assignedAttachmentPoints.set(
                      attachmentPointName,
                      [attachmentAtomId, newLeavingAtomId],
                    );
                  }
                }
              },
            );

            // Invalidate potential attachment points
            const potentialAttachmentPointsToInvalidate = Array.from(
              this.monomerCreationState.potentialAttachmentPoints.entries(),
            );

            potentialAttachmentPointsToInvalidate.forEach(
              ([attachmentAtomId, leavingAtomIds]) => {
                // If the attachment atom is deleted, remove the entire entry
                if (ids.has(attachmentAtomId)) {
                  this.monomerCreationState?.potentialAttachmentPoints.delete(
                    attachmentAtomId,
                  );
                } else {
                  // If any leaving atoms are deleted, remove them from the set
                  const updatedLeavingAtomIds = new Set(
                    Array.from(leavingAtomIds).filter((id) => !ids.has(id)),
                  );

                  // If no leaving atoms remain, remove the entire entry
                  if (updatedLeavingAtomIds.size === 0) {
                    this.monomerCreationState?.potentialAttachmentPoints.delete(
                      attachmentAtomId,
                    );
                  } else {
                    // Update the set with remaining leaving atoms
                    this.monomerCreationState?.potentialAttachmentPoints.set(
                      attachmentAtomId,
                      updatedLeavingAtomIds,
                    );
                  }
                }
              },
            );
          }
          break;

        case OperationType.BOND_ATTR: {
          for (const id of ids.values()) {
            const bond = this.struct().bonds.get(id);
            assert(bond);

            // Handle assigned attachment points
            const attachmentPointWithBond = Array.from(
              this.monomerCreationState.assignedAttachmentPoints.entries(),
            ).find(([, atomPair]) => {
              return (
                (bond.begin === atomPair[0] && bond.end === atomPair[1]) ||
                (bond.begin === atomPair[1] && bond.end === atomPair[0])
              );
            });

            // If bond between attachment atom and leaving atom becomes non-suitable, mark the AP as problematic
            if (attachmentPointWithBond) {
              if (!Editor.isBondSuitableForAttachmentPoint(bond)) {
                this.monomerCreationState.problematicAttachmentPoints.add(
                  attachmentPointWithBond[0],
                );
              } else {
                this.monomerCreationState.problematicAttachmentPoints.delete(
                  attachmentPointWithBond[0],
                );
              }
            }

            // Handle potential attachment points
            // If bond becomes non-suitable, we need to remove the leaving atom from potential attachment points
            if (!Editor.isBondSuitableForAttachmentPoint(bond)) {
              this.monomerCreationState.potentialAttachmentPoints.forEach(
                (leavingAtomIds, attachmentAtomId) => {
                  const updatedLeavingAtomIds = new Set(leavingAtomIds);

                  // Check if this bond connects the attachment atom to any of its potential leaving atoms
                  const bondFromAttachmentAtom =
                    bond.begin === attachmentAtomId &&
                    leavingAtomIds.has(bond.end);
                  const bondToAttachmentAtom =
                    bond.end === attachmentAtomId &&
                    leavingAtomIds.has(bond.begin);
                  // If so, remove the leaving atom from the set
                  if (bondFromAttachmentAtom || bondToAttachmentAtom) {
                    updatedLeavingAtomIds.delete(
                      bondFromAttachmentAtom ? bond.end : bond.begin,
                    );
                  }

                  if (updatedLeavingAtomIds.size === 0) {
                    // If no leaving atoms remain, remove the entire entry
                    this.monomerCreationState?.potentialAttachmentPoints.delete(
                      attachmentAtomId,
                    );
                  } else {
                    // Update the set with remaining leaving atoms
                    this.monomerCreationState?.potentialAttachmentPoints.set(
                      attachmentAtomId,
                      updatedLeavingAtomIds,
                    );
                  }
                },
              );
            }
          }
          break;
        }

        case OperationType.BOND_ADD: {
          for (const id of ids.values()) {
            const bond = this.struct().bonds.get(id);
            assert(bond);

            // Handle assigned attachment points - existing logic
            const attachmentPointWithBondToLeavingAtom = Array.from(
              this.monomerCreationState.assignedAttachmentPoints.entries(),
            ).find(([, [attachmentAtomId, leavingAtomId]]) => {
              return (
                (bond.begin === leavingAtomId &&
                  bond.end !== attachmentAtomId) ||
                (bond.end === leavingAtomId && bond.begin !== attachmentAtomId)
              );
            });

            if (attachmentPointWithBondToLeavingAtom) {
              const [attachmentPointName] =
                attachmentPointWithBondToLeavingAtom;
              this.monomerCreationState.assignedAttachmentPoints.delete(
                attachmentPointName,
              );
            }

            // Handle potential attachment points
            // If a suitable bond is created from a potential attachment atom,
            // add the other end to the set of potential leaving atoms
            if (Editor.isBondSuitableForAttachmentPoint(bond)) {
              // Check if bond.begin is a potential attachment atom
              if (
                this.monomerCreationState.potentialAttachmentPoints.has(
                  bond.begin,
                )
              ) {
                const leavingAtomIds =
                  this.monomerCreationState.potentialAttachmentPoints.get(
                    bond.begin,
                  );
                assert(leavingAtomIds);

                // Check if the other end (bond.end) can be a leaving atom (has only one neighbor)
                const endAtom = this.struct().atoms.get(bond.end);
                if (endAtom && endAtom.neighbors.length === 1) {
                  const updatedLeavingAtomIds = new Set(leavingAtomIds);
                  updatedLeavingAtomIds.add(bond.end);
                  this.monomerCreationState.potentialAttachmentPoints.set(
                    bond.begin,
                    updatedLeavingAtomIds,
                  );
                }
              }

              // Check if bond.end is a potential attachment atom
              if (
                this.monomerCreationState.potentialAttachmentPoints.has(
                  bond.end,
                )
              ) {
                const leavingAtomIds =
                  this.monomerCreationState.potentialAttachmentPoints.get(
                    bond.end,
                  );
                assert(leavingAtomIds);

                // Check if the other end (bond.begin) can be a leaving atom (has only one neighbor)
                const beginAtom = this.struct().atoms.get(bond.begin);
                if (beginAtom && beginAtom.neighbors.length === 1) {
                  const updatedLeavingAtomIds = new Set(leavingAtomIds);
                  updatedLeavingAtomIds.add(bond.begin);
                  this.monomerCreationState.potentialAttachmentPoints.set(
                    bond.end,
                    updatedLeavingAtomIds,
                  );
                }
              }
            }
          }
          break;
        }

        default:
          break;
      }
    }

    this.monomerCreationState = { ...(this.monomerCreationState || {}) };
  }

  selection(ci?: any) {
    if (arguments.length === 0) {
      return this._selection; // eslint-disable-line
    }

    let ReStruct = this.render.ctab;
    let selectAll = false;
    this._selection = null; // eslint-disable-line
    if (ci === 'all') {
      selectAll = true;
      // TODO: better way will be this.struct()
      ci = structObjects.reduce((res, key) => {
        res[key] = Array.from(ReStruct[key].keys());
        return res;
      }, {});
    }

    if (ci === 'descriptors') {
      ReStruct = this.render.ctab;
      ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) };
    }

    if (ci) {
      const res: Selection = {};

      Object.keys(ci).forEach((key) => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice();
      });

      if (Object.keys(res).length !== 0) {
        this._selection = res; // eslint-disable-line
      }
      const stereoFlags = selectStereoFlagsIfNecessary(
        this.struct().atoms,
        this.explicitSelected().atoms,
      );
      if (stereoFlags.length !== 0) {
        this._selection?.enhancedFlags
          ? (this._selection.enhancedFlags = Array.from(
              new Set([...this._selection.enhancedFlags, ...stereoFlags]),
            ))
          : (res.enhancedFlags = stereoFlags);
      }
    }

    this.render.ctab.setSelection(this._selection); // eslint-disable-line
    this.event.selectionChange.dispatch(this._selection); // eslint-disable-line

    if (selectAll) {
      this.rotateController.rerender();
    } else if (this._selection === null) {
      this.rotateController.clean();
    }

    this.render.update(false, null);
    return this._selection; // eslint-disable-line
  }

  hover(
    ci: { id: number; map: string } | null,
    newTool?: any,
    event?: PointerEvent,
  ) {
    const tool = newTool || this._tool; // eslint-disable-line

    if (
      'ci' in tool &&
      (!ci || tool.ci.map !== ci.map || tool.ci.id !== ci.id)
    ) {
      setHover(tool.ci, false, this.render);
      delete tool.ci;
    }

    if (ci && setHover(ci, true, this.render)) {
      tool.ci = ci;
    }

    if (!ci) {
      setFunctionalGroupsTooltip({
        editor: this,
        isShow: false,
      });
      return;
    }

    if (event) {
      setFunctionalGroupsTooltip({
        editor: this,
        event,
        isShow: true,
      });
    }
  }

  update(action: Action | true, ignoreHistory?: boolean) {
    setFunctionalGroupsTooltip({
      editor: this,
      isShow: false,
    });
    if (!ignoreHistory) {
      this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    }
    if (action === true) {
      this.render.update(true, null); // force
    } else {
      if (!ignoreHistory && !action.isDummy()) {
        this.historyStack.splice(this.historyPtr, HISTORY_SIZE + 1, action);
        if (this.historyStack.length > HISTORY_SIZE) {
          this.historyStack.shift();
        }
        this.historyPtr = this.historyStack.length;
        this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
        ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch(action);
      }
      this.render.update(false, null);
    }
  }

  historySize(): { readonly undo: number; readonly redo: number } {
    return {
      undo: this.historyPtr,
      redo: this.historyStack.length - this.historyPtr,
    };
  }

  undo() {
    KetcherLogger.log(
      'Editor.undo(), start, ',
      this.historyPtr,
      this.historyStack,
    );

    const ketcherChangeEvent = ketcherProvider.getKetcher(
      this.ketcherId,
    ).changeEvent;
    if (this.historyPtr === 0) {
      throw new Error('Undo stack is empty');
    }
    if (this._tool?.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    this.historyPtr--;
    const stack = this.historyStack[this.historyPtr];
    const action = stack.perform(this.render.ctab);

    this.historyStack[this.historyPtr] = action;

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch(); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch();
    } else {
      this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch(action);
    }

    this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.render.update();

    KetcherLogger.log('Editor.undo(), end');
  }

  redo() {
    KetcherLogger.log(
      'Editor.redo(), start, ',
      this.historyPtr,
      this.historyStack,
    );

    const ketcherChangeEvent = ketcherProvider.getKetcher(
      this.ketcherId,
    ).changeEvent;
    if (this.historyPtr === this.historyStack.length) {
      throw new Error('Redo stack is empty');
    }

    if (this._tool?.cancel) {
      this._tool.cancel();
    }

    this.selection(null);

    const stack = this.historyStack[this.historyPtr];
    let action!: Action;
    try {
      action = stack.perform(this.render.ctab);
    } finally {
      this.historyStack[this.historyPtr] = action;
      this.historyPtr++;
    }

    if (this._tool instanceof toolsMap.paste) {
      this.event.change.dispatch(); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch();
    } else {
      this.event.change.dispatch(action); // TODO: stoppable here. This has to be removed, however some implicit subscription to change event exists somewhere in the app and removing it leads to unexpected behavior, investigate further
      ketcherChangeEvent.dispatch(action);
    }

    this.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.render.update();

    KetcherLogger.log('Editor.redo(), end');
  }

  public clearHistory() {
    this.historyStack = [];
    this.historyPtr = 0;
  }

  subscribe(eventName: any, handler: any) {
    const subscriber = {
      handler,
    };

    switch (eventName) {
      case 'change': {
        const subscribeFuncWrapper = (action) =>
          customOnChangeHandler(action, handler);
        subscriber.handler = subscribeFuncWrapper;
        ketcherProvider
          .getKetcher(this.ketcherId)
          .changeEvent.add(subscribeFuncWrapper);
        break;
      }

      case 'libraryUpdate': {
        ketcherProvider
          .getKetcher(this.ketcherId)
          .libraryUpdateEvent.add(handler);
        break;
      }

      default:
        this.event[eventName].add(handler);
    }

    return subscriber;
  }

  unsubscribe(eventName: any, subscriber: any) {
    // Only for event type - subscription
    this.event[eventName].remove(subscriber.handler);
  }

  findItem(event: any, maps: Array<string> | null, skip: any = null) {
    const pos = CoordinateTransformation.pageToModel(event, this.render);

    return closest.item(this.render.ctab, pos, maps, skip, this.render.options);
  }

  findMerge(srcItems: any, maps: any) {
    return closest.merge(this.render.ctab, srcItems, this.render.options, maps);
  }

  explicitSelected(autoSelectBonds = true) {
    const selection = this.selection() || {};
    const res = structObjects.reduce((acc, key) => {
      acc[key] = selection[key] ? selection[key].slice() : [];
      return acc;
    }, {} as any);

    const struct = this.render.ctab.molecule;

    // "auto-select" the atoms for the bonds in selection
    if (res.bonds) {
      res.bonds.forEach((bid) => {
        const bond = struct.bonds.get(bid);
        if (bond) {
          res.atoms = res.atoms || [];
          if (res.atoms.indexOf(bond.begin) < 0) {
            res.atoms.push(bond.begin);
          }

          if (res.atoms.indexOf(bond.end) < 0) {
            res.atoms.push(bond.end);
          }
        }
      });
    }

    // "auto-select" the bonds with both atoms selected
    if (autoSelectBonds && res.atoms && res.bonds) {
      struct.bonds.forEach((bond, bid) => {
        if (
          res.bonds.indexOf(bid) < 0 &&
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds = res.bonds || [];
          res.bonds.push(bid);
        }
      });
    }

    return res;
  }

  structSelected(
    existingSelection?: Selection,
    atomIdMap?: Map<number, number>,
    bondIdMap?: Map<number, number>,
  ): Struct {
    const struct = this.render.ctab.molecule;
    const selection = existingSelection ?? this.explicitSelected();
    const dst = struct.clone(
      new Pile(selection.atoms),
      new Pile(selection.bonds),
      true,
      atomIdMap,
      new Pile(selection.simpleObjects),
      new Pile(selection.texts),
      null,
      new Pile(selection.images),
      new Pile(selection[MULTITAIL_ARROW_KEY]),
      bondIdMap,
    );

    // Copy by its own as Struct.clone doesn't support
    // arrows/pluses id sets
    struct.rxnArrows.forEach((item, id) => {
      if (selection.rxnArrows.indexOf(id) !== -1)
        dst.rxnArrows.add(item.clone());
    });
    struct.rxnPluses.forEach((item, id) => {
      if (selection.rxnPluses.indexOf(id) !== -1)
        dst.rxnPluses.add(item.clone());
    });

    dst.isReaction = struct.isReaction && struct.isRxn();

    return dst;
  }

  alignDescriptors() {
    this.selection(null);
    const action = fromDescriptorsAlign(this.render.ctab);
    this.update(action);
    this.render.update(true);
  }

  setMacromoleculeConvertionError(errorMessage: string) {
    this.macromoleculeConvertionError = errorMessage;
  }

  clearMacromoleculeConvertionError() {
    this.macromoleculeConvertionError = null;
  }

  focusCliparea() {
    const cliparea: HTMLElement | null = document.querySelector('.cliparea');
    cliparea?.focus();
  }
}

/**
 * Main button pressed, usually the left button or the un-initialized state
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

function resetSelectionOnCanvasClick(
  editor: Editor,
  eventName: string,
  clientArea: HTMLElement,
  event,
) {
  if (
    eventName === 'mouseup' &&
    editor.selection() &&
    clientArea.contains(event.target)
  ) {
    editor.selection(null);
  }
}

function updateLastCursorPosition(editor: Editor, event) {
  const events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
  if (events.includes(event.type)) {
    const clientAreaBoundingBox =
      editor.render.clientArea.getBoundingClientRect();

    editor.lastCursorPosition = {
      x: event.clientX - clientAreaBoundingBox.x,
      y: event.clientY - clientAreaBoundingBox.y,
    };
  }
}

function isContextMenuClosed(contextMenu: ContextMenuInfo) {
  return !Object.values(contextMenu).some(Boolean);
}

function useToolIfNeeded(
  editor: Editor,
  eventHandlerName: ToolEventHandlerName,
  clientArea: HTMLElement,
  event,
) {
  const editorTool = editor.tool();
  if (!editorTool) {
    return false;
  }

  editor.lastEvent = event;
  const conditions = [
    eventHandlerName in editorTool,
    clientArea.contains(event.target) || editorTool.isSelectionRunning?.(),
    isContextMenuClosed(editor.contextMenu),
  ];

  if (conditions.every((condition) => condition)) {
    editorTool[eventHandlerName]?.(event);
    return true;
  }

  return false;
}

function domEventSetup(editor: Editor, clientArea: HTMLElement) {
  // TODO: addEventListener('resize', ...);
  const trackedDomEvents: {
    target: Node;
    eventName: string;
    toolEventHandler: ToolEventHandlerName;
  }[] = [
    {
      target: clientArea,
      eventName: 'click',
      toolEventHandler: 'click',
    },
    {
      target: clientArea,
      eventName: 'dblclick',
      toolEventHandler: 'dblclick',
    },
    {
      target: clientArea,
      eventName: 'mousedown',
      toolEventHandler: 'mousedown',
    },
    {
      target: document,
      eventName: 'mousemove',
      toolEventHandler: 'mousemove',
    },
    {
      target: document,
      eventName: 'mouseup',
      toolEventHandler: 'mouseup',
    },
    {
      target: document,
      eventName: 'mouseleave',
      toolEventHandler: 'mouseleave',
    },
    {
      target: clientArea,
      eventName: 'mouseleave',
      toolEventHandler: 'mouseLeaveClientArea',
    },
    {
      target: clientArea,
      eventName: 'mouseover',
      toolEventHandler: 'mouseover',
    },
  ];

  trackedDomEvents.forEach(({ target, eventName, toolEventHandler }) => {
    editor.event[eventName] = new DOMSubscription();
    const subs = editor.event[eventName];

    target.addEventListener(eventName, (...args) => {
      if (window.isPolymerEditorTurnedOn) return;
      subs.dispatch(...args);
    });

    subs.add((event) => {
      updateLastCursorPosition(editor, event);

      if (
        ['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) &&
        !isMouseMainButtonPressed(event)
      ) {
        return true;
      }

      if (eventName === 'mousemove') {
        const itemUnderCursor = editor.findItem(event, [
          'atoms',
          'bonds',
          'sgroups',
        ]);
        if (!itemUnderCursor) {
          editor.hover(null);
        }
      }

      if (eventName !== 'mouseup' && eventName !== 'mouseleave') {
        // to complete drag actions
        if (!event.target || event.target.nodeName === 'DIV') {
          // click on scroll
          editor.hover(null);
          return true;
        }
      }

      const isToolUsed = useToolIfNeeded(
        editor,
        toolEventHandler,
        clientArea,
        event,
      );
      if (isToolUsed) {
        return true;
      }

      resetSelectionOnCanvasClick(editor, eventName, clientArea, event);

      return true;
    }, -1);
  });
}

export { Editor };
export default Editor;

function setHover(ci: any, visible: any, render: any) {
  if (highlightTargets.indexOf(ci.map) === -1) {
    return false;
  }

  let item: any = null;

  if (ci.map === 'merge') {
    Object.keys(ci.items).forEach((mp) => {
      ci.items[mp].forEach((dstId) => {
        item = render.ctab[mp].get(dstId)!;

        if (item) {
          item.setHover(visible, render);
        }
      });
    });

    return true;
  }

  if (ci.map === 'functionalGroups') ci.map = 'sgroups'; // TODO: Refactor object

  item = (render.ctab[ci.map] as Map<any, any>).get(ci.id);
  if (!item) {
    return true; // TODO: fix, attempt to highlight a deleted item
  }

  if (
    (ci.map === 'sgroups' && item.item.type === 'DAT') ||
    ci.map === 'sgroupData'
  ) {
    // set highlight for both the group and the data item
    const item1 = render.ctab.sgroups.get(ci.id);
    if (item1) {
      item1.setHover(visible, render);
    }

    const item2 = render.ctab.sgroupData.get(ci.id);
    if (item2) {
      item2.setHover(visible, render);
    }
  } else {
    item.setHover(visible, render);
  }
  return true;
}
