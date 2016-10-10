function pollDeferred(process, complete, timeGap, startTimeGap) {
	return new Promise(function (resolve, reject) {
		function iterate() {
			process().then(function (val) {
				try {
					var finish = complete(val);
					if (finish)
						resolve(val);
					else
						setTimeout(iterate, timeGap);
				} catch (e) {
					reject(e);
				}
			}, function (err) {
				return reject(err);
			});
		}
		setTimeout(iterate, startTimeGap || 0);
	});
}

function parametrizeUrl(url, params) {
	return url.replace(/:(\w+)/g, function (_, val) {
		return params[val];
	});
}

function api(base, defaultOptions) {
	var baseUrl = !base || /\/$/.test(base) ? base : base + '/';

	var info = request('GET', 'indigo/info').then(function (res) {
		return { indigoVersion: res.Indigo.version };
	}).catch(function () {
		throw Error('Server is not compatible');
	});

	function request(method, url, data, headers) {
		if (data && method == 'GET')
			url = parametrizeUrl(url, data);
		return fetch(baseUrl + url, {
			method: method,
			headers: Object.assign({
				Accept: 'application/json'
			}, headers),
			body: method != 'GET' ? data : null
		}).then(function (response) {
			return response.json().then(function (res) {
				return response.ok ? res : Promise.reject(res.error);
			});
		}).catch(function (err) {
			throw 'Cannot parse result\n' + err;
		});
	}

	function indigoCall(method, url, defaultData) {
		return function (data, options) {
			var body = Object.assign({}, defaultData, data);
			body.options = Object.assign(body.options || {},
			                             defaultOptions, options);
			return info.then(function () {
				return request(method, url, JSON.stringify(body), {
					'Content-Type': 'application/json'
				});
			});
		};
	}

	return Object.assign(info, {
		convert: indigoCall('POST', 'indigo/convert'),
		layout: indigoCall('POST', 'indigo/layout'),
		clean: indigoCall('POST', 'indigo/clean'),
		aromatize: indigoCall('POST', 'indigo/aromatize'),
		dearomatize: indigoCall('POST', 'indigo/dearomatize'),
		calculateCip: indigoCall('POST', 'indigo/calculate_cip'),
		automap: indigoCall('POST', 'indigo/automap'),
		check: indigoCall('POST', 'indigo/check'),
		calculate: indigoCall('POST', 'indigo/calculate'),
		recognize: function (blob) {
			var req = request('POST', 'imago/uploads', blob, {
				'Content-Type': blob.type || 'application/octet-stream'
			});
			var status = request.bind(null, 'GET', 'imago/uploads/:id');
			return req.then(function (res) {
				return pollDeferred(
					status.bind(null, { id: res.upload_id }),
					function complete(res) {
						if (res.state === 'FAILURE')
							throw res;
						return res.state === 'SUCCESS';
					}, 500, 300);
			}).then(function correct(res) {
				return { struct: res.metadata.mol_str };
			}, function incorrect() {
				return { struct: 'error' };
			});
		}
	});
}

module.exports = api;
