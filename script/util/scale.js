function scaled2obj(v, options) {
	return v.scaled(1 / options.scaleFactor);
}

function obj2scaled(v, options) {
	return v.scaled(options.scaleFactor);
}

module.exports = {
	scaled2obj: scaled2obj,
	obj2scaled: obj2scaled
};

