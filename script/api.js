function api(base, defaultOptions) {
	var baseUrl = !base || /\/$/.test(base) ? base : base + '/';

	function request(method, url, defaultData) {
		return function (data, options) {
			return fetch(baseUrl + url, {
				method: method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(function (response) {
				if (response.ok)
					return response.json();
				else
					throw response.json();
			});
		};
	}

	function request_old(method, url) {
		var baseUrl_old = '';
		function options(opts, params, sync) {
			var data = Object.assign({}, defaultOptions, opts);
			return {
				method: method,
				url: res.url,
				sync: sync,
				params: params,
				data: data && formEncode(data),
				headers: data && { 'Content-Type': 'application/x-www-form-urlencoded' }
			};
		}
		function res(data, params) {
			return ajax(options(data, params)).then(unwrap, unwrap);
		}
		res.sync = function (data, params) {
			// TODO: handle errors
			return unwrap(ajax(options(data, params, true)));
		};
		res.url = baseUrl_old + url;
		return res;
	}

	return {
		convert: request('POST', 'convert'),
		layout: request('POST', 'layout'),
		clean: request('POST', 'clean'),
		aromatize: request('POST', 'aromatize'),
		dearomatize: request('POST', 'dearomatize'),
		calculateCip: request('POST', 'calculate_cip'),
		automap: request('POST', 'automap'),
    check: request('POST', 'check'),

		//save: request2('POST', 'save'),
		info: function () {
			return request('GET', 'info')().then(function (res) {
				return res;
			}, function (err) {
				throw Error('Server is not compatible');
			});
		}
	};
}

module.exports = api;
