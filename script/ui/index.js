/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import app from './app';

function init(opts, apiServer) {
	const ketcherWindow = document.querySelector('[role=application]') || document.body;
	return app(ketcherWindow, opts, apiServer);
}

export default init;
