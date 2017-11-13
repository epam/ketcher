/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

var Vec2 = require('../../util/vec2');
var Set = require('../../util/set');
var scale = require('../../util/scale');

var Struct = require('../../chem/struct/index');
var ReStruct = require('../../render/restruct/index');

var DEBUG = { debug: false, logcnt: 0, logmouse: false, hl: false };
DEBUG.logMethod = function () { };

function Base() {
	this.type = 'OpBase';

	// assert here?
	this.execute = function () {
		throw new Error('Operation.execute() is not implemented');
	};
	this.invert = function () {
		throw new Error('Operation.invert() is not implemented');
	};

	this.perform = function (restruct) {
		this.execute(restruct);
		/* eslint-disable no-underscore-dangle */
		if (!this._inverted) {
			this._inverted = this.invert();
			this._inverted._inverted = this;
		}
		return this._inverted;
	};
	this.isDummy = function (restruct) {
		return this._isDummy ? this._isDummy(restruct) : false;
		/* eslint-enable no-underscore-dangle */
	};
}

function AtomAdd(atom, pos) {
	this.data = { aid: null, atom: atom, pos: pos };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		var pp = {};
		if (this.data.atom) {
			for (var p in this.data.atom)
				if (this.data.atom.hasOwnProperty(p)) pp[p] = this.data.atom[p];
		}
		pp.label = pp.label || 'C';
		if (!(typeof this.data.aid === "number"))
			this.data.aid = struct.atoms.add(new Struct.Atom(pp));
		else
			struct.atoms.set(this.data.aid, new Struct.Atom(pp));

		// notifyAtomAdded
		var atomData = new ReStruct.Atom(restruct.molecule.atoms.get(this.data.aid));
		atomData.component = restruct.connectedComponents.add(Set.single(this.data.aid));
		restruct.atoms.set(this.data.aid, atomData);
		restruct.markAtom(this.data.aid, 1);

		struct.atomSetPos(this.data.aid, new Vec2(this.data.pos));
	};
	this.invert = function () {
		var ret = new AtomDelete();
		ret.data = this.data;
		return ret;
	};
}
AtomAdd.prototype = new Base();

function AtomDelete(aid) {
	this.data = { aid: aid, atom: null, pos: null };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (!this.data.atom) {
			this.data.atom = struct.atoms.get(this.data.aid);
			this.data.pos = this.data.atom.pp;
		}

		// notifyAtomRemoved(this.data.aid);
		var atom = restruct.atoms.get(this.data.aid);
		var set = restruct.connectedComponents.get(atom.component);
		Set.remove(set, this.data.aid);
		if (Set.size(set) == 0)
			restruct.connectedComponents.remove(atom.component);
		restruct.clearVisel(atom.visel);
		restruct.atoms.unset(this.data.aid);
		restruct.markItemRemoved();

		struct.atoms.remove(this.data.aid);
	};
	this.invert = function () {
		var ret = new AtomAdd();
		ret.data = this.data;
		return ret;
	};
}
AtomDelete.prototype = new Base();

function AtomAttr(aid, attribute, value) {
	this.data = { aid: aid, attribute: attribute, value: value };
	this.data2 = null;
	this.execute = function (restruct) {
		var atom = restruct.molecule.atoms.get(this.data.aid);
		if (!this.data2)
			this.data2 = { aid: this.data.aid, attribute: this.data.attribute, value: atom[this.data.attribute] };
		atom[this.data.attribute] = this.data.value;
		invalidateAtom(restruct, this.data.aid);
	};
	this._isDummy = function (restruct) { // eslint-disable-line no-underscore-dangle
		return restruct.molecule.atoms.get(this.data.aid)[this.data.attribute] == this.data.value;
	};
	this.invert = function () {
		var ret = new AtomAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
}
AtomAttr.prototype = new Base();

function AtomMove(aid, d, noinvalidate) {
	this.data = { aid, d, noinvalidate };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const aid = this.data.aid;
		const d = this.data.d;
		struct.atoms.get(aid).pp.add_(d); // eslint-disable-line no-underscore-dangle
		restruct.atoms.get(aid).visel.translate(scale.obj2scaled(d, restruct.render.options));

		this.data.d = d.negated();

		if (!this.data.noinvalidate)
			invalidateAtom(restruct, aid, 1);
	};

	this._isDummy = function () {
		return this.data.d.x === 0 && this.data.d.y === 0;
	};

	this.invert = function () {
		const ret = new AtomMove();
		ret.data = this.data;
		return ret;
	};
}
AtomMove.prototype = new Base();

function BondMove(bid, d) {
	this.data = { bid: bid, d: d };
	this.execute = function (restruct) {
		restruct.bonds.get(this.data.bid).visel.translate(scale.obj2scaled(this.data.d, restruct.render.options));
		this.data.d = this.data.d.negated();
	};
	this.invert = function () {
		var ret = new BondMove();
		ret.data = this.data;
		return ret;
	};
}
BondMove.prototype = new Base();

function LoopMove(id, d) {
	this.data = { id: id, d: d };
	this.execute = function (restruct) {
		// not sure if there should be an action to move a loop in the first place
		// but we have to somehow move the aromatic ring, which is associated with the loop, rather than with any of the bonds
		if (restruct.reloops.get(this.data.id) && restruct.reloops.get(this.data.id).visel)
			restruct.reloops.get(this.data.id).visel.translate(scale.obj2scaled(this.data.d, restruct.render.options));
		this.data.d = this.data.d.negated();
	};
	this.invert = function () {
		var ret = new LoopMove();
		ret.data = this.data;
		return ret;
	};
}
LoopMove.prototype = new Base();

function SGroupAtomAdd(sgid, aid) {
	this.type = 'OpSGroupAtomAdd';
	this.data = { sgid, aid };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const aid = this.data.aid;
		const sgid = this.data.sgid;
		const atom = struct.atoms.get(aid);
		const sg = struct.sgroups.get(sgid);

		if (sg.atoms.indexOf(aid) >= 0)
			throw new Error('The same atom cannot be added to an S-group more than once');

		if (!atom)
			throw new Error('OpSGroupAtomAdd: Atom ' + aid + ' not found');

		struct.atomAddToSGroup(sgid, aid);
		invalidateAtom(restruct, aid);
	};

	this.invert = function () {
		const ret = new SGroupAtomRemove();
		ret.data = this.data;
		return ret;
	};
}
SGroupAtomAdd.prototype = new Base();

function SGroupAtomRemove(sgid, aid) {
	this.type = 'OpSGroupAtomRemove';
	this.data = { sgid, aid };

	this.execute = function (restruct) {
		const aid = this.data.aid;
		const sgid = this.data.sgid;
		const struct = restruct.molecule;
		const atom = struct.atoms.get(aid);
		const sg = struct.sgroups.get(sgid);

		Struct.SGroup.removeAtom(sg, aid);
		Set.remove(atom.sgs, sgid);
		invalidateAtom(restruct, aid);
	};

	this.invert = function () {
		const ret = new SGroupAtomAdd();
		ret.data = this.data;
		return ret;
	};
}
SGroupAtomRemove.prototype = new Base();

function SGroupAttr(sgid, attr, value) {
	this.type = 'OpSGroupAttr';
	this.data = { sgid, attr, value };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const sgid = this.data.sgid;
		const sg = struct.sgroups.get(sgid);

		if (sg.type === 'DAT' && restruct.sgroupData.has(sgid)) {
			// clean the stuff here, else it might be left behind if the sgroups is set to "attached"
			restruct.clearVisel(restruct.sgroupData.get(sgid).visel);
			restruct.sgroupData.unset(sgid);
		}

		this.data.value = sg.setAttr(this.data.attr, this.data.value);
	};

	this.invert = function () {
		const ret = new SGroupAttr();
		ret.data = this.data;
		return ret;
	};
}
SGroupAttr.prototype = new Base();

function SGroupCreate(sgid, type, pp) {
	this.type = 'OpSGroupCreate';
	this.data = { sgid, type, pp };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const sg = new Struct.SGroup(this.data.type);
		const sgid = this.data.sgid;

		sg.id = sgid;
		struct.sgroups.set(sgid, sg);

		if (this.data.pp)
			struct.sgroups.get(sgid).pp = new Vec2(this.data.pp);

		restruct.sgroups.set(sgid, new ReStruct.SGroup(struct.sgroups.get(sgid)));
		this.data.sgid = sgid;
	};

	this.invert = function () {
		const ret = new SGroupDelete();
		ret.data = this.data;
		return ret;
	};
}
SGroupCreate.prototype = new Base();

function SGroupDelete(sgid) {
	this.type = 'OpSGroupDelete';
	this.data = { sgid };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const sgid = this.data.sgid;
		const sg = restruct.sgroups.get(sgid);

		this.data.type = sg.item.type;
		this.data.pp = sg.item.pp;

		if (sg.item.type === 'DAT' && restruct.sgroupData.has(sgid)) {
			restruct.clearVisel(restruct.sgroupData.get(sgid).visel);
			restruct.sgroupData.unset(sgid);
		}

		restruct.clearVisel(sg.visel);
		if (sg.item.atoms.length !== 0)
			throw new Error('S-Group not empty!');

		restruct.sgroups.unset(sgid);
		struct.sgroups.remove(sgid);
	};

	this.invert = function () {
		const ret = new SGroupCreate();
		ret.data = this.data;
		return ret;
	};
}
SGroupDelete.prototype = new Base();

function SGroupAddToHierarchy(sgid, parent, children) {
	this.type = 'OpSGroupAddToHierarchy';
	this.data = { sgid, parent, children };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const sgid = this.data.sgid;
		const relations = struct.sGroupForest.insert(sgid, parent, children);

		this.data.parent = relations.parent;
		this.data.children = relations.children;
	};

	this.invert = function () {
		const ret = new SGroupRemoveFromHierarchy();
		ret.data = this.data;
		return ret;
	};
}
SGroupAddToHierarchy.prototype = new Base();

function SGroupRemoveFromHierarchy(sgid) {
	this.type = 'OpSGroupRemoveFromHierarchy';
	this.data = { sgid };

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const sgid = this.data.sgid;

		this.data.parent = struct.sGroupForest.parent.get(sgid);
		this.data.children = struct.sGroupForest.children.get(sgid);
		struct.sGroupForest.remove(sgid);
	};

	this.invert = function () {
		const ret = new SGroupAddToHierarchy();
		ret.data = this.data;
		return ret;
	};
}
SGroupRemoveFromHierarchy.prototype = new Base();

function BondAdd(begin, end, bond) {
	this.data = { bid: null, bond: bond, begin: begin, end: end };
	this.execute = function (restruct) { // eslint-disable-line max-statements
		var struct = restruct.molecule;
		if (this.data.begin == this.data.end)
			throw new Error('Distinct atoms expected');
		if (DEBUG.debug && this.molecule.checkBondExists(this.data.begin, this.data.end))
			throw new Error('Bond already exists');

		invalidateAtom(restruct, this.data.begin, 1);
		invalidateAtom(restruct, this.data.end, 1);

		var pp = {};
		if (this.data.bond) {
			for (var p in this.data.bond)
				if (this.data.bond.hasOwnProperty(p)) pp[p] = this.data.bond[p];
		}
		pp.type = pp.type || Struct.Bond.PATTERN.TYPE.SINGLE;
		pp.begin = this.data.begin;
		pp.end = this.data.end;

		if (!(typeof this.data.bid === "number"))
			this.data.bid = struct.bonds.add(new Struct.Bond(pp));
		else
			struct.bonds.set(this.data.bid, new Struct.Bond(pp));
		struct.bondInitHalfBonds(this.data.bid);
		struct.atomAddNeighbor(struct.bonds.get(this.data.bid).hb1);
		struct.atomAddNeighbor(struct.bonds.get(this.data.bid).hb2);

		// notifyBondAdded
		restruct.bonds.set(this.data.bid, new ReStruct.Bond(restruct.molecule.bonds.get(this.data.bid)));
		restruct.markBond(this.data.bid, 1);
	};
	this.invert = function () {
		var ret = new BondDelete();
		ret.data = this.data;
		return ret;
	};
}
BondAdd.prototype = new Base();

function BondDelete(bid) {
	this.data = { bid: bid, bond: null, begin: null, end: null };
	this.execute = function (restruct) {  // eslint-disable-line max-statements
		var struct = restruct.molecule;
		if (!this.data.bond) {
			this.data.bond = struct.bonds.get(this.data.bid);
			this.data.begin = this.data.bond.begin;
			this.data.end = this.data.bond.end;
		}

		invalidateBond(restruct, this.data.bid);

		// notifyBondRemoved
		var rebond = restruct.bonds.get(this.data.bid);
		[rebond.b.hb1, rebond.b.hb2].forEach(function (hbid) {
			var hb = restruct.molecule.halfBonds.get(hbid);
			if (hb.loop >= 0)
				restruct.loopRemove(hb.loop);
		}, restruct);
		restruct.clearVisel(rebond.visel);
		restruct.bonds.unset(this.data.bid);
		restruct.markItemRemoved();

		var bond = struct.bonds.get(this.data.bid);
		[bond.hb1, bond.hb2].forEach(function (hbid) {
			var hb = struct.halfBonds.get(hbid);
			var atom = struct.atoms.get(hb.begin);
			var pos = atom.neighbors.indexOf(hbid);
			var prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
			var next = (pos + 1) % atom.neighbors.length;
			struct.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
			atom.neighbors.splice(pos, 1);
		}, this);
		struct.halfBonds.unset(bond.hb1);
		struct.halfBonds.unset(bond.hb2);

		struct.bonds.remove(this.data.bid);
	};
	this.invert = function () {
		var ret = new BondAdd();
		ret.data = this.data;
		return ret;
	};
}
BondDelete.prototype = new Base();

function BondAttr(bid, attribute, value) {
	this.data = { bid: bid, attribute: attribute, value: value };
	this.data2 = null;
	this.execute = function (restruct) {
		var bond = restruct.molecule.bonds.get(this.data.bid);
		if (!this.data2)
			this.data2 = { bid: this.data.bid, attribute: this.data.attribute, value: bond[this.data.attribute] };

		bond[this.data.attribute] = this.data.value;

		invalidateBond(restruct, this.data.bid);
		if (this.data.attribute === 'type')
			invalidateLoop(restruct, this.data.bid);
	};
	this._isDummy = function (restruct) { // eslint-disable-line no-underscore-dangle
		return restruct.molecule.bonds.get(this.data.bid)[this.data.attribute] == this.data.value;
	};
	this.invert = function () {
		var ret = new BondAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
}
BondAttr.prototype = new Base();

function FragmentAdd(frid) {
	this.frid = (typeof frid === 'undefined') ? null : frid;

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const frag = {};

		if (this.frid === null)
			this.frid = struct.frags.add(frag);
		else
			struct.frags.set(this.frid, frag);

		restruct.frags.set(this.frid, new ReStruct.Frag(frag)); // TODO add ReStruct.notifyFragmentAdded
	};

	this.invert = function () {
		return new FragmentDelete(this.frid);
	};
}
FragmentAdd.prototype = new Base();

function FragmentDelete(frid) {
	this.frid = frid;
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		invalidateItem(restruct, 'frags', this.frid, 1);
		restruct.frags.unset(this.frid);
		struct.frags.remove(this.frid); // TODO add ReStruct.notifyFragmentRemoved
	};
	this.invert = function () {
		return new FragmentAdd(this.frid);
	};
}
FragmentDelete.prototype = new Base();

function RGroupAttr(rgid, attribute, value) {
	this.data = { rgid: rgid, attribute: attribute, value: value };
	this.data2 = null;
	this.execute = function (restruct) {
		var rgp = restruct.molecule.rgroups.get(this.data.rgid);
		if (!this.data2)
			this.data2 = { rgid: this.data.rgid, attribute: this.data.attribute, value: rgp[this.data.attribute] };

		rgp[this.data.attribute] = this.data.value;

		invalidateItem(restruct, 'rgroups', this.data.rgid);
	};
	this._isDummy = function (restruct) { // eslint-disable-line no-underscore-dangle
		return restruct.molecule.rgroups.get(this.data.rgid)[this.data.attribute] == this.data.value;
	};
	this.invert = function () {
		var ret = new RGroupAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
}
RGroupAttr.prototype = new Base();

function RGroupFragment(rgid, frid, rg) {
	this.type = 'OpAddOrDeleteRGFragment';
	this.rgid_new = rgid;
	this.rg_new = rg;
	this.rgid_old = null;
	this.rg_old = null;
	this.frid = frid;

	this.execute = function (restruct) { // eslint-disable-line max-statements
		const struct = restruct.molecule;
		this.rgid_old = this.rgid_old || Struct.RGroup.findRGroupByFragment(struct.rgroups, this.frid);
		this.rg_old = (this.rgid_old ? struct.rgroups.get(this.rgid_old) : null);

		if (this.rg_old) {
			this.rg_old.frags.remove(this.rg_old.frags.keyOf(this.frid));
			restruct.clearVisel(restruct.rgroups.get(this.rgid_old).visel);

			if (this.rg_old.frags.count() === 0) {
				restruct.rgroups.unset(this.rgid_old);
				struct.rgroups.unset(this.rgid_old);
				restruct.markItemRemoved();
			} else {
				restruct.markItem('rgroups', this.rgid_old, 1);
			}
		}

		if (this.rgid_new) {
			let rgNew = struct.rgroups.get(this.rgid_new);
			if (!rgNew) {
				rgNew = this.rg_new || new Struct.RGroup();
				struct.rgroups.set(this.rgid_new, rgNew);
				restruct.rgroups.set(this.rgid_new, new ReStruct.RGroup(rgNew));
			} else {
				restruct.markItem('rgroups', this.rgid_new, 1);
			}
			rgNew.frags.add(this.frid);
		}
	};

	this.invert = function () {
		return new RGroupFragment(this.rgid_old, this.frid, this.rg_old);
	};
}
RGroupFragment.prototype = new Base();

function UpdateIfThen(rgNew, rgOld) {
	this.type = 'OpUpdateIfThenValues';
	this.rgid_new = rgNew;
	this.rgid_old = rgOld;
	this.ifThenHistory = {};

	this.execute = function (restruct) {
		const struct = restruct.molecule;

		struct.rgroups.keys().forEach(rgKey => {
			const rgValue = struct.rgroups.get(rgKey);

			if (rgValue.ifthen === this.rgid_old) {
				rgValue.ifthen = this.rgid_new;
				this.ifThenHistory[rgKey] = this.rgid_old;
				struct.rgroups.set(rgKey, rgValue);
			}
		});
	};

	this.invert = function () {
		return new RestoreIfThen(this.rgid_new, this.rgid_old, this.ifThenHistory);
	};
}
UpdateIfThen.prototype = new Base();

function RestoreIfThen(rgNew, rgOld, history) {
	this.type = 'OpRestoreIfThenValues';
	this.rgid_new = rgNew;
	this.rgid_old = rgOld;
	this.ifThenHistory = history || {};

	this.execute = function (restruct) {
		const struct = restruct.molecule;

		Object.keys(this.ifThenHistory).forEach(rgid => {
			const rgValue = struct.rgroups.get(rgid);
			rgValue.ifthen = this.ifThenHistory[rgid];
			struct.rgroups.set(rgid, rgValue);
		});
	};

	this.invert = function () {
		return new UpdateIfThen(this.rgid_old, this.rgid_new);
	};
}
RestoreIfThen.prototype = new Base();

function RxnArrowAdd(pos) {
	this.data = { arid: null, pos: pos };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (!(typeof this.data.arid === 'number'))
			this.data.arid = struct.rxnArrows.add(new Struct.RxnArrow());
		else
			struct.rxnArrows.set(this.data.arid, new Struct.RxnArrow());

		// notifyRxnArrowAdded
		restruct.rxnArrows.set(this.data.arid, new ReStruct.RxnArrow(restruct.molecule.rxnArrows.get(this.data.arid)));

		struct.rxnArrowSetPos(this.data.arid, new Vec2(this.data.pos));

		invalidateItem(restruct, 'rxnArrows', this.data.arid, 1);
	};
	this.invert = function () {
		var ret = new RxnArrowDelete();
		ret.data = this.data;
		return ret;
	};
}
RxnArrowAdd.prototype = new Base();

function RxnArrowDelete(arid) {
	this.data = { arid: arid, pos: null };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (!this.data.pos)
			this.data.pos = struct.rxnArrows.get(this.data.arid).pp;

		// notifyRxnArrowRemoved
		restruct.markItemRemoved();
		restruct.clearVisel(restruct.rxnArrows.get(this.data.arid).visel);
		restruct.rxnArrows.unset(this.data.arid);

		struct.rxnArrows.remove(this.data.arid);
	};
	this.invert = function () {
		var ret = new RxnArrowAdd();
		ret.data = this.data;
		return ret;
	};
}
RxnArrowDelete.prototype = new Base();

function RxnArrowMove(id, d, noinvalidate) {
	this.data = { id: id, d: d, noinvalidate: noinvalidate };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		var id = this.data.id;
		var d = this.data.d;
		struct.rxnArrows.get(id).pp.add_(d); // eslint-disable-line no-underscore-dangle
		restruct.rxnArrows.get(id).visel.translate(scale.obj2scaled(d, restruct.render.options));
		this.data.d = d.negated();
		if (!this.data.noinvalidate)
			invalidateItem(restruct, 'rxnArrows', id, 1);
	};
	this.invert = function () {
		var ret = new RxnArrowMove();
		ret.data = this.data;
		return ret;
	};
}
RxnArrowMove.prototype = new Base();

function RxnPlusAdd(pos) {
	this.data = { plid: null, pos: pos };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (!(typeof this.data.plid === 'number'))
			this.data.plid = struct.rxnPluses.add(new Struct.RxnPlus());
		else
			struct.rxnPluses.set(this.data.plid, new Struct.RxnPlus());

		// notifyRxnPlusAdded
		restruct.rxnPluses.set(this.data.plid, new ReStruct.RxnPlus(restruct.molecule.rxnPluses.get(this.data.plid)));

		struct.rxnPlusSetPos(this.data.plid, new Vec2(this.data.pos));

		invalidateItem(restruct, 'rxnPluses', this.data.plid, 1);
	};
	this.invert = function () {
		var ret = new RxnPlusDelete();
		ret.data = this.data;
		return ret;
	};
}
RxnPlusAdd.prototype = new Base();

function RxnPlusDelete(plid) {
	this.data = { plid: plid, pos: null };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (!this.data.pos)
			this.data.pos = struct.rxnPluses.get(this.data.plid).pp;

		// notifyRxnPlusRemoved
		restruct.markItemRemoved();
		restruct.clearVisel(restruct.rxnPluses.get(this.data.plid).visel);
		restruct.rxnPluses.unset(this.data.plid);

		struct.rxnPluses.remove(this.data.plid);
	};
	this.invert = function () {
		var ret = new RxnPlusAdd();
		ret.data = this.data;
		return ret;
	};
}
RxnPlusDelete.prototype = new Base();

function RxnPlusMove(id, d, noinvalidate) {
	this.data = { id: id, d: d, noinvalidate: noinvalidate };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		var id = this.data.id;
		var d = this.data.d;
		struct.rxnPluses.get(id).pp.add_(d); // eslint-disable-line no-underscore-dangle
		restruct.rxnPluses.get(id).visel.translate(scale.obj2scaled(d, restruct.render.options));
		this.data.d = d.negated();
		if (!this.data.noinvalidate)
			invalidateItem(restruct, 'rxnPluses', id, 1);
	};
	this.invert = function () {
		var ret = new RxnPlusMove();
		ret.data = this.data;
		return ret;
	};
}
RxnPlusMove.prototype = new Base();

function SGroupDataMove(id, d) {
	this.data = { id: id, d: d };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		struct.sgroups.get(this.data.id).pp.add_(this.data.d); // eslint-disable-line no-underscore-dangle
		this.data.d = this.data.d.negated();
		invalidateItem(restruct, 'sgroupData', this.data.id, 1); // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
	};
	this.invert = function () {
		var ret = new SGroupDataMove();
		ret.data = this.data;
		return ret;
	};
}
SGroupDataMove.prototype = new Base();

function CanvasLoad(struct) {
	this.data = { struct: struct };
	this.execute = function (restruct) {
		var oldStruct = restruct.molecule;
		restruct.clearVisels(); // TODO: What is it?
		restruct.render.setMolecule(this.data.struct);
		this.data.struct = oldStruct;
	};

	this.invert = function () {
		var ret = new CanvasLoad();
		ret.data = this.data;
		return ret;
	};
}
CanvasLoad.prototype = new Base();

function ChiralFlagAdd(pos) {
	this.data = { pos: pos };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (restruct.chiralFlags.count() > 0) {
			// throw new Error('Cannot add more than one Chiral flag');
			restruct.clearVisel(restruct.chiralFlags.get(0).visel);
			restruct.chiralFlags.unset(0);
		}

		restruct.chiralFlags.set(0, new ReStruct.ChiralFlag(pos));
		struct.isChiral = true;
		invalidateItem(restruct, 'chiralFlags', 0, 1);
	};
	this.invert = function () {
		var ret = new ChiralFlagDelete();
		ret.data = this.data;
		return ret;
	};
}
ChiralFlagAdd.prototype = new Base();

function ChiralFlagDelete() {
	this.data = { pos: null };
	this.execute = function (restruct) {
		var struct = restruct.molecule;
		if (restruct.chiralFlags.count() < 1)
			throw new Error('Cannot remove chiral flag');
		restruct.clearVisel(restruct.chiralFlags.get(0).visel);
		this.data.pos = restruct.chiralFlags.get(0).pp;
		restruct.chiralFlags.unset(0);
		struct.isChiral = false;
	};
	this.invert = function () {
		var ret = new ChiralFlagAdd(this.data.pos);
		ret.data = this.data;
		return ret;
	};
}
ChiralFlagDelete.prototype = new Base();

function ChiralFlagMove(d) {
	this.data = { d: d };
	this.execute = function (restruct) {
		restruct.chiralFlags.get(0).pp.add_(this.data.d); // eslint-disable-line no-underscore-dangle
		this.data.d = this.data.d.negated();
		invalidateItem(restruct, 'chiralFlags', 0, 1);
	};
	this.invert = function () {
		var ret = new ChiralFlagMove();
		ret.data = this.data;
		return ret;
	};
}
ChiralFlagMove.prototype = new Base();

function AlignDescriptors() {
	this.type = 'OpAlignDescriptors';
	this.history = {};

	this.execute = function (restruct) {
		const sgroups = restruct.molecule.sgroups.values().reverse();

		let alignPoint = sgroups.reduce(
			(acc, sg) => new Vec2(
				Math.max(sg.bracketBox.p1.x, acc.x),
				Math.min(sg.bracketBox.p0.y, acc.y)
			), new Vec2(0.0, Infinity)
		)
			.add(new Vec2(0.5, -0.5));

		sgroups.forEach(sg => {
			this.history[sg.id] = sg.pp;
			alignPoint = alignPoint.add(new Vec2(0.0, 0.5));
			sg.pp = alignPoint;
			restruct.molecule.sgroups.set(sg.id, sg);
		});
	};

	this.invert = function () {
		return new RestoreDescriptorsPosition(this.history);
	};
}
AlignDescriptors.prototype = new Base();

function RestoreDescriptorsPosition(history) {
	this.type = 'OpRestoreDescriptorsPosition';
	this.history = history;

	this.execute = function (restruct) {
		const sgroups = restruct.molecule.sgroups.values();

		sgroups.forEach(sg => {
			sg.pp = this.history[sg.id];
			restruct.molecule.sgroups.set(sg.id, sg);
		});
	};

	this.invert = function () {
		return new AlignDescriptors();
	};
}
RestoreDescriptorsPosition.prototype = new Base();

function invalidateAtom(restruct, aid, level) {
	var atom = restruct.atoms.get(aid);
	restruct.markAtom(aid, level ? 1 : 0);
	var hbs = restruct.molecule.halfBonds;
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hbid = atom.a.neighbors[i];
		if (hbs.has(hbid)) {
			var hb = hbs.get(hbid);
			restruct.markBond(hb.bid, 1);
			restruct.markAtom(hb.end, 0);
			if (level)
				invalidateLoop(restruct, hb.bid);
		}
	}
}

function invalidateLoop(restruct, bid) {
	var bond = restruct.bonds.get(bid);
	var lid1 = restruct.molecule.halfBonds.get(bond.b.hb1).loop;
	var lid2 = restruct.molecule.halfBonds.get(bond.b.hb2).loop;
	if (lid1 >= 0)
		restruct.loopRemove(lid1);
	if (lid2 >= 0)
		restruct.loopRemove(lid2);
}

function invalidateBond(restruct, bid) {
	var bond = restruct.bonds.get(bid);
	invalidateLoop(restruct, bid);
	invalidateAtom(restruct, bond.b.begin, 0);
	invalidateAtom(restruct, bond.b.end, 0);
}

function invalidateItem(restruct, map, id, level) {
	if (map === 'atoms') {
		invalidateAtom(restruct, id, level);
	} else if (map === 'bonds') {
		invalidateBond(restruct, id);
		if (level > 0)
			invalidateLoop(restruct, id);
	} else {
		restruct.markItem(map, id, level);
	}
}

module.exports = {
	AtomAdd: AtomAdd,
	AtomDelete: AtomDelete,
	AtomAttr: AtomAttr,
	AtomMove: AtomMove,
	BondMove: BondMove,
	LoopMove: LoopMove,
	SGroupAtomAdd: SGroupAtomAdd,
	SGroupAtomRemove: SGroupAtomRemove,
	SGroupAttr: SGroupAttr,
	SGroupCreate: SGroupCreate,
	SGroupDelete: SGroupDelete,
	SGroupAddToHierarchy: SGroupAddToHierarchy,
	SGroupRemoveFromHierarchy: SGroupRemoveFromHierarchy,
	BondAdd: BondAdd,
	BondDelete: BondDelete,
	BondAttr: BondAttr,
	FragmentAdd: FragmentAdd,
	FragmentDelete: FragmentDelete,
	RGroupAttr: RGroupAttr,
	RGroupFragment: RGroupFragment,
	RxnArrowAdd: RxnArrowAdd,
	RxnArrowDelete: RxnArrowDelete,
	RxnArrowMove: RxnArrowMove,
	RxnPlusAdd: RxnPlusAdd,
	RxnPlusDelete: RxnPlusDelete,
	RxnPlusMove: RxnPlusMove,
	SGroupDataMove: SGroupDataMove,
	CanvasLoad: CanvasLoad,
	ChiralFlagAdd: ChiralFlagAdd,
	ChiralFlagDelete: ChiralFlagDelete,
	ChiralFlagMove: ChiralFlagMove,
	UpdateIfThen: UpdateIfThen,
	AlignDescriptors: AlignDescriptors,
	RestoreDescriptorsPosition: RestoreDescriptorsPosition
};
