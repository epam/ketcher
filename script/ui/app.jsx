import { Provider, connect } from 'preact-redux';
import { omit } from 'lodash/fp';

import state, { onAction, load } from './state';
import { initTmplLib } from './state/templates';
import { initEditor } from './state/editor';
import { checkServer } from './state/server';
import { initKeydownListener } from './state/hotkeys';
import { initResize } from './state/toolbar';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

import modals from './dialog';

const AppEditor = connect(
	state => ({
		options: state.options.settings
	}),
	dispatch => dispatch(initEditor)
)(StructEditor);

const AppModal = connect(
	state => ({
		modal: state.modal
	}),
	dispatch => ({
		onOk: function (res) {
			console.info('Output:', res);
			dispatch({ type: 'MODAL_CLOSE' });
		},
		onCancel: function () {
			dispatch({ type: 'MODAL_CLOSE' });
		}
	}),
	(stateProps, dispatchProps) => {
		let prop = stateProps.modal && stateProps.modal.prop;
		let initProps = prop ? omit(['onResult', 'onCancel'], prop) : {};
		return {
			modal: stateProps.modal,
			...initProps,
			onOk: function (res) {
				if (prop && prop.onResult) prop.onResult(res);
				dispatchProps.onOk(res);
			},
			onCancel: function () {
				if (prop && prop.onCancel) prop.onCancel();
				dispatchProps.onCancel();
			}
		};
	}
)(({modal, ...props}) => {
	if (!modal)
		return null;

	let Modal = modals[modal.name];

	if (!Modal)
		throw new Error(`There is no modal window named ${modal.name}`);

	return (
		<div className="overlay">
			<Modal {...props}/>
		</div>
	);
});

const AppTemplates = connect(
	null,
	dispatch => ({
		onInitTmpls: (cacheEl) => initTmplLib(dispatch, '', cacheEl)
	})
)(class extends Component {
	componentDidMount() {
		this.props.onInitTmpls(this.cacheEl);
	}
	render = () => (<div className="cellar" ref={c => this.cacheEl = c} />)
});

const App = connect(
	null,
	{ onAction, checkServer }
)(class extends Component {
	componentDidMount() {
		this.props.checkServer();
	}
	render = props => (
		<main role="application">
			<AppEditor id="canvas"/>
			<Toolbar {...props}/>
			<AppModal/>
			<AppTemplates/>
		</main>
	)
});

function init(el, options, server) {
	const store = state(options, server);
	store.dispatch(initKeydownListener(el));
	store.dispatch(initResize());

	render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);

	return {
		load: (structStr, options) => store.dispatch(load(structStr, options))
	}
}

export default init;
