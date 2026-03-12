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
  Action,
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
  ImageReferencePositionInfo,
  KetcherLogger,
  MULTITAIL_ARROW_KEY,
  isControlKey,
  ReSGroup,
  ReStruct,
  SGroup,
  Vec2,
  vectorUtils,
} from 'ketcher-core';

import LassoHelper from '../helper/lasso';
import { isMergingToMacroMolecule } from '../helper/isMacroMolecule';
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
import { ClosestItemWithMap } from '../../shared/closest.types';
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
import { createCopyOfSelected } from 'src/script/ui/action/createCopyOfSelected';

enum Direction {
  LEFT,
  TOP,
  RIGHT,
  DOWN,
}

type MergeItems = ReturnType<typeof getItemsToFuse>;

type DragContext = {
  action?: Action | null;
  copyAction?: Action;
  mergeItems?: MergeItems;
  stopTapping?: () => void;
  item?: ClosestItemWithMap<unknown>;
  xy0?: Vec2;
  originalPosition?: Vec2;
  closestItem?: ReactionArrowClosestItem | MultitailArrowClosestItem;
} | null;

type SimpleObjectSelectionDragContext = {
  item: ClosestItemWithMap<Vec2, 'simpleObjects'>;
  xy0: Vec2;
};

class SelectTool implements Tool {
  readonly #mode: SelectMode;
  readonly #lassoHelper: LassoHelper;
  private readonly editor: Editor;
  private dragCtx?: DragContext;
  private previousMouseMoveEvent?: PointerEvent;
  isMouseDown = false;
  isReadyForCopy = false;
  isCopied = false;
  readonly isMoving = false;
  private readonly multitailArrowMoveTool: ArrowMoveTool<MultitailArrowClosestItem>;
  private readonly reactionArrowMoveTool: ArrowMoveTool<ReactionArrowClosestItem>;

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
      this.#lassoHelper.fragment || event.altKey,
    );
    const ci = this.editor.findItem(event, map, null);

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
      return;
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

    if (!ci || (ci.map === 'atoms' && !event.ctrlKey)) {
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
      if (isSelected(selection, ci)) return;
    }

    if (event.shiftKey) {
      this.editor.selection(selMerge(sel, selection, true));
    } else {
      this.editor.selection(null);
      this.editor.selection(isSelected(selection, ci) ? selection : sel);
    }

    this.handleMoveCloseToEdgeOfCanvas();

    this.isReadyForCopy = false;
    this.isCopied = false;
    if (isControlKey(event) && this.dragCtx) {
      this.isReadyForCopy = true;
    }
  }

  mousemove(event: PointerEvent) {
    this.previousMouseMoveEvent = event;
    const editor = this.editor;
    const rnd = editor.render;
    const restruct = editor.render.ctab;
    const dragCtx = this.dragCtx;

    if (this.isReadyForCopy && !this.isCopied) {
      const point = CoordinateTransformation.pageToModel(event, rnd);
      const { action, items } = createCopyOfSelected(editor, point);
      editor.selection(items);

      if (dragCtx) {
        dragCtx.copyAction = action;
      }
      this.isCopied = true;
      return;
    }

    if (dragCtx?.stopTapping) dragCtx.stopTapping();

    if (dragCtx?.closestItem) {
      const arrowDragCtx = dragCtx as NonNullable<DragContext> & {
        closestItem: ReactionArrowClosestItem | MultitailArrowClosestItem;
      };
      if (dragCtx.action) {
        dragCtx.action.perform(restruct);
      }

      if (arrowDragCtx.closestItem.map === 'rxnArrows') {
        arrowDragCtx.action = this.reactionArrowMoveTool.mousemove(
          event,
          arrowDragCtx as ReactionArrowMoveTool['mousemove'] extends (
            event: PointerEvent,
            dragContext: infer T,
          ) => Action
            ? T
            : never,
        );
      } else if (arrowDragCtx.closestItem.map === MULTITAIL_ARROW_KEY) {
        arrowDragCtx.action = this.multitailArrowMoveTool.mousemove(
          event,
          arrowDragCtx as MultitailArrowMoveTool['mousemove'] extends (
            event: PointerEvent,
            dragContext: infer T,
          ) => Action
            ? T
            : never,
        );
      }
      if (dragCtx.action) {
        editor.update(dragCtx.action, true);
        return true;
      }
    }

    if (dragCtx?.item) {
      const selectionDragCtx = dragCtx as NonNullable<DragContext> & {
        item: ClosestItemWithMap<unknown>;
        xy0: Vec2;
      };
      const atoms = restruct.molecule.atoms;
      const selection = editor.selection();

      /* handle atoms */
      const shouldDisplayDegree =
        selectionDragCtx.item.map === 'atoms' &&
        atoms?.get(selectionDragCtx.item.id)?.neighbors.length === 1 &&
        selection?.atoms?.length === 1 &&
        !selection.bonds;
      if (shouldDisplayDegree) {
        // moving selected objects
        const pos = CoordinateTransformation.pageToModel(event, rnd);
        const angle = vectorUtils.calcAngle(selectionDragCtx.xy0, pos);
        const degrees = vectorUtils.degrees(angle);
        editor.event.message.dispatch({ info: degrees + 'º' });
      }
      /* end */

      /* handle image resize */
      if (
        selectionDragCtx.item.map === IMAGE_KEY &&
        selectionDragCtx.item.ref
      ) {
        if (selectionDragCtx.action) selectionDragCtx.action.perform(rnd.ctab);
        const position = CoordinateTransformation.pageToModel(event, rnd);
        selectionDragCtx.action = fromImageResize(
          rnd.ctab,
          selectionDragCtx.item.id,
          position,
          selectionDragCtx.item.ref as ImageReferencePositionInfo,
        );
        editor.update(selectionDragCtx.action, true);
        return true;
      }
      /* end + fullstop */

      /* handle simpleObjects */
      if (
        selectionDragCtx.item.map === 'simpleObjects' &&
        selectionDragCtx.item.ref
      ) {
        if (selectionDragCtx.action) selectionDragCtx.action.perform(rnd.ctab);
        const props = getResizingProps(
          editor,
          selectionDragCtx as SimpleObjectSelectionDragContext,
          event,
        );
        selectionDragCtx.action = fromSimpleObjectResizing(
          ...props,
          event.shiftKey,
        );
        editor.update(selectionDragCtx.action, true);
        return true;
      }
      /* end + fullstop */

      /* handle functionalGroups */
      if (
        selectionDragCtx.item.map === 'functionalGroups' &&
        !selectionDragCtx.action
      ) {
        editor.event.showInfo.dispatch(null);
      }
      /* end */

      if (selectionDragCtx.action) {
        selectionDragCtx.action.perform(restruct);
      }

      const expSel = editor.explicitSelected();
      selectionDragCtx.action = fromMultipleMove(
        restruct,
        expSel,
        CoordinateTransformation.pageToModel(event, editor.render).sub(
          selectionDragCtx.xy0,
        ),
      );

      const visibleSelectedItems = filterNotInContractedSGroup(
        expSel,
        this.editor.struct(),
      );
      selectionDragCtx.mergeItems = getItemsToFuse(
        editor,
        visibleSelectedItems,
      );
      editor.hover(getHoverToFuse(selectionDragCtx.mergeItems));

      editor.update(selectionDragCtx.action, true);
    } else {
      const isSelectionRunning = onSelectionMove(
        event,
        this.editor,
        this.#lassoHelper,
      );
      if (!isSelectionRunning) {
        const maps = getMapsForClosestItem(
          this.#lassoHelper.fragment || event.altKey,
        );
        const item = editor.findItem(event, maps, null);
        editor.hover(item, null, event);
        handleMovingPosibilityCursor(
          item,
          this.editor.render.paper.canvas,
          getItemCursor(this.editor.render, item),
        );
      }
    }

    return true;
  }

  mouseup(event: PointerEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.isMouseDown = false;
    this.isReadyForCopy = false;

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
      const arrowDragCtx = this.dragCtx as NonNullable<DragContext> & {
        closestItem: ReactionArrowClosestItem | MultitailArrowClosestItem;
      };
      if (arrowDragCtx.closestItem.map === 'rxnArrows') {
        arrowDragCtx.action = this.reactionArrowMoveTool.mouseup(
          event,
          arrowDragCtx as ReactionArrowMoveTool['mouseup'] extends (
            event: PointerEvent,
            dragContext: infer T,
          ) => Action | null
            ? T
            : never,
        );
      } else if (arrowDragCtx.closestItem.map === MULTITAIL_ARROW_KEY) {
        arrowDragCtx.action = this.multitailArrowMoveTool.mouseup(
          event,
          arrowDragCtx as MultitailArrowMoveTool['mouseup'] extends (
            event: PointerEvent,
            dragContext: infer T,
          ) => Action | null
            ? T
            : never,
        );
      }
      if (arrowDragCtx.action) {
        this.editor.update(arrowDragCtx.action);
        this.editor.update(true);
      }
    }

    if (this.dragCtx?.item) {
      if (!isMergingToMacroMolecule(this.editor, this.dragCtx)) {
        dropAndMerge(
          editor,
          this.dragCtx.mergeItems,
          this.dragCtx.action ?? undefined,
          this.dragCtx.copyAction,
        );
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

    const atomResult: number[] = [];
    const bondResult: number[] = [];
    const result: number[] = [];
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
    if (this.dragCtx?.stopTapping) this.dragCtx.stopTapping();

    if (this.dragCtx?.action) {
      const action = this.dragCtx.action;
      this.editor.update(action);
    }
    onSelectionLeave(this.editor, this.#lassoHelper);

    delete this.dragCtx;

    this.editor.hover(null);
  }

  private isDraggingStructureOnSaltOrSolvent(
    dragCtx: Pick<NonNullable<DragContext>, 'mergeItems'> | null | undefined,
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
  return selection?.[item.map]?.includes(item.id) ?? false;
}

function preventSaltAndSolventsMerge(
  struct: ReStruct,
  dragCtx: Pick<NonNullable<DragContext>, 'action' | 'mergeItems'>,
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
  dragCtx: SimpleObjectSelectionDragContext,
  event: PointerEvent,
): [
  ReStruct,
  number,
  Vec2,
  Vec2,
  NonNullable<SimpleObjectSelectionDragContext['item']['ref']>,
] {
  const current = CoordinateTransformation.pageToModel(event, editor.render);
  const diff = current.sub(dragCtx.xy0);
  return [
    editor.render.ctab,
    dragCtx.item.id,
    diff,
    current,
    dragCtx.item.ref as NonNullable<
      SimpleObjectSelectionDragContext['item']['ref']
    >,
  ];
}

export default SelectTool;
