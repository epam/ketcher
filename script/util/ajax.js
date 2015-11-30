/*global require, module*/

var getXHR = require('xhrpolyfill');
var Promise = require('promise-polyfill');
var util = require('./index.js');

function ajax(options, callback) {
	var xhr = getXHR();
	var headers = options.headers || {};

	xhr.open(options.method, options.url, !!callback, options.user, options.password);

	for (var k in headers) {
		if (headers.hasOwnProperty(k)) {
			xhr.setRequestHeader(k, headers[k]);
		}
	}
	if (typeof options.config === 'function') {
		var maybeXhr = options.config(xhr, options);
		if (maybeXhr !== undefined) {
			xhr = maybeXhr;
		}
	}
	if (options.timeout > 0) {
		setTimeout(function () {
			xhr.status = -1;
			xhr.abort();
		}, options.timeout);
	}
	if (callback) {
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				callback(xhr);
			}
		};
	}
	xhr.send(options.data);
	return xhr;
}

function successful(xhr) {
	return xhr.status >= 200 && xhr.status < 300;
}

function queryString(obj) {
	var str = [];
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) { // don't handle nested objects
			str.push(encodeURIComponent(prop) + '=' +
			encodeURIComponent(obj[prop]));
		}
	}
	return str.join('&');
}

function request(opts) {
	var options = util.extend({
		method: 'GET',
		headers: {},
		timeout: 6000
	}, util.isObject(opts) ? opts : { url: opts });
	if (util.isObject(options.data)) {
		options.data = JSON.stringify(options.data);
		options.headers['Content-Type'] = 'application/json; charset=utf-8';
	}
	if (options.params) {
		options.url = options.url + (options.url.indexOf('?') < 0 ? '?' : '&') + queryString(options.params);
	}

	if (!options.sync) {
		return new Promise(function (resolve, reject) {
			ajax(options, function (xhr) {
				var complete = successful(xhr) ? resolve : reject;
				complete(xhr);
			});
		});
	}

	var xhr = ajax(options);
	if (!successful(xhr)) {
		throw xhr;
	}
	return xhr;
}

module.exports = request;
