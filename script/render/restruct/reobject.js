/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var Visel = require('./visel');
var scale = require('../../util/scale');

function ReObject() {
}

ReObject.prototype.init = function (viselType) {
	this.visel = new Visel(viselType);

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;
};

// returns the bounding box of a ReObject in the object coordinates
ReObject.prototype.getVBoxObj = function (render) {
	var vbox = this.visel.boundingBox;
	if (vbox === null)
		return null;
	if (render.options.offset)
		vbox = vbox.translate(render.options.offset.negated());
	return vbox.transform(scale.scaled2obj, render.options);
};

ReObject.prototype.setHighlight = function (highLight, render) { // TODO render should be field
	if (highLight) {
		var noredraw = 'highlighting' in this && this.highlighting != null;// && !this.highlighting.removed;
		if (noredraw) {
			if (this.highlighting.type == 'set')
				noredraw = !this.highlighting[0].removed;
			 else
				noredraw = !this.highlighting.removed;
		}
		if (noredraw) {
			this.highlighting.show();
		} else {
			render.paper.setStart();
			this.drawHighlight(render);
			this.highlighting = render.paper.setFinish();
		}
	} else
		if (this.highlighting) {
			this.highlighting.hide();
		}

	this.highlight = highLight;
};


ReObject.prototype.drawHighlight = function () {
	console.assert('ReObject.drawHighlight is not overridden'); // eslint-disable-line no-console
};

ReObject.prototype.makeSelectionPlate = function () {
	console.assert(null, 'ReObject.makeSelectionPlate is not overridden'); // eslint-disable-line no-console
};

module.exports = ReObject;
