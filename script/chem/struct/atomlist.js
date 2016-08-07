var element = require('../element');

var AtomList = function (params) {
	if (!params || !('notList' in params) || !('ids' in params))
		throw new Error('\'notList\' and \'ids\' must be specified!');

	this.notList = params.notList; /* boolean*/
	this.ids = params.ids; /* Array of integers*/
};

AtomList.prototype.labelList = function () {
	var labels = [];
	for (var i = 0; i < this.ids.length; ++i)
		labels.push(element.get(this.ids[i]).label);
	return labels;
};

AtomList.prototype.label = function () {
	var label = '[' + this.labelList().join(',') + ']';
	if (this.notList)
		label = '!' + label;
	return label;
};

AtomList.prototype.equals = function (x) {
	return this.notList == x.notList && (this.ids || []).sort().toString() == (x.ids || []).sort().toString();
};

module.exports = AtomList;
