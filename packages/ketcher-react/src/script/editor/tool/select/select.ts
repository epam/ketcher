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
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CoordinateTransformation,
  fromImageResize,
  fromItemsFuse,
  fromMultipleMove,
  fromSimpleObjectResizing,
  fromTextDeletion,
  fromTextUpdating,
  FunctionalGroup,
  getHoverToFuse,
  getItemsToFuse,
  IMAGE_KEY,
  KetcherLogger,
  MULTITAIL_ARROW_KEY,
  ReSGroup,
  ReStruct,
  SGroup,
  Vec2,
  vectorUtils,
} from 'ketcher-core';

import LassoHelper from '../helper/lasso';
import {
  isBondingWithMacroMolecule,
  isMergingToMacroMolecule,
} from '../helper/isMacroMolecule';
import { atomLongtapEvent } from '../atom';
import SGroupTool from '../sgroup';
import { Editor } from '../../Editor';
import { dropAndMerge } from '../helper/dropAndMerge';
import { getGroupIdsFromItemArrays } from '../helper/getGroupIdsFromItems';
import { updateSelectedAtoms } from '../../../ui/state/modal/atoms';
import { updateSelectedBonds } from '../../../ui/state/modal/bonds';
import { filterNotInContractedSGroup } from '../helper/filterNotInCollapsedSGroup';
import { Tool } from '../Tool';
import { handleMovingPosibilityCursor } from '../../utils';
import { getItemCursor } from '../../utils/getItemCursor';
import {
  ArrowMoveTool,
  MultitailArrowClosestItem,
  ReactionArrowClosestItem,
} from '../arrow/arrow.types';
import { MultitailArrowMoveTool } from '../arrow/multitailArrowMoveTool';
import { ReactionArrowMoveTool } from '../arrow/reactionArrowMoveTool';
import {
  getNewSelectedItems,
  getSelectedAtoms,
  getSelectedBonds,
  onSelectionEnd,
  onSelectionLeave,
  onSelectionMove,
  onSelectionStart,
  selMerge,
} from './select.helpers';
import { SelectMode } from './select.types';

enum Direction {
  LEFT,
  TOP,
  RIGHT,
  DOWN,
}

class SelectTool implements Tool {
  readonly #mode: SelectMode;
  readonly #lassoHelper: LassoHelper;
  private readonly editor: Editor;
  private dragCtx: any;
  private previousMouseMoveEvent?: PointerEvent;
  isMouseDown = false;
  readonly isMoving = false;
  private multitailArrowMoveTool: ArrowMoveTool<MultitailArrowClosestItem>;
  private reactionArrowMoveTool: ArrowMoveTool<ReactionArrowClosestItem>;

  constructor(editor: Editor, mode: SelectMode) {
    this.editor = editor;
    this.multitailArrowMoveTool = new MultitailArrowMoveTool(editor);
    this.reactionArrowMoveTool = new ReactionArrowMoveTool(editor);
    this.#mode = mode;
    this.#lassoHelper = new LassoHelper(
      this.#mode === 'lasso' ? 0 : 1,
      editor,
      this.#mode === 'fragment',
    );
  }

  isSelectionRunning() {
    return this.#lassoHelper.running();
  }

  mousedown(event: PointerEvent) {
    this.isMouseDown = true;
    const rnd = this.editor.render;
    const ctab = rnd.ctab;
    const molecule = ctab.molecule;

    const map = getMapsForClosestItem(
      this.#lassoHelper.fragment || event.ctrlKey,
    );
    const ci = this.editor.findItem(event, map, null);

    if (isBondingWithMacroMolecule(this.editor, event)) {
      return;
    }

    const selected = {
      ...(ci?.map === 'atoms' && { atoms: [ci.id] }),
      ...(ci?.map === 'bonds' && { bonds: [ci.id] }),
    };
    const selectedSgroups = ci
      ? getGroupIdsFromItemArrays(molecule, selected)
      : [];
    const newSelected = getNewSelectedItems(this.editor, selectedSgroups);
    if (newSelected.atoms?.length || newSelected.bonds?.length) {
      this.editor.selection(newSelected);
    }
    const currentPosition = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );

    if (!ci) {
      onSelectionStart(event, this.editor, this.#lassoHelper);
      return true;
    }

    if (ci.map === MULTITAIL_ARROW_KEY && ci.ref) {
      this.dragCtx = this.multitailArrowMoveTool.mousedown(
        event,
        ci as MultitailArrowClosestItem,
      );
    } else if (ci.map === 'rxnArrows' && ci.ref) {
      this.dragCtx = this.reactionArrowMoveTool.mousedown(
        event,
        ci as ReactionArrowClosestItem,
      );
    } else {
      this.dragCtx = {
        item: ci,
        xy0: currentPosition,
      };
    }

    if (!ci || ci.map === 'atoms') {
      atomLongtapEvent(this, rnd);
    }

    let sel = closestToSel(ci);
    const sgroups = ctab.sgroups.get(ci.id);
    const selection = this.editor.selection();
    if (ci.map === 'frags') {
      const frag = ctab.frags.get(ci.id);
      sel = {
        atoms: frag.fragGetAtoms(ctab, ci.id),
        bonds: frag.fragGetBonds(ctab, ci.id),
      };
    } else if (
      (ci.map === 'sgroups' || ci.map === 'functionalGroups') &&
      sgroups
    ) {
      const sgroup = sgroups.item;
      sel = {
        atoms: SGroup.getAtoms(molecule, sgroup),
        bonds: SGroup.getBonds(molecule, sgroup),
      };
    } else if (ci.map === 'rgroups') {
      const rgroup = ctab.rgroups.get(ci.id);
      sel = {
        atoms: rgroup.getAtoms(rnd),
        bonds: rgroup.getBonds(rnd),
      };
    } else if (ci.map === 'sgroupData') {
      if (isSelected(selection, ci)) return true;
    }

    if (event.shiftKey) {
      this.editor.selection(selMerge(sel, selection, true));
    } else {
      this.editor.selection(null);
      this.editor.selection(isSelected(selection, ci) ? selection : sel);
    }

    this.handleMoveCloseToEdgeOfCanvas();

    return true;
  }

  mousemove(event: PointerEvent) {
    this.previousMouseMoveEvent = event;
    const editor = this.editor;
    const rnd = editor.render;
    const restruct = editor.render.ctab;
    const dragCtx = this.dragCtx;
    if (dragCtx?.stopTapping) dragCtx.stopTapping();

    if (dragCtx?.closestItem) {
      if (dragCtx.action) {
        dragCtx.action.perform(restruct);
      }

      if (dragCtx.closestItem.map === 'rxnArrows') {
        this.dragCtx.action = this.reactionArrowMoveTool.mousemove(
          event,
          this.dragCtx,
        );
      } else if (dragCtx.closestItem.map === MULTITAIL_ARROW_KEY) {
        this.dragCtx.action = this.multitailArrowMoveTool.mousemove(
          event,
          this.dragCtx,
        );
      }
      if (dragCtx.action) {
        editor.update(dragCtx.action, true);
        return true;
      }
    }

    if (dragCtx?.item) {
      const atoms = restruct.molecule.atoms;
      const selection = editor.selection();

      /* handle atoms */
      const shouldDisplayDegree =
        dragCtx.item.map === 'atoms' &&
        atoms?.get(dragCtx.item.id)?.neighbors.length === 1 &&
        selection?.atoms?.length === 1 &&
        !selection.bonds;
      if (shouldDisplayDegree) {
        // moving selected objects
        const pos = rnd.page2obj(event);
        const angle = vectorUtils.calcAngle(dragCtx.xy0, pos);
        const degrees = vectorUtils.degrees(angle);
        editor.event.message.dispatch({ info: degrees + 'º' });
      }
      /* end */

      /* handle image resize */
      if (dragCtx.item.map === IMAGE_KEY && dragCtx.item.ref) {
        if (dragCtx.action) dragCtx.action.perform(rnd.ctab);
        const position = CoordinateTransformation.pageToModel(event, rnd);
        dragCtx.action = fromImageResize(
          rnd.ctab,
          dragCtx.item.id,
          position,
          dragCtx.item.ref,
        );
        editor.update(dragCtx.action, true);
        return true;
      }
      /* end + fullstop */

      /* handle simpleObjects */
      if (dragCtx.item.map === 'simpleObjects' && dragCtx.item.ref) {
        if (dragCtx.action) dragCtx.action.perform(rnd.ctab);
        const props = getResizingProps(editor, dragCtx, event);
        dragCtx.action = fromSimpleObjectResizing(...props, event.shiftKey);
        editor.update(dragCtx.action, true);
        return true;
      }
      /* end + fullstop */

      /* handle functionalGroups */
      if (dragCtx.item.map === 'functionalGroups' && !dragCtx.action) {
        editor.event.showInfo.dispatch(null);
      }
      /* end */

      if (dragCtx.action) {
        dragCtx.action.perform(restruct);
      }

      const expSel = editor.explicitSelected();
      dragCtx.action = fromMultipleMove(
        restruct,
        expSel,
        editor.render.page2obj(event).sub(dragCtx.xy0),
      );

      const visibleSelectedItems = filterNotInContractedSGroup(
        expSel,
        this.editor.struct(),
      );
      dragCtx.mergeItems = getItemsToFuse(editor, visibleSelectedItems);
      editor.hover(getHoverToFuse(dragCtx.mergeItems));

      editor.update(dragCtx.action, true);
      return true;
    }

    const isSelectionRunning = onSelectionMove(
      event,
      this.editor,
      this.#lassoHelper,
    );
    if (isSelectionRunning) {
      return true;
    }

    const maps = getMapsForClosestItem(
      this.#lassoHelper.fragment || event.ctrlKey,
    );
    const item = editor.findItem(event, maps, null);
    editor.hover(item, null, event);
    handleMovingPosibilityCursor(
      item,
      this.editor.render.paper.canvas,
      getItemCursor(this.editor.render, item),
    );

    return true;
  }

  mouseup(event: PointerEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.isMouseDown = false;

    const editor = this.editor;
    const selected = editor.selection();
    const struct = editor.render.ctab;
    const molecule = struct.molecule;

    // add all items of all selectedSGroups to selection
    const selectedSgroups = selected
      ? getGroupIdsFromItemArrays(molecule, selected)
      : [];

    if (this.dragCtx?.stopTapping) this.dragCtx.stopTapping();

    /* ignore salts and solvents */
    const possibleSaltOrSolvent = struct.sgroups.get(
      selectedSgroups[selectedSgroups.length - 1],
    );
    const isDraggingSaltOrSolventOnStructure = SGroup.isSaltOrSolvent(
      possibleSaltOrSolvent?.item?.data?.name,
    );
    const isDraggingCustomSgroupOnStructure =
      SGroup.isSuperAtom(possibleSaltOrSolvent?.item) &&
      !FunctionalGroup.isFunctionalGroup(possibleSaltOrSolvent?.item);
    if (
      this.dragCtx &&
      (isDraggingCustomSgroupOnStructure ||
        isDraggingSaltOrSolventOnStructure ||
        this.isDraggingStructureOnSaltOrSolvent(this.dragCtx, struct.sgroups))
    ) {
      preventSaltAndSolventsMerge(struct, this.dragCtx, editor);
      delete this.dragCtx;
    }
    /* end */
    if (this.dragCtx?.closestItem) {
      if (this.dragCtx.closestItem.map === 'rxnArrows') {
        this.dragCtx.action = this.reactionArrowMoveTool.mouseup(
          event,
          this.dragCtx,
        );
      } else if (this.dragCtx.closestItem.map === MULTITAIL_ARROW_KEY) {
        this.dragCtx.action = this.multitailArrowMoveTool.mouseup(
          event,
          this.dragCtx,
        );
      }
      if (this.dragCtx.action) {
        this.editor.update(this.dragCtx.action);
        this.editor.update(true);
      }
    }

    if (this.dragCtx?.item) {
      if (!isMergingToMacroMolecule(this.editor, this.dragCtx)) {
        dropAndMerge(editor, this.dragCtx.mergeItems, this.dragCtx.action);
      }
    } else {
      onSelectionEnd(event, this.editor, this.#lassoHelper);
    }
    this.dragCtx = null;
    editor.event.message.dispatch({
      info: false,
    });

    this.editor.rotateController.rerender();
  }

  dblclick(event) {
    const editor = this.editor;
    const struct = editor.render.ctab;
    const { molecule, sgroups } = struct;
    const functionalGroups = molecule.functionalGroups;
    const ci = editor.findItem(
      event,
      ['atoms', 'bonds', 'sgroups', 'functionalGroups', 'sgroupData', 'texts'],
      null,
    );

    const atomResult: any[] = [];
    const bondResult: any[] = [];
    const result: any[] = [];
    if (ci && functionalGroups && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id,
      );
      const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a;
      if (
        atomFromStruct &&
        !FunctionalGroup.isAtomInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          atomFromStruct,
          sgroups,
          functionalGroups,
          true,
        )
      )
        atomResult.push(atomId);
    }
    if (ci && functionalGroups && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id,
      );
      const bondFromStruct = bondId !== null && struct.bonds.get(bondId)?.b;
      if (
        bondFromStruct &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          bondFromStruct,
          sgroups,
          functionalGroups,
        )
      )
        bondResult.push(bondId);
    }
    if (atomResult.length > 0) {
      for (const id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id,
        );
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId);
        }
      }
      editor.event.removeFG.dispatch({ fgIds: result });
      return;
    } else if (bondResult.length > 0) {
      for (const id of bondResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id,
        );
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId);
        }
      }
      this.editor.event.removeFG.dispatch({ fgIds: result });
      return;
    }
    if (!ci) return;

    const selection = this.editor.selection();

    if (ci.map === 'atoms') {
      const atoms = getSelectedAtoms(selection, molecule);
      const changeAtomPromise = editor.event.elementEdit.dispatch(atoms);
      updateSelectedAtoms({
        atoms: selection?.atoms || [],
        editor,
        changeAtomPromise,
      });
    } else if (ci.map === 'bonds') {
      const bonds = getSelectedBonds(selection, molecule);
      const changeBondPromise = editor.event.bondEdit.dispatch(bonds);
      updateSelectedBonds({
        bonds: selection?.bonds || [],
        changeBondPromise,
        editor,
      });
    } else if (
      (ci.map === 'sgroups' &&
        !FunctionalGroup.isFunctionalGroup(molecule.sgroups.get(ci.id))) ||
      ci.map === 'sgroupData'
    ) {
      editor.selection(closestToSel(ci));
      SGroupTool.sgroupDialog(editor, ci.id);
    } else if (ci.map === 'texts') {
      editor.selection(closestToSel(ci));
      const text = molecule.texts.get(ci.id);
      const dialog = editor.event.elementEdit.dispatch({
        ...text,
        type: 'text',
      });

      dialog
        .then(({ content }) => {
          if (!content) {
            editor.update(fromTextDeletion(struct, ci.id));
          } else if (content !== text?.content) {
            editor.update(fromTextUpdating(struct, ci.id, content));
          }
        })
        .catch((e) => {
          KetcherLogger.error('select.ts::SelectTool::dblclick', e);
        });
    }
    return true;
  }

  mouseleave() {
    if (this.dragCtx && this.dragCtx.stopTapping) this.dragCtx.stopTapping();

    if (this.dragCtx && this.dragCtx.action) {
      const action = this.dragCtx.action;
      this.editor.update(action);
    }
    onSelectionLeave(this.editor, this.#lassoHelper);

    delete this.dragCtx;

    this.editor.hover(null);
  }

  private isDraggingStructureOnSaltOrSolvent(
    dragCtx,
    sgroups: Map<number, ReSGroup>,
  ) {
    let isDraggingOnSaltOrSolventAtom;
    let isDraggingOnSaltOrSolventBond;
    if (dragCtx?.mergeItems) {
      const mergeAtoms = Array.from(dragCtx.mergeItems.atoms.values());
      const mergeBonds = Array.from(dragCtx.mergeItems.bonds.values());
      const sgroupsOnCanvas = Array.from(sgroups.values())
        .map(({ item }) => item)
        .filter((sgroup): sgroup is SGroup => !!sgroup);
      isDraggingOnSaltOrSolventAtom = mergeAtoms.some((atomId) =>
        SGroup.isAtomInSaltOrSolvent(atomId as number, sgroupsOnCanvas),
      );
      isDraggingOnSaltOrSolventBond = mergeBonds.some((bondId) =>
        SGroup.isBondInSaltOrSolvent(bondId as number, sgroupsOnCanvas),
      );
    }
    return isDraggingOnSaltOrSolventAtom || isDraggingOnSaltOrSolventBond;
  }

  private isCloseToEdgeOfCanvas(event: PointerEvent) {
    const EDGE_OFFSET = 50;
    const mousePositionInCanvas = CoordinateTransformation.pageToCanvas(
      event,
      this.editor.render,
    );
    const viewBox = this.editor.render.viewBox;

    const closeEdges: Direction[] = [];
    let isClose = false;

    if (mousePositionInCanvas.x < viewBox.minX + EDGE_OFFSET) {
      isClose = true;
      closeEdges.push(Direction.LEFT);
    }
    if (mousePositionInCanvas.x > viewBox.minX + viewBox.width - EDGE_OFFSET) {
      isClose = true;
      closeEdges.push(Direction.RIGHT);
    }
    if (mousePositionInCanvas.y < viewBox.minY + EDGE_OFFSET) {
      isClose = true;
      closeEdges.push(Direction.TOP);
    }
    if (mousePositionInCanvas.y > viewBox.minY + viewBox.height - EDGE_OFFSET) {
      isClose = true;
      closeEdges.push(Direction.DOWN);
    }

    return [isClose, closeEdges] as const;
  }

  private handleMoveCloseToEdgeOfCanvas() {
    const event = this.previousMouseMoveEvent;
    if (!event) {
      return;
    }

    const [isCloseToSomeEdgeOfScreen, closeEdges] =
      this.isCloseToEdgeOfCanvas(event);

    if (isCloseToSomeEdgeOfScreen) {
      this.mousemove(event);
      this.moveViewBox(closeEdges);
    }

    if (this.isMouseDown) {
      requestAnimationFrame(() => this.handleMoveCloseToEdgeOfCanvas());
    }
  }

  private moveViewBox(closeEdges: Direction[]) {
    const MOVE_STEP = 5;
    const render = this.editor.render;
    if (closeEdges.includes(Direction.RIGHT)) {
      render.setViewBox((prev) => ({
        ...prev,
        minX: prev.minX + MOVE_STEP,
      }));
    }
    if (closeEdges.includes(Direction.LEFT)) {
      render.setViewBox((prev) => ({
        ...prev,
        minX: prev.minX - MOVE_STEP,
      }));
    }
    if (closeEdges.includes(Direction.DOWN)) {
      render.setViewBox((prev) => ({
        ...prev,
        minY: prev.minY + MOVE_STEP,
      }));
    }
    if (closeEdges.includes(Direction.TOP)) {
      render.setViewBox((prev) => ({
        ...prev,
        minY: prev.minY - MOVE_STEP,
      }));
    }
  }
}

function closestToSel(ci) {
  const res = {};
  res[ci.map] = [ci.id];
  return res;
}

function isSelected(selection, item) {
  return (
    selection && selection[item.map] && selection[item.map].includes(item.id)
  );
}

function preventSaltAndSolventsMerge(
  struct: ReStruct,
  dragCtx,
  editor: Editor,
) {
  const action = dragCtx.action
    ? fromItemsFuse(struct, null).mergeWith(dragCtx.action)
    : fromItemsFuse(struct, null);
  editor.hover(null);
  if (dragCtx.mergeItems) {
    editor.selection(null);
  }
  editor.update(action);
  editor.event.message.dispatch({
    info: false,
  });
}

function getMapsForClosestItem(selectFragment: boolean) {
  return [
    'sgroups',
    'functionalGroups',
    'sgroupData',
    'rgroups',
    'rgroupAttachmentPoints',
    'rxnArrows',
    MULTITAIL_ARROW_KEY,
    'rxnPluses',
    'enhancedFlags',
    'simpleObjects',
    'texts',
    IMAGE_KEY,
    ...(selectFragment ? ['frags'] : ['atoms', 'bonds']),
  ];
}

function getResizingProps(
  editor: Editor,
  dragCtx,
  event,
): [ReStruct, number, Vec2, Vec2, any] {
  const current = editor.render.page2obj(event);
  const diff = current.sub(dragCtx.xy0);
  return [editor.render.ctab, dragCtx.item.id, diff, current, dragCtx.item.ref];
}

export default SelectTool;
