var ReObject = require('./reobject');
var Box2Abs = require('../../util/box2abs');
var Vec2 = require('../../util/vec2');
var draw = require('../draw');
var util = require('../../util');
var scale = require('../../util/scale');

function ReRxnArrow(/* chem.RxnArrow*/arrow) {
	this.init('rxnArrow');

	this.item = arrow;
}
ReRxnArrow.prototype = new ReObject();
ReRxnArrow.isSelectable = function () {
	return true;
};

ReRxnArrow.prototype.highlightPath = function (render) {
	var p = scale.obj2scaled(this.item.pp, render.options);
	var s = render.options.scale;
	return render.paper.rect(p.x - s, p.y - s / 4, 2 * s, s / 2, s / 8); // eslint-disable-line no-mixed-operators
};

ReRxnArrow.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReRxnArrow.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

ReRxnArrow.prototype.show = function (restruct, id, options) {
	var render = restruct.render;
	var centre = scale.obj2scaled(this.item.pp, options);
	var path = draw.arrow(render.paper,
		new Vec2(centre.x - render.options.scale, centre.y),
		new Vec2(centre.x + render.options.scale, centre.y),
		render.options);
	this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
	var offset = render.options.offset;
	if (offset != null)
		path.translateAbs(offset.x, offset.y);
};

module.exports = ReRxnArrow;
