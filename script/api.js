function api(base, defaultOptions) {
	var baseUrl = !base || /\/$/.test(base) ? base : base + '/';

	function request(method, url, defaultData) {
		return function (data, options) {
			var body = Object.assign({}, defaultData, data);
			body.indigo_options = Object.assign(body.indigo_options || {},
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

	var info = fetch(baseUrl + 'indigo/info', { method: 'GET' }).then(function (res) {
		return res.json();
	}, function () {
		throw Error('Server is not compatible');
	});

	function pollDeferred (process, complete, timeGap, startTimeGap) {
		return new Promise(function (resolve, reject) {
			function iterate() {
				process().then(function (val) {
					try {
						var finish = complete(val);
						if (finish)
							resolve(val);
						else
							window.setTimeout(iterate, timeGap);
					} catch (e) {
						reject(e);
					}
				}, function (err) {
					return reject(err);
				});
			}
			window.setTimeout(iterate, startTimeGap || 0);
		});
	}

	return Object.assign(info, {
		convert: request('POST', 'indigo/convert'),
		layout: request('POST', 'indigo/layout'),
		clean: request('POST', 'indigo/clean'),
		aromatize: request('POST', 'indigo/aromatize'),
		dearomatize: request('POST', 'indigo/dearomatize'),
		calculateCip: request('POST', 'indigo/calculate_cip'),
		automap: request('POST', 'indigo/automap'),
		check: request('POST', 'indigo/check'),
		calculate: request('POST', 'indigo/calculate'),
		recognize: function() {
			return new Promise(function (resolve) {
				setTimeout(() => resolve(info.layout({struct: 'C1CC1'})), 500);
			});
		}		
	});
}

module.exports = api;
