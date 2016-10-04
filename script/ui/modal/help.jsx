import { h, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

function Help(props) {
	return (
		<Dialog caption="Help"
				name="help" params={props}
				buttons={["Close"]}>
			<iframe className="help" src="doc/help.html"></iframe>
		</Dialog>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Help {...params}/>
	), overlay);
};
