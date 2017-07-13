function transitionEndEvent () {
	var el = document.createElement('transitionTest'),
	transEndEventNames = {
		WebkitTransition: 'webkitTransitionEnd',
		MozTransition: 'transitionend',
		OTransition: 'oTransitionEnd otransitionend',
		transition: 'transitionend'
	},
	name;
	for (name in transEndEventNames) {
		if (el.style[name] !== undefined)
			return transEndEventNames[name];
	}
	return false;
};

var transitionEnd = transitionEndEvent();
function transitionOne(el, callback) {
	if (!transitionEnd)
		callback();
	var fireOne = function () {
		callback();
		el.removeEventListener(transitionEnd, fireOne, false);
	};
	el.addEventListener(transitionEnd, fireOne, false);
};

function loading(action) {
	var cover = $$('.overlay')[0];
	var loading = $('loading');
	if (action == 'show') {
		cover.style.display = '';
		return animate(cover, 'show').then(function () {
			loading.style.display = '';
		});
	}
	return animate(cover, 'hide').then(function () {
		cover.style.display = 'none';
		loading.style.display = 'none';
	});
}

function animate(el, action) {
	var notAction = action == 'show' ? 'hide' : 'show';
	return new Promise(function (resolve) {
		el.removeClassName('animate');
		el.addClassName(notAction);

		setTimeout(function () {
			el.addClassName('animate');
			el.addClassName(action);
			el.removeClassName(notAction);
			console.info('replace', action, el.classList);
		}, 0);

		console.info('start', action, el.classList);
		transitionOne(el, function () {
			//console.info('test', el.classList);
			if (el.hasClassName(action)) {
				el.removeClassName('animate');
				el.removeClassName(action);
				resolve(el);
			}
		});
	});
}

/* schema utils */
function constant(schema, prop) {
	let desc = schema.properties[prop];
	return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

function mapOf(schema, prop) {
	console.assert(schema.oneOf);
	return schema.oneOf.reduce((res, desc) => {
		res[constant(desc, prop)] = desc;
		return res;
	}, {});
}

function selectListOf(schema, prop) {
	let desc = schema.properties && schema.properties[prop];
	if (desc)
		return desc.enum.map((value, i) => {
			let title = desc.enumNames && desc.enumNames[i];
			return title ? { title, value } : value;
		});
	return schema.oneOf.map(desc => (
		!desc.title ? constant(desc, prop) : {
			title: desc.title,
			value: constant(desc, prop)
		}
	));
}

module.exports = {
	animate: animate,
	loading: loading,
	mapOf: mapOf,
	selectListOf: selectListOf
};
