/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

function pollDeferred(process, complete, timeGap, startTimeGap) {
	return new Promise((resolve, reject) => {
		function iterate() {
			process().then((val) => {
				try {
					if (complete(val))
						resolve(val);
					else
						setTimeout(iterate, timeGap);
				} catch (e) {
					reject(e);
				}
			}, err => reject(err));
		}
		setTimeout(iterate, startTimeGap || 0);
	});
}

function parametrizeUrl(url, params) {
	return url.replace(/:(\w+)/g, (_, val) => params[val]);
}

function api(base, defaultOptions) {
	const baseUrl = !base || /\/$/.test(base) ? base : base + '/';

	const info = request('GET', 'info').then(res => ({
		indigoVersion: res['indigo_version'],
		imagoVersions: res['imago_versions']
	})).catch(() => {
		throw Error('Server is not compatible');
	});

	function request(method, url, data, headers) {
		if (data && method === 'GET')
			url = parametrizeUrl(url, data);
		return fetch(baseUrl + url, {
			method,
			headers: Object.assign({
				Accept: 'application/json'
			}, headers),
			body: method !== 'GET' ? data : undefined,
			credentials: 'same-origin'
		})
			.then(response => response.json()
				.then(res => (response.ok ? res : Promise.reject(res.error))))
			.catch((err) => {
				throw Error(err);
			});
	}

	function indigoCall(method, url, defaultData) {
		return function (data, options) {
			const body = Object.assign({}, defaultData, data);
			body.options = Object.assign(body.options || {},
				defaultOptions, options);
			return info.then(() => request(method, url, JSON.stringify(body), {
				'Content-Type': 'application/json'
			}));
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
		recognize(blob, version) { // eslint-disable-line no-unused-vars
			const parVersion = version ? `?version=${version}` : '';
			const req = request('POST', `imago/uploads${parVersion}`, blob, {
				'Content-Type': blob.type || 'application/octet-stream'
			});
			const status = request.bind(null, 'GET', 'imago/uploads/:id');
			return req
				.then(data => pollDeferred(
					status.bind(null, { id: data.upload_id }),
					(res) => {
						if (res.state === 'FAILURE') throw res;
						return res.state === 'SUCCESS';
					}, 500, 300
				))
				.then(res => ({ struct: res.metadata.mol_str }));
		}
	});
}

export default api;
