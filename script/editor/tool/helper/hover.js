function HoverHelper(editorTool) {
	this.editorTool = editorTool;
}

HoverHelper.prototype.hover = function (ci) {
	// TODO add custom highlight style parameter, to be used when fusing atoms, sgroup children highlighting, etc
	var rnd = this.editorTool.editor.render;
	if ('ci' in this && (!ci || this.ci.map != ci.map || this.ci.id != ci.id)) {
		highlightObject(rnd, this.ci, false);
		delete this.ci;
	}
	if (ci && highlightObject(rnd, ci, true))
		this.ci = ci;
};

function highlightObject(render, obj, visible) {
	if (['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'chiralFlags', 'frags', 'rgroups', 'sgroups', 'sgroupData'].indexOf(obj.map) > -1) {
		var item = render.ctab[obj.map].get(obj.id);
		if (item == null)
			return true; // TODO: fix, attempt to highlight a deleted item
		if ((obj.map == 'sgroups' && item.item.type == 'DAT') || obj.map == 'sgroupData') {
			// set highlight for both the group and the data item
			var item1 = render.ctab.sgroups.get(obj.id);
			var item2 = render.ctab.sgroupData.get(obj.id);
			if (item1 != null)
				item1.setHighlight(visible, render);
			if (item2 != null)
				item2.setHighlight(visible, render);
		} else {
			item.setHighlight(visible, render);
		}
	} else {
		return false;
	}
	return true;
}

module.exports = HoverHelper;
