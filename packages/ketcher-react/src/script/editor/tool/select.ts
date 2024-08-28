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
  SGroup,
  fromItemsFuse,
  fromMultipleMove,
  fromTextDeletion,
  fromTextUpdating,
  getHoverToFuse,
  FunctionalGroup,
  fromSimpleObjectResizing,
  fromArrowResizing,
  ReStruct,
  ReSGroup,
  Vec2,
  Atom,
  Bond,
  getItemsToFuse,
  vectorUtils,
  KetcherLogger,
  CoordinateTransformation,
  IMAGE_KEY,
  imageReferencePositionToCursor,
  ImageReferencePositionInfo,
  fromImageResize,
  MULTITAIL_ARROW_KEY,
} from 'ketcher-core';

import LassoHelper from './helper/lasso';
import {
  isBondingWithMacroMolecule,
  isMergingToMacroMolecule,
} from './helper/isMacroMolecule';
import { atomLongtapEvent } from './atom';
import SGroupTool from './sgroup';
import { xor } from 'lodash/fp';
import { Editor } from '../Editor';
import { dropAndMerge } from './helper/dropAndMerge';
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import { updateSelectedBonds } from 'src/script/ui/state/modal/bonds';
import { filterNotInContractedSGroup } from './helper/filterNotInCollapsedSGroup';
import { Tool } from './Tool';
import { handleMovingPosibilityCursor } from '../utils';

type SelectMode = 'lasso' | 'fragment' | 'rectangle';

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
  private previousMouseMoveEvent?: MouseEvent;
  isMouseDown = false;
  readonly isMoving = false;

  constructor(editor: Editor, mode: SelectMode) {
    this.editor = editor;
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

  mousedown(event) {
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

    this.dragCtx = {
      item: ci,
      xy0: rnd.page2obj(event),
    };

    if (!ci || ci.map === 'atoms') {
      atomLongtapEvent(this, rnd);
    }

    if (!ci) {
      //  ci.type == 'Canvas'
      if (!event.shiftKey) this.editor.selection(null);
      delete this.dragCtx.item;
      if (!this.#lassoHelper.fragment) this.#lassoHelper.begin(event);
      return true;
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

  mousemove(event) {
    this.previousMouseMoveEvent = event;
    const editor = this.editor;
    const rnd = editor.render;
    const restruct = editor.render.ctab;
    const dragCtx = this.dragCtx;
    if (dragCtx?.stopTapping) dragCtx.stopTapping();

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

      /* handle rxnArrows */
      if (dragCtx.item.map === 'rxnArrows' && dragCtx.item.ref) {
        if (dragCtx?.action) dragCtx.action.perform(rnd.ctab);
        const props = getResizingProps(editor, dragCtx, event);
        this.updateArrowResizingState(dragCtx.item.id, true);
        const isSnappingEnabled = !event.ctrlKey;
        dragCtx.action = fromArrowResizing(...props, isSnappingEnabled);
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

    if (this.#lassoHelper.running()) {
      const sel = this.#lassoHelper.addPoint(event);

      editor.selection(
        !event.shiftKey ? sel : selMerge(sel, editor.selection(), false),
      );
      return true;
    }

    const maps = getMapsForClosestItem(
      this.#lassoHelper.fragment || event.ctrlKey,
    );
    const item = editor.findItem(event, maps, null);
    editor.hover(item, null, event);
    if (item?.map === IMAGE_KEY && item.ref) {
      const referencePositionInfo = item.ref as ImageReferencePositionInfo;
      handleMovingPosibilityCursor(
        item,
        this.editor.render.paper.canvas,
        // Casting is safe because we've checked for item map
        imageReferencePositionToCursor[referencePositionInfo.name],
      );
    } else {
      handleMovingPosibilityCursor(
        item,
        this.editor.render.paper.canvas,
        this.editor.render.options.movingStyle.cursor as string,
      );
    }

    return true;
  }

  mouseup(event) {
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
    const newSelected = getNewSelectedItems(editor, selectedSgroups);

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

    if (this.dragCtx?.item) {
      if (this.dragCtx.item.map === 'rxnArrows') {
        this.updateArrowResizingState(this.dragCtx.item.id, false);
        this.editor.update(true);
      }
      if (!isMergingToMacroMolecule(this.editor, this.dragCtx)) {
        dropAndMerge(editor, this.dragCtx.mergeItems, this.dragCtx.action);
      }
      delete this.dragCtx;
    } else if (this.#lassoHelper.running()) {
      // TODO it catches more events than needed, to be re-factored
      this.selectElementsOnCanvas(newSelected, editor, event);
    } else if (this.#lassoHelper.fragment) {
      if (
        !event.shiftKey &&
        this.editor.render.clientArea.contains(event.target)
      )
        editor.selection(null);
    }
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
    if (this.#lassoHelper.running())
      this.editor.selection(this.#lassoHelper.end());

    delete this.dragCtx;

    this.editor.hover(null);
  }

  private selectElementsOnCanvas(
    elements: { atoms: number[]; bonds: number[] },
    editor: Editor,
    event,
  ) {
    const sel =
      elements.atoms.length > 0
        ? selMerge(this.#lassoHelper.end(), elements, false)
        : this.#lassoHelper.end();
    editor.selection(
      !event.shiftKey ? sel : selMerge(sel, editor.selection(), false),
    );
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

  private updateArrowResizingState(itemId: number, isResizing: boolean) {
    const reArrow = this.editor.render.ctab.rxnArrows.get(itemId);
    if (reArrow) {
      reArrow.isResizing = isResizing;
    }
  }

  private isCloseToEdgeOfCanvas(event: MouseEvent) {
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

// TODO: deep-merge?
export function selMerge(selection, add, reversible: boolean) {
  if (add) {
    Object.keys(add).forEach((item) => {
      if (!selection[item]) selection[item] = add[item].slice();
      else selection[item] = uniqArray(selection[item], add[item], reversible);
    });
  }
  return selection;
}

function isSelected(selection, item) {
  return (
    selection && selection[item.map] && selection[item.map].includes(item.id)
  );
}

export function getSelectedAtoms(selection, molecule) {
  if (selection?.atoms) {
    return mapAtomIdsToAtoms(selection?.atoms, molecule);
  }
  return [];
}

export function getSelectedBonds(selection, molecule) {
  if (selection?.bonds) {
    return mapBondIdsToBonds(selection?.bonds, molecule);
  }
  return [];
}

export function mapAtomIdsToAtoms(atomsIds: number[], molecule): Atom[] {
  return atomsIds.map((atomId) => {
    const atomOrReAtom = molecule.atoms.get(atomId);
    return atomOrReAtom.a || atomOrReAtom;
  });
}

export function mapBondIdsToBonds(bondsIds: number[], molecule): Bond[] {
  return bondsIds.map((bondId) => {
    const bondOrReBond = molecule.bonds.get(bondId);
    return bondOrReBond?.b || bondOrReBond;
  });
}

function uniqArray(dest, add, reversible: boolean) {
  return add.reduce((_, item) => {
    if (reversible) dest = xor(dest, [item]);
    else if (!dest.includes(item)) dest.push(item);
    return dest;
  }, []);
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
    'rxnPluses',
    'enhancedFlags',
    'simpleObjects',
    'texts',
    IMAGE_KEY,
    MULTITAIL_ARROW_KEY,
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

function getNewSelectedItems(editor: Editor, selectedSgroups: number[]) {
  const newSelected: Record<'atoms' | 'bonds', number[]> = {
    atoms: [],
    bonds: [],
  };

  for (const sgId of selectedSgroups) {
    const sgroup = editor.render.ctab.sgroups.get(sgId);
    if (sgroup && !sgroup.item?.isSuperatomWithoutLabel) {
      const sgroupAtoms = SGroup.getAtoms(editor.struct(), sgroup.item);
      const sgroupBonds = SGroup.getBonds(editor.struct(), sgroup.item);
      newSelected.atoms.push(...sgroupAtoms);
      newSelected.bonds.push(...sgroupBonds);
    }
  }

  return newSelected;
}

export default SelectTool;
