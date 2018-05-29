import { isEqual } from 'lodash/fp';

import Pile from '../../util/pile';

import Action from '../shared/action';
import { fromStereoAtomMark } from '../actions/atom';
import { fromStereoFlagUpdate } from '../actions/fragment';
import { findStereoAtoms, getUsedStereoLabels } from '../actions/utils';

function EnhancedStereoTool(editor) {
	if (!(this instanceof EnhancedStereoTool)) {
		const selection = editor.selection();
		if (!selection || !selection.atoms) return null;

		const stereoAtoms = findStereoAtoms(editor.struct(), selection.atoms); // Map <aid,stereoLabel>
		if (stereoAtoms.size === 0) return null;

		if (checkSelectionForFragment(editor, selection)) {
			changeFragmentStereoAction(editor, stereoAtoms)
				.then(action => action && editor.update(action));
		} else {
			changeAtomsStereoAction(editor, stereoAtoms)
				.then(action => action && editor.update(action));
		}
	}
}

function changeAtomsStereoAction(editor, stereoAtoms) {
	const struct = editor.struct();
	const restruct = editor.render.ctab;
	const usedStereoLabels = getUsedStereoLabels(struct);

	const res = editor.event.enhancedStereoEdit.dispatch({
		type: 'atoms',
		usedLabels: usedStereoLabels,
		stereoLabel: stereoAtoms.values().next().value
	});
	return res.then((stereoLabel) => {
		const action = new Action();
		stereoAtoms.forEach((label, aid) => {
			if (isEqual(label, stereoLabel)) return;
			action.mergeWith(fromStereoAtomMark(aid, stereoLabel));
		});
		return action.operations.length !== 0 ? action.perform(restruct) : null;
	});
}

function changeFragmentStereoAction(editor, stereoAtoms) {
	const struct = editor.struct();
	const frid = struct.atoms.get(stereoAtoms.keys().next().value).fragment;
	const flag = struct.frags.get(frid).enhancedStereoFlag;

	const res = editor.event.enhancedStereoEdit.dispatch({
		type: 'fragment',
		stereoFlag: flag
	});
	return res.then(({ stereoFlag }) => {
		if (stereoFlag === flag) return null;
		return fromStereoFlagUpdate(editor.render.ctab, frid, stereoFlag);
	});
}

function checkSelectionForFragment(editor, selection) {
	const struct = editor.struct();
	const frid = struct.atoms.get(selection.atoms[0]).fragment;
	const fragAids = new Pile(struct.getFragmentIds(frid));
	const selectionAids = new Pile(selection.atoms);

	return fragAids.equals(selectionAids);
}

export default EnhancedStereoTool;
