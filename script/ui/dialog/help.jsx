import { h } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

function Help(props) {
	return (
		<Dialog title="Help"
				className="help" params={props}
				buttons={["Close"]}>
			<iframe className="help" src="doc/help.html"></iframe>
		</Dialog>
	);
}

export default Help;
