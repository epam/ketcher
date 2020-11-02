/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import { debounce } from 'lodash/fp';

import element from '../../../chem/element';
import { fromBond, toBond, fromSgroup, toSgroup, fromElement, toElement } from '../../data/convert/structconv';
import acts from '../../action';

import { openDialog } from '../modal';
import { serverCall } from '../server';

export default function initEditor(dispatch, getState) {
	const updateAction = debounce(100, () => dispatch({ type: 'UPDATE' }));
	const sleep = time => new Promise(resolve => setTimeout(resolve, time));

	function resetToSelect(dispatch, getState) { // eslint-disable-line no-shadow
		const state = getState();
		const activeTool = state.actionState.activeTool.tool;
		if (activeTool === 'select') return;
		const selectMode = state.toolbar.visibleTools.select;
		const resetOption = state.options.settings.resetToSelect;
		if (resetOption === true || resetOption === activeTool) // example: 'paste'
			dispatch({ type: 'ACTION', action: acts[selectMode].action });
		else
			updateAction();
	}

	return {
		onInit: (editor) => {
			dispatch({ type: 'INIT', editor });
		},
		onChange: (action) => {
			if (action === undefined)
				sleep(0).then(() => dispatch(resetToSelect)); // new tool in reducer
			else
				dispatch(resetToSelect);
		},
		onSelectionChange: () => {
			updateAction();
		},
		onElementEdit: (selem) => {
			const elem = fromElement(selem);
			let dlg = null;
			if (element.map[elem.label]) {
				dlg = openDialog(dispatch, 'atomProps', elem);
			} else if (Object.keys(elem).length === 1 && 'ap' in elem) {
				dlg = openDialog(dispatch, 'attachmentPoints', elem.ap)
					.then(res => ({ ap: res }));
			} else if (elem.type === 'list' || elem.type === 'not-list') {
				dlg = openDialog(dispatch, 'period-table', elem);
			} else if (elem.type === 'rlabel') {
				const rgroups = getState().editor.struct().rgroups;
				const params = {
					type: 'atom',
					values: elem.values,
					disabledIds: Array.from(rgroups.entries())
						.reduce((acc, [rgid, rg]) => {
							if (rg.frags.has(elem.fragId))
								acc.push(rgid);

							return acc;
						}, [])
				};
				dlg = openDialog(dispatch, 'rgroup', params).then(res => ({
					values: res.values,
					type: 'rlabel'
				}));
			} else {
				dlg = openDialog(dispatch, 'period-table', elem);
			}

			return dlg.then(toElement);
		},
		onQuickEdit: atom => openDialog(dispatch, 'labelEdit', atom),
		onBondEdit: bond => openDialog(dispatch, 'bondProps', fromBond(bond))
			.then(toBond),
		onRgroupEdit: (rgroup) => {
			const struct = getState().editor.struct();

			if (Object.keys(rgroup).length > 2) {
				const rgroupLabels = Array.from(struct.rgroups.keys());
				if (!rgroup.range) rgroup.range = '>0';

				return openDialog(dispatch, 'rgroupLogic',
					Object.assign({ rgroupLabels }, rgroup));
			}

			const disabledIds = Array.from(struct.atoms.values())
				.reduce((acc, atom) => {
					if (atom.fragment === rgroup.fragId && atom.rglabel !== null)
						return acc.concat(fromElement(atom).values);

					return acc;
				}, []);
			const params = {
				type: 'fragment',
				values: [rgroup.label],
				disabledIds
			};
			return openDialog(dispatch, 'rgroup', params).then(res => ({ label: res.values[0] }));
		},
		onSgroupEdit: sgroup => sleep(0)		// huck to open dialog after dispatch sgroup tool action
			.then(() => openDialog(dispatch, 'sgroup', fromSgroup(sgroup)))
			.then(toSgroup),
		onSdataEdit: sgroup => sleep(0)
			.then(() => openDialog(dispatch, sgroup.type === 'DAT' ? 'sdata' : 'sgroup', fromSgroup(sgroup)))
			.then(toSgroup),
		onMessage: (msg) => {
			if (msg.error)
				alert(msg.error); // eslint-disable-line no-undef
		},
		onAromatizeStruct: (struct) => {
			const state = getState();
			const serverOpts = state.options.getServerSettings();
			return serverCall(state.editor, state.server, 'aromatize', serverOpts, struct);
		},
		onDearomatizeStruct: (struct) => {
			const state = getState();
			const serverOpts = state.options.getServerSettings();
			return serverCall(state.editor, state.server, 'dearomatize', serverOpts, struct);
		},
		onMouseDown: () => {
			updateAction();
		}
	};
}
