import Vec2 from '../../util/vec2';
import { Fragment } from '../../chem/struct';
import { ReFrag, ReEnhancedFlag } from '../../render/restruct';

import Base, { invalidateAtom, invalidateItem } from './base';

function FragmentAdd(frid) {
	this.frid = (typeof frid === 'undefined') ? null : frid;

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const frag = new Fragment();

		if (this.frid === null)
			this.frid = struct.frags.add(frag);
		else
			struct.frags.set(this.frid, frag);

		restruct.frags.set(this.frid, new ReFrag(frag)); // TODO add ReStruct.notifyFragmentAdded
		restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag(null, null));
	};

	this.invert = function () {
		return new FragmentDelete(this.frid);
	};
}
FragmentAdd.prototype = new Base();

function FragmentDelete(frid) {
	this.frid = frid;

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		invalidateItem(restruct, 'frags', this.frid, 1);
		restruct.frags.delete(this.frid);
		struct.frags.delete(this.frid); // TODO add ReStruct.notifyFragmentRemoved

		restruct.clearVisel(restruct.enhancedFlags.get(frid).visel);
		restruct.enhancedFlags.delete(frid);
	};

	this.invert = function () {
		return new FragmentAdd(this.frid);
	};
}
FragmentDelete.prototype = new Base();

function FragmentStereoFlag(frid, flag) {
	this.frid = frid;
	this.flag = flag;
	this.invert_flag = null;

	this.execute = function (restruct) {
		const struct = restruct.molecule;

		const frag = struct.frags.get(this.frid);
		if (!this.invert_flag)
			this.invert_flag = frag.enhancedStereoFlag;

		frag.updateStereoFlag(this.flag);

		markEnhancedFlag(restruct, this.frid, frag.enhancedStereoFlag);
	};

	this.invert = function () {
		const ret = new FragmentStereoFlag(this.frid);
		ret.flag = this.invert_flag;
		ret.invert_flag = this.flag;
		return ret;
	};
}
FragmentStereoFlag.prototype = new Base();

function AtomFragmentAttr(aid, oldfrid, newfrid) {
	this.data = { aid, oldfrid, newfrid };
	this.data2 = null;

	this.execute = function (restruct) {
		const struct = restruct.molecule;

		if (!this.data2) {
			this.data2 = {
				aid: this.data.aid,
				oldfrid: this.data.newfrid,
				newfrid: this.data.oldfrid
			};
		}
		const atom = struct.atoms.get(this.data.aid);
		atom['fragment'] = this.data.newfrid;
		invalidateAtom(restruct, this.data.aid);

		const oldfrag = struct.frags.get(this.data.oldfrid);
		const stereoMark = oldfrag.getStereoAtomMark(this.data.aid);
		if (stereoMark.type === null) return;

		const newfrag = struct.frags.get(this.data.newfrid);
		oldfrag.updateStereoAtom(this.data.aid, { type: null });
		newfrag.updateStereoAtom(this.data.aid, stereoMark);

		// console.log(oldfrag, newfrag)

		restruct.enhancedFlags.get(this.data.oldfrid).flag = oldfrag.enhancedStereoFlag;
		restruct.enhancedFlags.get(this.data.newfrid).flag = newfrag.enhancedStereoFlag;
	};

	this.invert = function () {
		const ret = new AtomFragmentAttr();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
}
AtomFragmentAttr.prototype = new Base();

function StereoAtomMark(aid, stereoMark) {
	this.data = { aid, stereoMark };
	this.data2 = null;

	this.execute = function (restruct) {
		const struct = restruct.molecule;
		const frid = struct.atoms.get(this.data.aid).fragment;
		const frag = struct.frags.get(frid);

		if (!this.data2) {
			this.data2 = {
				aid: this.data.aid,
				stereoMark: frag.getStereoAtomMark(this.data.aid)
			};
		}
		frag.updateStereoAtom(this.data.aid, this.data.stereoMark);
		invalidateAtom(restruct, this.data.aid, 1);

		markEnhancedFlag(restruct, frid, frag.enhancedStereoFlag);
	};

	this.invert = function () {
		const ret = new StereoAtomMark();
		ret.data = this.data2;
		ret.data2 = this.data;
		return ret;
	};
}
StereoAtomMark.prototype = new Base();

function EnhancedFlagMove(frid, p) {
	this.data = { frid, p };

	this.execute = function (restruct) {
		if (!this.data.p) {
			const bb = restruct.molecule.getFragment(this.data.frid).getCoordBoundingBox();
			this.data.p = new Vec2(bb.max.x, bb.min.y - 1);
		}
		restruct.enhancedFlags.get(this.data.frid).pp.add_(this.data.p);
		this.data.p = this.data.p.negated();
		invalidateItem(restruct, 'enhancedFlags', this.data.frid, 1);
	};

	this.invert = function () {
		const ret = new EnhancedFlagMove();
		ret.data = this.data;
		return ret;
	};
}
EnhancedFlagMove.prototype = new Base();

// TODO: remove ?
function markEnhancedFlag(restruct, frid, flag) {
	const reEnhancedFlag = restruct.enhancedFlags.get(frid);
	restruct.clearVisel(reEnhancedFlag.visel);
	const bb = restruct.molecule.getFragment(frid).getCoordBoundingBox();
	reEnhancedFlag.flag = flag;
	reEnhancedFlag.pp = new Vec2(bb.max.x, bb.min.y - 1);

	restruct.markItem('enhancedFlags', frid, 1);
}

export {
	FragmentAdd,
	FragmentDelete,
	FragmentStereoFlag,
	AtomFragmentAttr,
	StereoAtomMark,
	EnhancedFlagMove
};
