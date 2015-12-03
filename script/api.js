/*global require, global, module*/

var ajax = require('./util/ajax.js');

// stealed from https://github.com/iambumblehead/form-urlencoded/
function formEncodeString(str) {
	return str.replace(/[^ !'()~\*]*/g, encodeURIComponent)
	.replace(/ /g, '+')
	.replace(/[!'()~\*]/g, function (ch) {
		return '%' + ('0' + ch.charCodeAt(0).toString(16))
		.slice(-2).toUpperCase();
	});
}

function formEncode(obj) {
	var str = [];
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {// don't handle nested objects
			str.push(encodeURIComponent(prop) + '=' +
			formEncodeString(obj[prop]));
		}
	}
	return str.join('&');
}

function unwrap(xhr) {
	var data = xhr.responseText;
	var value = data.substring(data.indexOf('\n') + 1);

	if (data.startsWith('Ok.')) {
		return value;
	}
	throw Error('Unknown server error: ' + data);
}

function api (base_url) {
	function request (method, url) {
		function options(data, params, sync) {
			return {
				method: method,
				url: res.url,
				sync: sync,
				params: params,
				data: data && formEncode(data),
				headers: data && {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			};
		}
		var res = function (data, params) {
			return ajax(options(data, params)).then(unwrap);
		};
		res.sync = function (data, params) {
			// TODO: handle errors
			return unwrap(ajax(options(data, params, true)));
		};
		res.url = base_url + url;
		return res;
	}

	return {
		inchi: request('POST', 'getinchi'),
		molfile: request('POST', 'getmolfile'),
		aromatize: request('POST', 'aromatize'),
		dearomatize: request('POST', 'dearomatize'),
		calculateCip: request('POST', 'calculate_cip'),
		automap: request('POST', 'automap'),
		layout_smiles: request('GET', 'layout'),
		layout: request('POST', 'layout'),
		smiles: request('POST', 'smiles'),
		save: request('POST', 'save'),
		knocknock: function () {
			return ajax(base_url + 'knocknock').then(function (xhr) {
				if (xhr.responseText !== 'You are welcome!') {
					throw Error('Server is not compatible');
				}
			});
		}
	};
}

module.exports = api;
