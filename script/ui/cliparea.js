const ieCb = window.clipboardData;
const clipActions = ['cut', 'copy', 'paste'];

function delegateCliparea(action) {
	let enabled = document.queryCommandSupported(action);

	if (enabled) try {
		enabled = document.execCommand(action);
	} catch (ex) {
		// FF < 41
		enabled = false;
	}
	return enabled;
}

function initCliparea(parent, options) {
	const cliparea = document.createElement('textarea');
	cliparea.contentEditable = true;
	cliparea.className = 'cliparea';
	cliparea.autofocus = true;

	parent.appendChild(cliparea);

	parent.addEventListener('mouseup', function () {
		if (options.focused())
			autofocus(cliparea);
	});

	parent.addEventListener('copy', function (event) {
		if (options.focused()) {
			const data = options.onCopy();
			if (data)
				copy(event.clipboardData, data);
			event.preventDefault();
		}
	});

	parent.addEventListener('cut', function (event) {
		if (options.focused()) {
			const data = options.onCut();
			if (data)
				copy(event.clipboardData, data);
			event.preventDefault();
		}
	});

	parent.addEventListener('paste', function (event) {
		if (options.focused()) {
			const data = paste(event.clipboardData, options.formats);
			if (data)
				options.onPaste(data);
			event.preventDefault();
		}
	});
}

const autofocus = function(cliparea) {
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
	let data = {};
	if (!cb && ieCb) {
		data['text/plain'] = ieCb.getData('text');
	} else {
		data['text/plain'] = cb.getData('text/plain');
		data = formats.reduce(function (data, fmt) {
			const d = cb.getData(fmt);
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
