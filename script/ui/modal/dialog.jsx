import { h } from 'preact';
/** @jsx h */

export default function Dialog ({ children, caption, name, params={},
                                  result=() => null, valid=() => !!result(), buttons=["Cancel", "OK"] }) {

	function isReturn(mode) {
		return mode == 'OK';
	}
	function exit(mode) {
		var key = isReturn(mode) ? 'onOk' : 'onCancel';
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
			onSubmit={ev => ev.preventDefault()}
			onKeyDown={keyDown}>
			<header>{caption}</header>
			{ children }
			<footer>{
				buttons.map(b => (
					typeof b != 'string' ? b :
						<input type="button" disabled={ isReturn(b) && !valid() } onClick={() => exit(b)} value={b}/>
				))
			}</footer>
		</form>
	);
}
