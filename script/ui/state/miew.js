/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { openDialog, load } from './';
import * as structFormat from '../structformat';

export function miewAction(dispatch, getState) {
	const editor = getState().editor;
	const server = getState().server;
	let convert = structFormat.toString(editor.struct(),
		'cml', server);
	convert.then(function (cml) {
		openDialog(dispatch, 'miew', {
			structStr: cml
		}).then(function (res) {
			if (res.structStr)
				dispatch(load(res.structStr));
		});
	});
}
