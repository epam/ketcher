import { h } from 'preact';
/** @jsx h */

export default function Dialog ({ children, caption, name, params={},
                                  result=() => null, valid=() => true }) {
	function exit(mode) {
		var key = 'on' + mode.capitalize();
		var res = result();
		if (params && key in params)
			params[key](res);
	}
	return (
		<form role="dialog" class={name}>
			<header>{caption}</header>
			{ children }
			<footer>
				<input type="button" onClick={() => exit('Cancel')} value="Cancel"/>
				<input type="button" disabled={!valid()} onClick={() => exit('OK')} value="OK"/>
			</footer>
		</form>
	);
}
