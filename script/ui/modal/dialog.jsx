import { h } from 'preact';
/** @jsx h */

export default function Dialog ({ children, caption, name, params={},
                                  result=() => null, valid=() => true }) {
	function exit(mode) {
		var key = 'on' + mode.capitalize();
		var res = result();
		if (params && key in params && (key != 'onOk' || valid()) )
			params[key](res);
	}
	function keyDown(ev) {
		var key = ev.keyCode;
		if (key == 13 || key == 27) {
			exit(key == 13 ? 'OK': 'Cancel');
			ev.preventDefault();
		}
	}
	function focus(el) {
		setTimeout(() => {
			var fe = el.querySelector('input, button, select, textarea');
			fe.focus();
		}, 0);
	}

	return (
		<form role="dialog" class={name} ref={el => focus(el)}
			  onSubmit={ev => ev.preventDefault()} onKeyDown={keyDown}>
			<header>{caption}</header>
			{ children }
			<footer>
				<input type="button" onClick={() => exit('Cancel')} value="Cancel"/>
				<input type="button" disabled={!valid()} onClick={() => exit('OK')} value="OK"/>
			</footer>
		</form>
	);
}
