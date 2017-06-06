import sdf from '../../chem/sdf';

export function selectTmpl(tmpl) {
	return {
		type: 'TMPL_SELECT',
		payload: { selected: tmpl }
	}
}

export function changeGroup(group) {
	return {
		type: 'TMPL_CHANGE_GROUP',
		payload: { group: group, selected: null }
	}
}

export function changeFilter(filter) {
	return {
		type: 'TMPL_CHANGE_FILTER',
		payload: { filter: filter.trim(), selected: null } // TODO: change this
	}
}

const initState = {
	selected: null,
	filter: '',
	group: null
};

const dumbActions = [
	'TMPL_SELECT',
	'TMPL_CHANGE_GROUP',
	'TMPL_CHANGE_FILTER'
];

export default function templatesReducer(state = initState, action) {

	if (dumbActions.includes(action.type)) {
		return Object.assign({}, state, action.payload);
	}

	return state;
}

function prefetchStatic(url) {
	return fetch(url, { credentials: 'same-origin' }).then(function (resp) {
		if (resp.ok)
			return resp.text();
		throw "Could not fetch " + url;
	});
}

function prefetchSplit(tmpl) {
	let pr = tmpl.props.prerender;
	let res = pr && pr.split('#', 2);
	return {
		file: pr && res[0],
		id: pr && res[1]
	};
}

function prefetchRender(tmpls, baseUrl, cacheEl) {
	let files = tmpls.reduce((res, tmpl) => {
		let file = prefetchSplit(tmpl).file;
		if (file && res.indexOf(file) === -1)
			res.push(file);
		return res;
	}, []);
	let fetch = Promise.all(files.map(fn => (
		prefetchStatic(baseUrl + fn).catch(() => null)
	)));
	return fetch.then(svgs => {
		svgs.forEach(svgContent => {
			if (svgContent)
				cacheEl.innerHTML += svgContent;
		});
		return files.filter((file, i) => (
			!!svgs[i]
		));
	});

}

export function init(baseUrl, cacheEl) {
	return prefetchStatic(baseUrl + 'library.sdf').then(text => {
		let tmpls = sdf.parse(text);
		let prefetch = prefetchRender(tmpls, baseUrl, cacheEl);
		return prefetch.then(cachedFiles => (
			tmpls.map(tmpl => {
				let pr = prefetchSplit(tmpl);
				if (pr.file)
					tmpl.props.prerender = cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : '';
				return tmpl;
			})
		));
	});
}
