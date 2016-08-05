var molfile = require('./molfile');

function parse(str, options) {
	var chunks = str.split(/^\$\$\$\$$/m); // TODO: stream parser
	                                       // do not split all file
	return chunks.reduce(function (res, chunk) {
		chunk = chunk.replace(/\r/g, ''); // TODO: normalize newline?
		chunk = chunk.trim();
		var end = chunk.indexOf('M  END');
		if (end != -1) {
			var item = {};
			var propChunks = chunk.substr(end + 7).trim().split(/^$/m);

			item.struct = molfile.parse(chunk.substring(0, end + 6),
			                            options);
			item.props = propChunks.reduce(function (props, pc) {
				var m = pc.match(/^> [ \d]*<(\S+)>/);
				if (m) {
					var field = m[1];
					var value = pc.split('\n')[1].trim();
					props[field] = value;
				}
				return props;
			}, {});

			res.push(item);
		}
		return res;
	}, []);
}

module.exports = {
	stringify: function (struct, options) {
		throw new Error('Not implemented yet');
	},
	parse: parse
};
