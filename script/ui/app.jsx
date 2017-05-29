import { Provider, connect } from 'preact-redux';

import state, { onAction } from './state';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

import modals from './dialog';

const AppEditor = connect(
	(state) => ({
		options: state.options
	}),
	(dispatch) => ({
		onInit: editor => {
			dispatch({ type: 'INIT', editor });
		},
		onChange: () => {
			dispatch({ type: 'UPDATE' });
		},
		onSelectionChange: () => {
			dispatch({ type: 'UPDATE' });
		}
	})
)(StructEditor);

const AppModal = connect(
	(state) => ({
		modal: state.modal
	}),
	(dispatch) => ({
		onOk: function (res) {
			console.log('output:', res);
			dispatch({ type: 'MODAL_CLOSE' });
		},
		onCancel: function () {
			dispatch({ type: 'MODAL_CLOSE' });
		}
	})
)(({modal, ...props}) => {
	if (!modal)
		return null;
	let Modal = modals[modal.name];
	return <div className="overlay">
		<Modal {...props}/>
	</div>
});

const App = connect(
	null,
	{ onAction }
)(props => (
	<main role="application">
		<AppEditor id="canvas"/>
		<Toolbar {...props}/>
		<AppModal/>
	</main>
));


function init(el, options, server) {
	var store = state(options, server);
	return render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);
}

export default init;
