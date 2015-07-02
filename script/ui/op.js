/*global require, global, ui:false*/

var Vec2 = require('../util/vec2');
require('../chem');
require('../rnd');

var ui = global.ui = global.ui || function () {}; // jshint ignore:line
var chem = global.chem;
var rnd = global.rnd;

ui.Action.OpBase = function () {};
ui.Action.OpBase.prototype.type = 'OpBase';
ui.Action.OpBase.prototype._execute = function () {
	throw new Error('Operation._execute() is not implemented');
};
ui.Action.OpBase.prototype._invert = function () {
	throw new Error('Operation._invert() is not implemented');
};
ui.Action.OpBase.prototype.perform = function (editor) {
	this._execute(editor);
	if (!('__inverted' in this)) {
		this.__inverted = this._invert();
		this.__inverted.__inverted = this;
	}
	return this.__inverted;
};
ui.Action.OpBase.prototype.isDummy = function (editor) {
	return '_isDummy' in this ? this['_isDummy'](editor) : false;
};

ui.Action.OpAtomAdd = function (atom, pos) {
	this.data = { aid: null, atom: atom, pos: pos };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var pp = {};
		if (this.data.atom)
			for (var p in this.data.atom)
				pp[p] = this.data.atom[p];
		pp.label = pp.label || 'C';
		if (!Object.isNumber(this.data.aid)) {
			this.data.aid = DS.atoms.add(new chem.Struct.Atom(pp));
		} else {
			DS.atoms.set(this.data.aid, new chem.Struct.Atom(pp));
		}
		RS.notifyAtomAdded(this.data.aid);
		DS._atomSetPos(this.data.aid, new Vec2(this.data.pos));
	};
	this._invert = function () {
		var ret = new ui.Action.OpAtomDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpAtomAdd.prototype = new ui.Action.OpBase();

ui.Action.OpAtomDelete = function (aid) {
	this.data = { aid: aid, atom: null, pos: null };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!this.data.atom) {
			this.data.atom = DS.atoms.get(this.data.aid);
			this.data.pos = R.atomGetPos(this.data.aid);
		}
		RS.notifyAtomRemoved(this.data.aid);
		DS.atoms.remove(this.data.aid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpAtomAdd();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpAtomDelete.prototype = new ui.Action.OpBase();

ui.Action.OpAtomAttr = function (aid, attribute, value) {
	this.data = { aid: aid, attribute: attribute, value: value };
	this.data2 = null;
	this._execute = function (editor) {
		var atom = editor.render.ctab.molecule.atoms.get(this.data.aid);
		if (!this.data2) {
			this.data2 = { aid: this.data.aid, attribute: this.data.attribute, value: atom[this.data.attribute] };
		}
		atom[this.data.attribute] = this.data.value;
		editor.render.invalidateAtom(this.data.aid);
	};
	this._isDummy = function (editor) {
		return editor.render.ctab.molecule.atoms.get(this.data.aid)[this.data.attribute] == this.data.value;
	};
	this._invert = function () {
		var ret = new ui.Action.OpAtomAttr();
		ret.data = this.data2;
		ret.data2 = this.data;return ret;
	};
};
ui.Action.OpAtomAttr.prototype = new ui.Action.OpBase();

ui.Action.OpAtomMove = function (aid, d, noinvalidate) {
	this.data = {aid: aid, d: d, noinvalidate: noinvalidate};
	this._execute = function (editor) {
		var R = editor.render;
		var RS = R.ctab;
		var DS = RS.molecule;
		var aid = this.data.aid;
		var d = this.data.d;
		DS.atoms.get(aid).pp.add_(d);
		RS.atoms.get(aid).visel.translate(R.ps(d));
		this.data.d = d.negated();
		if (!this.data.noinvalidate)
			R.invalidateAtom(aid, 1);
	};
	this._isDummy = function (editor) {
		return this.data.d.x == 0 && this.data.d.y == 0;
	};
	this._invert = function () {
		var ret = new ui.Action.OpAtomMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpAtomMove.prototype = new ui.Action.OpBase();

ui.Action.OpBondMove = function (bid, d) {
	this.data = {bid: bid, d: d};
	this._execute = function (editor) {
		var R = editor.render;
		var RS = R.ctab;
		RS.bonds.get(this.data.bid).visel.translate(R.ps(this.data.d));
		this.data.d = this.data.d.negated();
	};
	this._invert = function () {
		var ret = new ui.Action.OpBondMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpBondMove.prototype = new ui.Action.OpBase();

ui.Action.OpLoopMove = function (id, d) {
	this.data = {id: id, d: d};
	this._execute = function (editor) {
		var R = editor.render;
		var RS = R.ctab;
		// not sure if there should be an action to move a loop in the first place
		// but we have to somehow move the aromatic ring, which is associated with the loop, rather than with any of the bonds
		if (RS.reloops.get(this.data.id) && RS.reloops.get(this.data.id).visel)
			RS.reloops.get(this.data.id).visel.translate(R.ps(this.data.d));
		this.data.d = this.data.d.negated();
	};
	this._invert = function () {
		var ret = new ui.Action.OpLoopMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpLoopMove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAtomAdd = function (sgid, aid) {
	this.type = 'OpSGroupAtomAdd';
	this.data = {'aid': aid, 'sgid': sgid};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var aid = this.data.aid;
		var sgid = this.data.sgid;
		var atom = DS.atoms.get(aid);
		var sg = DS.sgroups.get(sgid);
		if (sg.atoms.indexOf(aid) >= 0)
			throw new Error('The same atom cannot be added to an S-group more than once');
		if (!atom)
			throw new Error('OpSGroupAtomAdd: Atom ' + aid + ' not found');
		DS.atomAddToSGroup(sgid, aid);
		R.invalidateAtom(aid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupAtomRemove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupAtomAdd.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAtomRemove = function (sgid, aid) {
	this.type = 'OpSGroupAtomRemove';
	this.data = {'aid': aid, 'sgid': sgid};
	this._execute = function (editor) {
		var aid = this.data.aid;
		var sgid = this.data.sgid;
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var atom = DS.atoms.get(aid);
		var sg = DS.sgroups.get(sgid);
		chem.SGroup.removeAtom(sg, aid);
		Set.remove(atom.sgs, sgid);
		R.invalidateAtom(aid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupAtomAdd();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupAtomRemove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAttr = function (sgid, attr, value) {
	this.type = 'OpSGroupAttr';
	this.data = {sgid: sgid, attr: attr, value: value};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var sgid = this.data.sgid;
		var sg = DS.sgroups.get(sgid);
		if (sg.type == 'DAT' && RS.sgroupData.has(sgid)) { // clean the stuff here, else it might be left behind if the sgroups is set to "attached"
			RS.clearVisel(RS.sgroupData.get(sgid).visel);
			RS.sgroupData.unset(sgid);
		}

		this.data.value = sg.setAttr(this.data.attr, this.data.value);
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupAttr();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupAttr.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupCreate = function (sgid, type, pp) {
	this.type = 'OpSGroupCreate';
	this.data = {'sgid': sgid, 'type': type, 'pp': pp};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var sg = new chem.SGroup(this.data.type);
		var sgid = this.data.sgid;
		sg.id = sgid;
		DS.sgroups.set(sgid, sg);
		if (this.data.pp) {
			DS.sgroups.get(sgid).pp = new Vec2(this.data.pp);
		}
		RS.sgroups.set(sgid, new rnd.ReSGroup(DS.sgroups.get(sgid)));
		this.data.sgid = sgid;
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupCreate.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupDelete = function (sgid) {
	this.type = 'OpSGroupDelete';
	this.data = {'sgid': sgid};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var sgid = this.data.sgid;
		var sg = RS.sgroups.get(sgid);
		this.data.type = sg.item.type;
		this.data.pp = sg.item.pp;
		if (sg.item.type == 'DAT' && RS.sgroupData.has(sgid)) {
			RS.clearVisel(RS.sgroupData.get(sgid).visel);
			RS.sgroupData.unset(sgid);
		}

		RS.clearVisel(sg.visel);
		if (sg.item.atoms.length != 0)
			throw new Error('S-Group not empty!');
		RS.sgroups.unset(sgid);
		DS.sgroups.remove(sgid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupCreate();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupDelete.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupAddToHierarchy = function (sgid) {
	this.type = 'OpSGroupAddToHierarchy';
	this.data = {'sgid': sgid};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var sgid = this.data.sgid;
		var relations = DS.sGroupForest.insert(sgid, this.data.parent, this.data.children);
		this.data.parent = relations.parent;
		this.data.children = relations.children;
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupRemoveFromHierarchy();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupAddToHierarchy.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupRemoveFromHierarchy = function (sgid) {
	this.type = 'OpSGroupRemoveFromHierarchy';
	this.data = {'sgid': sgid};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		var sgid = this.data.sgid;
		this.data.parent = DS.sGroupForest.parent.get(sgid);
		this.data.children = DS.sGroupForest.children.get(sgid);
		DS.sGroupForest.remove(sgid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupAddToHierarchy();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupRemoveFromHierarchy.prototype = new ui.Action.OpBase();

ui.Action.OpBondAdd = function (begin, end, bond) {
	this.data = { bid: null, bond: bond, begin: begin, end: end };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (this.data.begin == this.data.end)
			throw new Error('Distinct atoms expected');
		if (rnd.DEBUG && this.molecule.checkBondExists(this.data.begin, this.data.end))
			throw new Error('Bond already exists');

		R.invalidateAtom(this.data.begin, 1);
		R.invalidateAtom(this.data.end, 1);

		var pp = {};
		if (this.data.bond)
			for (var p in this.data.bond)
				pp[p] = this.data.bond[p];
		pp.type = pp.type || chem.Struct.BOND.TYPE.SINGLE;
		pp.begin = this.data.begin;
		pp.end = this.data.end;

		if (!Object.isNumber(this.data.bid)) {
			this.data.bid = DS.bonds.add(new chem.Struct.Bond(pp));
		} else {
			DS.bonds.set(this.data.bid, new chem.Struct.Bond(pp));
		}
		DS.bondInitHalfBonds(this.data.bid);
		DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb1);
		DS.atomAddNeighbor(DS.bonds.get(this.data.bid).hb2);

		RS.notifyBondAdded(this.data.bid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpBondDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpBondAdd.prototype = new ui.Action.OpBase();

ui.Action.OpBondDelete = function (bid) {
	this.data = { bid: bid, bond: null, begin: null, end: null };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!this.data.bond) {
			this.data.bond = DS.bonds.get(this.data.bid);
			this.data.begin = this.data.bond.begin;
			this.data.end = this.data.bond.end;
		}

		R.invalidateBond(this.data.bid);

		RS.notifyBondRemoved(this.data.bid);

		var bond = DS.bonds.get(this.data.bid);
		[bond.hb1, bond.hb2].each(function (hbid) {
			var hb = DS.halfBonds.get(hbid);
			var atom = DS.atoms.get(hb.begin);
			var pos = atom.neighbors.indexOf(hbid);
			var prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
			var next = (pos + 1) % atom.neighbors.length;
			DS.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
			atom.neighbors.splice(pos, 1);
		}, this);
		DS.halfBonds.unset(bond.hb1);
		DS.halfBonds.unset(bond.hb2);

		DS.bonds.remove(this.data.bid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpBondAdd();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpBondDelete.prototype = new ui.Action.OpBase();

ui.Action.OpBondAttr = function (bid, attribute, value) {
	this.data = { bid: bid, attribute: attribute, value: value };
	this.data2 = null;
	this._execute = function (editor) {
		var bond = editor.render.ctab.molecule.bonds.get(this.data.bid);
		if (!this.data2) {
			this.data2 = { bid: this.data.bid, attribute: this.data.attribute, value: bond[this.data.attribute] };
		}

		bond[this.data.attribute] = this.data.value;

		editor.render.invalidateBond(this.data.bid);
		if (this.data.attribute == 'type')
			editor.render.invalidateLoop(this.data.bid);
	};
	this._isDummy = function (editor) {
		return editor.render.ctab.molecule.bonds.get(this.data.bid)[this.data.attribute] == this.data.value;
	};
	this._invert = function () {
		var ret = new ui.Action.OpBondAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
};
ui.Action.OpBondAttr.prototype = new ui.Action.OpBase();

ui.Action.OpFragmentAdd = function (frid) {
	this.frid = Object.isUndefined(frid) ? null : frid;
	this._execute = function (editor) {
		var RS = editor.render.ctab, DS = RS.molecule;
		var frag = new chem.Struct.Fragment();
		if (this.frid == null) {
			this.frid = DS.frags.add(frag);
		} else {
			DS.frags.set(this.frid, frag);
		}
		RS.frags.set(this.frid, new rnd.ReFrag(frag)); // TODO add ReStruct.notifyFragmentAdded
	};
	this._invert = function () {
		return new ui.Action.OpFragmentDelete(this.frid);
	};
};
ui.Action.OpFragmentAdd.prototype = new ui.Action.OpBase();

ui.Action.OpFragmentDelete = function (frid) {
	this.frid = frid;
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		R.invalidateItem('frags', this.frid, 1);
		RS.frags.unset(this.frid);
		DS.frags.remove(this.frid); // TODO add ReStruct.notifyFragmentRemoved
	};
	this._invert = function () {
		return new ui.Action.OpFragmentAdd(this.frid);
	};
};
ui.Action.OpFragmentDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRGroupAttr = function (rgid, attribute, value) {
	this.data = { rgid: rgid, attribute: attribute, value: value };
	this.data2 = null;
	this._execute = function (editor) {
		var rgp = editor.render.ctab.molecule.rgroups.get(this.data.rgid);
		if (!this.data2) {
			this.data2 = { rgid: this.data.rgid, attribute: this.data.attribute, value: rgp[this.data.attribute] };
		}

		rgp[this.data.attribute] = this.data.value;

		editor.render.invalidateItem('rgroups', this.data.rgid);
	};
	this._isDummy = function (editor) {
		return editor.render.ctab.molecule.rgroups.get(this.data.rgid)[this.data.attribute] == this.data.value;
	};
	this._invert = function () {
		var ret = new ui.Action.OpRGroupAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
};
ui.Action.OpRGroupAttr.prototype = new ui.Action.OpBase();

ui.Action.OpRGroupFragment = function (rgid, frid, rg) {
	this.rgid_new = rgid;
	this.rg_new = rg;
	this.rgid_old = null;
	this.rg_old = null;
	this.frid = frid;
	this._execute = function (editor) {
		var RS = editor.render.ctab, DS = RS.molecule;
		this.rgid_old = this.rgid_old || chem.Struct.RGroup.findRGroupByFragment(DS.rgroups, this.frid);
		this.rg_old = (this.rgid_old ? DS.rgroups.get(this.rgid_old) : null);
		if (this.rg_old) {
			this.rg_old.frags.remove(this.rg_old.frags.keyOf(this.frid));
			RS.clearVisel(RS.rgroups.get(this.rgid_old).visel);
			if (this.rg_old.frags.count() == 0) {
				RS.rgroups.unset(this.rgid_old);
				DS.rgroups.unset(this.rgid_old);
				RS.markItemRemoved();
			} else {
				RS.markItem('rgroups', this.rgid_old, 1);
			}
		}
		if (this.rgid_new) {
			var rgNew = DS.rgroups.get(this.rgid_new);
			if (!rgNew) {
				rgNew = this.rg_new || new chem.Struct.RGroup();
				DS.rgroups.set(this.rgid_new, rgNew);
				RS.rgroups.set(this.rgid_new, new rnd.ReRGroup(rgNew));
			} else {
				RS.markItem('rgroups', this.rgid_new, 1);
			}
			rgNew.frags.add(this.frid);
		}
	};
	this._invert = function () {
		return new ui.Action.OpRGroupFragment(this.rgid_old, this.frid, this.rg_old);
	};
};
ui.Action.OpRGroupFragment.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowAdd = function (pos) {
	this.data = { arid: null, pos: pos };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!Object.isNumber(this.data.arid)) {
			this.data.arid = DS.rxnArrows.add(new chem.Struct.RxnArrow());
		} else {
			DS.rxnArrows.set(this.data.arid, new chem.Struct.RxnArrow());
		}
		RS.notifyRxnArrowAdded(this.data.arid);
		DS._rxnArrowSetPos(this.data.arid, new Vec2(this.data.pos));

		R.invalidateItem('rxnArrows', this.data.arid, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnArrowDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnArrowAdd.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowDelete = function (arid) {
	this.data = { arid: arid, pos: null };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!this.data.pos) {
			this.data.pos = R.rxnArrowGetPos(this.data.arid);
		}
		RS.notifyRxnArrowRemoved(this.data.arid);
		DS.rxnArrows.remove(this.data.arid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnArrowAdd();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnArrowDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRxnArrowMove = function (id, d, noinvalidate) {
	this.data = {id: id, d: d, noinvalidate: noinvalidate};
	this._execute = function (editor) {
		var R = editor.render;
		var RS = R.ctab;
		var DS = RS.molecule;
		var id = this.data.id;
		var d = this.data.d;
		DS.rxnArrows.get(id).pp.add_(d);
		RS.rxnArrows.get(id).visel.translate(R.ps(d));
		this.data.d = d.negated();
		if (!this.data.noinvalidate)
			editor.render.invalidateItem('rxnArrows', id, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnArrowMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnArrowMove.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusAdd = function (pos) {
	this.data = { plid: null, pos: pos };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!Object.isNumber(this.data.plid)) {
			this.data.plid = DS.rxnPluses.add(new chem.Struct.RxnPlus());
		} else {
			DS.rxnPluses.set(this.data.plid, new chem.Struct.RxnPlus());
		}
		RS.notifyRxnPlusAdded(this.data.plid);
		DS._rxnPlusSetPos(this.data.plid, new Vec2(this.data.pos));

		R.invalidateItem('rxnPluses', this.data.plid, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnPlusDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnPlusAdd.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusDelete = function (plid) {
	this.data = { plid: plid, pos: null };
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (!this.data.pos) {
			this.data.pos = R.rxnPlusGetPos(this.data.plid);
		}
		RS.notifyRxnPlusRemoved(this.data.plid);
		DS.rxnPluses.remove(this.data.plid);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnPlusAdd();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnPlusDelete.prototype = new ui.Action.OpBase();

ui.Action.OpRxnPlusMove = function (id, d, noinvalidate) {
	this.data = {id: id, d: d, noinvalidate: noinvalidate};
	this._execute = function (editor) {
		var R = editor.render;
		var RS = R.ctab;
		var DS = RS.molecule;
		var id = this.data.id;
		var d = this.data.d;
		DS.rxnPluses.get(id).pp.add_(d);
		RS.rxnPluses.get(id).visel.translate(R.ps(d));
		this.data.d = d.negated();
		if (!this.data.noinvalidate)
			editor.render.invalidateItem('rxnPluses', id, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpRxnPlusMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpRxnPlusMove.prototype = new ui.Action.OpBase();

ui.Action.OpSGroupDataMove = function (id, d) {
	this.data = {id: id, d: d};
	this._execute = function (editor) {
		ui.ctab.sgroups.get(this.data.id).pp.add_(this.data.d);
		this.data.d = this.data.d.negated();
		editor.render.invalidateItem('sgroupData', this.data.id, 1); // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
	};
	this._invert = function () {
		var ret = new ui.Action.OpSGroupDataMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpSGroupDataMove.prototype = new ui.Action.OpBase();

ui.Action.OpCanvasLoad = function (ctab) {
	this.data = {ctab: ctab, norescale: false};
	this._execute = function (editor) {
		var R = editor.render;

		R.ctab.clearVisels();
		var oldCtab = ui.ctab;
		ui.ctab = this.data.ctab;
		R.setMolecule(ui.ctab, this.data.norescale);
		this.data.ctab = oldCtab;
		this.data.norescale = true;
	};

	this._invert = function () {
		var ret = new ui.Action.OpCanvasLoad();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpCanvasLoad.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagAdd = function (pos) {
	this.data = {pos: pos};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (RS.chiralFlags.count() > 0)
			throw new Error('Cannot add more than one Chiral flag');
		RS.chiralFlags.set(0, new rnd.ReChiralFlag(pos));
		DS.isChiral = true;
		R.invalidateItem('chiralFlags', 0, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpChiralFlagDelete();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpChiralFlagAdd.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagDelete = function () {
	this.data = {pos: null};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab, DS = RS.molecule;
		if (RS.chiralFlags.count() < 1)
			throw new Error('Cannot remove chiral flag');
		RS.clearVisel(RS.chiralFlags.get(0).visel);
		this.data.pos = RS.chiralFlags.get(0).pp;
		RS.chiralFlags.unset(0);
		DS.isChiral = false;
	};
	this._invert = function () {
		var ret = new ui.Action.OpChiralFlagAdd(this.data.pos);
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpChiralFlagDelete.prototype = new ui.Action.OpBase();

ui.Action.OpChiralFlagMove = function (d) {
	this.data = {d: d};
	this._execute = function (editor) {
		var R = editor.render, RS = R.ctab;
		RS.chiralFlags.get(0).pp.add_(this.data.d);
		this.data.d = this.data.d.negated();
		R.invalidateItem('chiralFlags', 0, 1);
	};
	this._invert = function () {
		var ret = new ui.Action.OpChiralFlagMove();
		ret.data = this.data;
		return ret;
	};
};
ui.Action.OpChiralFlagMove.prototype = new ui.Action.OpBase();
