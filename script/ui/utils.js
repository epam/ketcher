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
}

var transitionEnd = transitionEndEvent();
function transitionOne(el, callback) {
	if (!transitionEnd)
		callback();
	var fireOne = function () {
		callback();
		el.removeEventListener(transitionEnd, fireOne, false);
	};
	el.addEventListener(transitionEnd, fireOne, false);
}

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

/**
 * Returns first key of passed object
 * @param obj { object }
 */
function firstKeyOf(obj) {
	return Object.keys(obj)[0];
}

/**
 * Returns schema default values. Depends on passed arguments:
 * pass schema only -> returns default context
 * pass schema & context -> returns default fieldName
 * pass schema & context & fieldName -> returns default fieldValue
 * @param schema { object }
 * @param context? { string }
 * @param fieldName? { string }
 * @returns { string }
 */
function getSchemaDefault(schema, context, fieldName) {
	if (!context && !fieldName)
		return firstKeyOf(schema);

	if (!fieldName)
		return firstKeyOf(schema[context]);

	return schema[context][fieldName] ?
		schema[context][fieldName].properties.fieldValue.default :
		'';
}

module.exports = {
	animate: animate,
	loading: loading,
	getSchemaDefault: getSchemaDefault
};
