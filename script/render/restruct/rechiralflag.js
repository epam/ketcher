var Box2Abs = require('../../util/box2abs');
var scale = require('../../util/scale');
var ReObject = require('./reobject');

function ReChiralFlag(pos) {
	this.init('chiralFlag');

	this.pp = pos;
}
ReChiralFlag.prototype = new ReObject();
ReChiralFlag.isSelectable = function () {
	return true;
};

ReChiralFlag.prototype.highlightPath = function (render) {
	var box = Box2Abs.fromRelBox(this.path.getBBox());
	var sz = box.p1.sub(box.p0);
	var p0 = box.p0.sub(render.offset);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReChiralFlag.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReChiralFlag.prototype.makeSelectionPlate = function (restruct, paper, options) {
	return this.highlightPath(restruct.render).attr(options.selectionStyle);
};

ReChiralFlag.prototype.draw = function (render) {
	var paper = render.paper;
	var options = render.options;
	var ps = scale.obj2scaled(this.pp, options);
	this.path = paper.text(ps.x, ps.y, 'Chiral')
		.attr({
			'font': options.font,
			'font-size': options.fontsz,
			'fill': '#000'
		});
	render.ctab.addReObjectPath('data', this.visel, this.path, null, true);
};

module.exports = ReChiralFlag;
