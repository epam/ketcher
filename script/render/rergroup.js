var Box2Abs = require('../util/box2abs');
var Vec2 = require('../util/vec2');
var util = require('../util');
var draw = require('./draw');

var ReObject = require('./reobject');

var BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);

function ReRGroup(/* Struct.RGroup*/rgroup) {
	this.init('rgroup');

	this.labelBox = null;
	this.item = rgroup;
}
ReRGroup.prototype = new ReObject();
ReRGroup.isSelectable = function () {
	return false;
};

ReRGroup.prototype.getAtoms = function (render) {
	var ret = [];
	this.item.frags.each(function (fnum, fid) {
		ret = ret.concat(render.ctab.frags.get(fid).fragGetAtoms(render, fid));
	});
	return ret;
};

ReRGroup.prototype.getBonds = function (render) {
	var ret = [];
	this.item.frags.each(function (fnum, fid) {
		ret = ret.concat(render.ctab.frags.get(fid).fragGetBonds(render, fid));
	});
	return ret;
};

ReRGroup.prototype.calcBBox = function (render) {
	var ret;
	this.item.frags.each(function (fnum, fid) {
		var bbf = render.ctab.frags.get(fid).calcBBox(render.ctab, fid, render);
		if (bbf)
			ret = (ret ? Box2Abs.union(ret, bbf) : bbf);
	});
	ret = ret.extend(BORDER_EXT, BORDER_EXT); // eslint-disable-line no-underscore-dangle
	return ret;
};

function rGroupdrawBrackets(set, render, bb, d) {
	d = render.obj2scaled(d || new Vec2(1, 0));
	var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
	var bracketHeight = bb.p1.y - bb.p0.y;
	var cy = 0.5 * (bb.p1.y + bb.p0.y);

	var leftBracket = draw.bracket(render, d.negated(),
	                               d.negated().rotateSC(1, 0),
	                               render.obj2scaled(new Vec2(bb.p0.x, cy)),
	                               bracketWidth, bracketHeight);

	var rightBracket = draw.bracket(render, d, d.rotateSC(1, 0),
	                                render.obj2scaled(new Vec2(bb.p1.x, cy)),
	                                bracketWidth, bracketHeight);

	return set.push(leftBracket, rightBracket);
}

// TODO need to review parameter list
ReRGroup.prototype.draw = function (render) { // eslint-disable-line max-statements
	var bb = this.calcBBox(render);
	var settings = render.settings;
	if (bb) {
		var ret = { data: [] };
		var p0 = render.obj2scaled(bb.p0);
		var p1 = render.obj2scaled(bb.p1);
		var brackets = render.paper.set();
		rGroupdrawBrackets(brackets, render, bb); // eslint-disable-line new-cap
		ret.data.push(brackets);
		var key = render.ctab.rgroups.keyOf(this);
		var labelSet = render.paper.set();
		var label = render.paper.text(p0.x, (p0.y + p1.y) / 2, 'R' + key + '=')
			.attr({
				'font': settings.font,
				'font-size': settings.fontRLabel,
				'fill': 'black'
			});
		var labelBox = util.relBox(label.getBBox());
		/* eslint-disable no-mixed-operators*/
		label.translateAbs(-labelBox.width / 2 - settings.lineWidth, 0);
		/* eslint-enable no-mixed-operators*/
		labelSet.push(label);
		var logicStyle = {
			'font': settings.font,
			'font-size': settings.fontRLogic,
			'fill': 'black'
		};

		var logic = [];
		// TODO [RB] temporary solution, need to review
		// BEGIN
		/*
		 if (this.item.range.length > 0)
		 logic.push(this.item.range);
		 if (this.item.resth)
		 logic.push("RestH");
		 if (this.item.ifthen > 0)
		 logic.push("IF R" + key.toString() + " THEN R" + this.item.ifthen.toString());
		 */
		logic.push(
			(this.item.ifthen > 0 ? 'IF ' : '') +
			'R' + key.toString() +
			/* eslint-disable no-nested-ternary */
			(this.item.range.length > 0 ?
			this.item.range.startsWith('>') || this.item.range.startsWith('<') || this.item.range.startsWith('=') ?
			this.item.range : '=' + this.item.range : '>0') +
			(this.item.resth ? ' (RestH)' : '') +
			(this.item.ifthen > 0 ? '\nTHEN R' + this.item.ifthen.toString() : '')
			/* eslint-enable no-nested-ternary */
		);
		// END
		/* eslint-disable no-mixed-operators*/
		var shift = labelBox.height / 2 + settings.lineWidth / 2;
		/* eslint-enable no-mixed-operators*/
		for (var i = 0; i < logic.length; ++i) {
			var logicPath = render.paper.text(p0.x, (p0.y + p1.y) / 2, logic[i]).attr(logicStyle);
			var logicBox = util.relBox(logicPath.getBBox());
			shift += logicBox.height / 2;
			/* eslint-disable no-mixed-operators*/
			logicPath.translateAbs(-logicBox.width / 2 - 6 * settings.lineWidth, shift);
			shift += logicBox.height / 2 + settings.lineWidth / 2;
			/* eslint-enable no-mixed-operators*/
			ret.data.push(logicPath);
			labelSet.push(logicPath);
		}
		ret.data.push(label);
		this.labelBox = Box2Abs.fromRelBox(labelSet.getBBox()).transform(render.scaled2obj, render);
		return ret;
	} else { // eslint-disable-line no-else-return
		// TODO abnormal situation, empty fragments must be destroyed by tools
		return {};
	}
};

// TODO need to review parameter list
ReRGroup.prototype._draw = function (render, rgid, attrs) { // eslint-disable-line no-underscore-dangle
	var bb = this.getVBoxObj(render).extend(BORDER_EXT, BORDER_EXT); // eslint-disable-line no-underscore-dangle
	if (bb) {
		var p0 = render.obj2scaled(bb.p0);
		var p1 = render.obj2scaled(bb.p1);
		return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
	}
};

ReRGroup.prototype.drawHighlight = function (render) {
	var rgid = render.ctab.rgroups.keyOf(this);
	if (!Object.isUndefined(rgid)) {
		var ret = this._draw(render, rgid, render.styles.highlightStyle/* { 'fill' : 'red' }*/); // eslint-disable-line no-underscore-dangle
		render.ctab.addReObjectPath('highlighting', this.visel, ret);
		/*
		 this.getAtoms(render).each(function(aid) {
		 render.ctab.atoms.get(aid).drawHighlight(render);
		 }, this);
		 */
		this.item.frags.each(function (fnum, fid) {
			render.ctab.frags.get(fid).drawHighlight(render);
		}, this);
		return ret;
	} else { // eslint-disable-line no-else-return
		// TODO abnormal situation, fragment does not belong to the render
	}
};
module.exports = ReRGroup;
