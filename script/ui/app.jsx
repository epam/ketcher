import { Provider, connect } from 'preact-redux';

import state, { onAction } from './reducers/state';

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
	(dispatch) => ({
		onOk: function (res) {
			console.log('output:', res);
			dispatch({ tyape: 'MODAL_CLOSE' });
		},
		onCancel: function () {
			dispatch({ type: 'MODAL_CLOSE' });
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
			dispatch(onAction(action));
		},
	})
)(({modal, ...props}) => (
	<main role="application">
		<AppEditor id="canvas"/>
		<Toolbar {...props}/>
		{modal ? <AppDialog modal={modal.name}/> : null}
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
