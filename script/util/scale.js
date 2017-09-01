/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

function scaled2obj(v, options) {
	return v.scaled(1 / options.scale);
}

function obj2scaled(v, options) {
	return v.scaled(options.scale);
}

module.exports = {
	scaled2obj: scaled2obj,
	obj2scaled: obj2scaled
};

