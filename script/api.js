function api(base, defaultOptions) {
	var baseUrl = !base || /\/$/.test(base) ? base : base + '/';

	function request(method, url, defaultData) {
		return function (data, options) {
			var body = Object.assign({}, defaultData, data);
			body.options = Object.assign(body.options || {},
			                             defaultOptions, options);
			return fetch(baseUrl + url, {
				method: method,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			}).then(function (response) {
				if (response.ok)
					return response.json();
				// console.info('PLAIN RESPONSE', response);
				throw response.json();
			});
		};
	}

	return {
		convert: request('POST', 'convert'),
		layout: request('POST', 'layout'),
		clean: request('POST', 'clean'),
		aromatize: request('POST', 'aromatize'),
		dearomatize: request('POST', 'dearomatize'),
		calculateCip: request('POST', 'calculate_cip'),
		automap: request('POST', 'automap'),

		info: function () {
			return fetch(baseUrl + 'info', { method: 'GET' }).then(function (res) {
				return res.json();
			}, function () {
				throw Error('Server is not compatible');
			});
		}
	};
}

module.exports = api;
