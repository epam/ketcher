var Pool = require('../util/pool');

var RGroup = function (logic) {
	logic = logic || {};
	this.frags = new Pool();
	this.resth = logic.resth || false;
	this.range = logic.range || '';
	this.ifthen = logic.ifthen || 0;
};

RGroup.prototype.getAttrs = function () {
	return {
		resth: this.resth,
		range: this.range,
		ifthen: this.ifthen
	};
};

RGroup.findRGroupByFragment = function (rgroups, frid) {
	var ret;
	rgroups.each(function (rgid, rgroup) {
		if (!Object.isUndefined(rgroup.frags.keyOf(frid))) ret = rgid;
	});
	return ret;
};

RGroup.prototype.clone = function (fidMap) {
	var ret = new RGroup(this);
	this.frags.each(function (fnum, fid) {
		ret.frags.add(fidMap ? fidMap[fid] : fid);
	});
	return ret;
};

module.exports = RGroup;
