/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var ReObject = require('./reobject');
var scale = require('../../util/scale');

function ReDataSGroupData(sgroup) {
	this.init('sgroupData');

	this.sgroup = sgroup;
}

ReDataSGroupData.prototype = new ReObject();
ReDataSGroupData.isSelectable = function () {
	return true;
};

ReDataSGroupData.prototype.highlightPath = function (render) {
	var box = this.sgroup.dataArea;
	var p0 = scale.obj2scaled(box.p0, render.options);
	var sz = scale.obj2scaled(box.p1, render.options).sub(p0);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReDataSGroupData.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReDataSGroupData.prototype.makeSelectionPlate = function (restruct, paper, styles) { // TODO [MK] review parameters
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReDataSGroupData;
