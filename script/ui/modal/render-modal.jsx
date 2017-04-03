import {h, render} from 'preact';
/** @jsx h */
import { Provider } from 'preact-redux';
import store from '../store.es';

export default function modal(Modal) {
	return function dialog(params) {
		var overlay = $$('.overlay')[0];
		return render((
			<Provider store={store}>
				<Modal {...params}/>
			</Provider>
		), overlay);
	};
}
