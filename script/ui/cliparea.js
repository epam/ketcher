var ieCb = window.clipboardData;
var clipActions = ['cut', 'copy', 'paste'];

function delegateCliparea(action) {
	var enabled = document.queryCommandSupported(action);
	if (enabled) try {
		enabled = document.execCommand(action);
	} catch (ex) {
		// FF < 41
		enabled = false;
	}
	return enabled;
}

function initCliparea(parent, options) {
	var cliparea = new Element('textarea', {
		'contenteditable': true,
		'class': 'cliparea',
		autofocus: true
	});
	parent.insert(cliparea);

	parent.on('mouseup', function (event) {
		if (options.focused())
			autofocus(cliparea);
	});

	parent.on('copy', function (event) {
		if (options.focused()) {
			var data = options.onCopy();
			if (data)
				copy(event.clipboardData, data);
			event.preventDefault();
		}
	});
	parent.on('cut', function (event) {
		if (options.focused()) {
			var data = options.onCut();
			if (data)
				copy(event.clipboardData, data);
			event.preventDefault();
		}
	});
	parent.on('paste', function (event) {
		if (options.focused()) {
			var data = paste(event.clipboardData, options.formats);
			if (data)
				options.onPaste(data);
			event.preventDefault();
		}
	});
}

var autofocus = function(cliparea) {
	cliparea.value = ' ';
	cliparea.focus();
	cliparea.select();
	return true;
};

function copy(cb, data) {
	if (!cb && ieCb) {
		ieCb.setData('text', data['text/plain']);
	} else {
		cb.setData('text/plain', data['text/plain']);
		try {
			Object.keys(data).forEach(function (fmt) {
				cb.setData(fmt, data[fmt]);
			});
		} catch (ex) {
			console.info('Could not write exact type', ex);
		}
	}
}

function paste(cb, formats) {
	var data = {};
	if (!cb && ieCb) {
		data['text/plain'] = ieCb.getData('text');
	} else {
		data['text/plain'] = cb.getData('text/plain');
		data = formats.reduce(function (data, fmt) {
			var d = cb.getData(fmt);
			if (d)
				data[fmt] = d;
			return data;
		}, data);
	}
	return data;
}


module.exports = Object.assign(initCliparea, {
	exec: delegateCliparea,
	actions: clipActions
});
