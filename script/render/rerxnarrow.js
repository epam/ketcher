var Visel = require('./visel');          
var ReObject = require('./reobject');

var ReRxnArrow = function (/*chem.RxnArrow*/arrow)
{
	this.init(Visel.TYPE.ARROW);

	this.item = arrow;
};
ReRxnArrow.prototype = new ReObject();
ReRxnArrow.isSelectable = function () { return true; }

ReRxnArrow.findClosest = function (render, p) {
	var minDist;
	var ret;

	render.ctab.rxnArrows.each(function (id, arrow) {
		var pos = arrow.item.pp;
		if (Math.abs(p.x - pos.x) < 1.0) {
			var dist = Math.abs(p.y - pos.y);
			if (dist < 0.3 && (!ret || dist < minDist)) {
				minDist = dist;
				ret = {'id': id, 'dist': minDist};
			}
		}
	});
	return ret;
};

ReRxnArrow.prototype.highlightPath = function (render) {
	var p = render.ps(this.item.pp);
	var s = render.settings.scaleFactor;
	return render.paper.rect(p.x - s, p.y - s / 4, 2 * s, s / 2, s / 8);
};

ReRxnArrow.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.styles.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReRxnArrow.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReRxnArrow