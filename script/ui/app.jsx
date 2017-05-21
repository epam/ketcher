import { Provider, connect } from 'preact-redux';

import state from './reducers/state';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

import modals from './modal';

const AppEditor = connect(
	(state) => ({
		options: state.options
	}),
	(dispatch, props) => ({
		onInit: function (editor) {
			dispatch({ type: 'INIT', data: { editor }});
		}
	})
)(StructEditor);

const AppDialog = connect(
	null,
	(dispatch, props) => ({
		onOk: function (res) {
			console.log('output:', res);
			dispatch({ type: 'CLOSE_DIALOG' });
		},
		onCancel: function () {
			dispatch({ type: 'CLOSE_DIALOG' });
		}
	})
)(props => {
	let Modal = modals[props.modal];
	return <div className="overlay">
		<Modal {...props}/>
	</div>
});

const App = connect(
	(state) => ({
		modal: state.modal
	}),
	dispatch => ({
		onAction: function (action) {
			dispatch({ type: 'ACTION',
					   data: { action }});
		},
		onDialog: function (name, title) {
			dispatch({
				type: 'OPEN_DIALOG',
				data: { modal: { name, title } }
			})
		}
	})
)(props => (
	<main role="application">
		<AppEditor id="canvas"/>
		<Toolbar {...props}/>
		{props.modal ? <AppDialog modal={props.modal.name}/> : null}
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
