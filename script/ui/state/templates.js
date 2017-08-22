import sdf from '../../chem/sdf';
import molfile from '../../chem/molfile';
import { appUpdate } from './options';

/* TEMPLATES */
export function selectTmpl(tmpl) {
	return {
		type: 'TMPL_SELECT',
		data: { selected: tmpl }
	}
}

export function changeGroup(group) {
	return {
		type: 'TMPL_CHANGE_GROUP',
		data: { group: group, selected: null }
	}
}

export function changeFilter(filter) {
	return {
		type: 'TMPL_CHANGE_FILTER',
		data: { filter: filter.trim(), selected: null } // TODO: change this
	}
}

/* TEMPLATE-ATTACH-EDIT */
export function initAttach(name, attach) {
	return {
		type: 'INIT_ATTACH',
		data: {
			name,
			atomid: attach.atomid,
			bondid: attach.bondid
		}
	};
}

export function setAttachPoints(attach) {
	return {
		type: 'SET_ATTACH_POINTS',
		data: {
			atomid: attach.atomid,
			bondid: attach.bondid
		}
	};
}

export function setTmplName(name) {
	return {
		type: 'SET_TMPL_NAME',
		data: { name }
	};
}

/* REDUCER */
export const initTmplState = {
	lib: [],
	selected: null,
	filter: '',
	group: null,
	attach: {}
};

const tmplActions = [
	'TMPL_INIT',
	'TMPL_SELECT',
	'TMPL_CHANGE_GROUP',
	'TMPL_CHANGE_FILTER'
];

const attachActions = [
	'INIT_ATTACH',
	'SET_ATTACH_POINTS',
	'SET_TMPL_NAME'
];

export function templatesReducer(state = initTmplState, action) {

	if (tmplActions.includes(action.type)) {
		return Object.assign({}, state, action.data);
	}
	if (attachActions.includes(action.type)) {
		let attach = Object.assign({}, state.attach, action.data);
		return { ...state, attach };
	}

	return state;
}

/* INIT TEMPLATES LIBRARY */
function initLib(lib) {
	return {
		type: 'TMPL_INIT',
		data: { lib: lib }
	}
}

export function initTmplLib(dispatch, baseUrl, cacheEl) {
	prefetchStatic(baseUrl + 'library.sdf').then(text => {
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
	}).then(res => {
		let lib = res.concat(userTmpls());
		dispatch(initLib(lib));
		dispatch(appUpdate({ templates: true }));
	});
}

function userTmpls() {
	var userLib = JSON.parse(localStorage['ketcher-tmpl'] || 'null') || [];
	return userLib.map((tmpl) => {
		if (tmpl.props === '') tmpl.props = {};
		tmpl.props.group = 'User';
		return {
			struct: molfile.parse(tmpl.struct),
			props: tmpl.props
		};
	});
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
