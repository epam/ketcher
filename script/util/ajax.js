if (!window.util)
    util = {};

util.ajax = (function(window) {
	function ajax(options, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open(options.method, options.url, true,
		         options.user, options.password);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4)
				callback(xhr);
		};
		if (typeof options.config == 'function') {
			var maybeXhr = options.config(xhr, options);
			if (maybeXhr !== undefined)
				xhr = maybeXhr;
		}
		if (options.timeout > 0)
			setTimeout(function() {
				xhr.status = -1;
				xhr.abort();
			}, options.timeout);
		xhr.send(options.data);
		return xhr;
	}

	function request(options) {
		return new Promise(function (resolve, reject) {
			// TODO: query parametrs, parametrize urls
			ajax(options, function(xhr) {
				var complete = (xhr.status >= 200 && xhr.status < 300) ? resolve : reject;
				complete(xhr.responseText, xhr);
			});
		});
	}

	return request;
})(this);
