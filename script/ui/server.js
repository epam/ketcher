if (!window.ui)
	ui = {};

ui.server = (function(window) {
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
		for(var prop in obj) {
			if (obj.hasOwnProperty(prop)) // don't handle nested objects
				str.push(encodeURIComponent(prop) + '=' +
				         formEncodeString(obj[prop]));
		}
		return str.join('&');
	}
	function apiHandle(xhr) {
		var data = xhr.responseText,
		    value = data.substring(data.indexOf('\n') + 1);
		if (data.startsWith('Ok.'))
			return value;
		throw Error(data.startsWith('Error.') ? value :
		            'Something went wrong (' + data + ')');
	}
	function apiRequest(method, url, data, params) {
		// TODO: move api_path to server constructor
		var opts = {
			method: method,
			url: ui.api_path + url,
			params: params,
			data: data && formEncode(data),
			headers: data && {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		return util.ajax(opts).then(apiHandle);
	}

	return {
		inchi: apiRequest.bind(this, 'POST', 'getinchi'),
		aromatize: apiRequest.bind(this, 'POST', 'aromatize'),
		dearomatize: apiRequest.bind(this, 'POST', 'dearomatize'),
		automap: apiRequest.bind(this, 'POST', 'automap'),
		layout_smiles: apiRequest.bind(this, 'GET', 'layout'),
		layout: apiRequest.bind(this, 'POST', 'layout'),
		smiles: apiRequest.bind(this, 'POST', 'smiles'),
		knocknock: function () {
			return util.ajax(ui.api_path + 'knocknock').then(function (xhr) {
				if (xhr.responseText != 'You are welcome!')
					throw Error('Server is not compatible');
			});
		}
	};
})(window);
