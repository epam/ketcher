var Visel = require('./visel');
var util = require('../../util');

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
	if (util.isNull(vbox))
		return null;
	if (render.offset)
		vbox = vbox.translate(render.offset.negated());
	return vbox.transform(render.scaled2obj, render);
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
