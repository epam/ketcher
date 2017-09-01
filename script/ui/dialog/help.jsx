/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

function Help(props) {
	return (
		<Dialog title="Help"
				className="help" params={props}
				buttons={["Close"]}>
			<iframe className="help" src="doc/help.html"></iframe>
		</Dialog>
	);
}

export default Help;
