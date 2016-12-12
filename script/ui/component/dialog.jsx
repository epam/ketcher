import { h, Component } from 'preact';
/** @jsx h */

import keyName from 'w3c-keyname';

class Dialog extends Component {
	exit(mode) {
		let { params, result=() => null,
			  valid=() => !!result() } = this.props;
		var key = (mode == 'OK') ? 'onOk' : 'onCancel';
		if (params && key in params && (key != 'onOk' || valid()) )
			params[key](result());
	}
	keyDown(ev) {
		let key = keyName(ev);
		let active = document.activeElement;
		let activeTextarea = active && active.tagName == 'TEXTAREA';
		if (key.startsWith('Esc') || key == 'Enter' && !activeTextarea) {
			this.exit(key == 'Enter' ? 'OK': 'Cancel');
			ev.preventDefault();
		}
		ev.stopPropagation();
	}
	componentDidMount() {
		var fe = this.base.querySelector(['input:not([type=button])', 'textarea',
			                            '[contenteditable]'].join(',')) ||
			     this.base.querySelector(['select', 'button:not(.close)', 'input'].join(','));
		console.assert(fe, 'No active buttons');
		fe.focus();
	}
	render() {
		console.info('dialog render');
		let { children, caption, name, params={},
			  result=() => null, valid=() => !!result(), // Hmm, dublicate.. No simple default props
			  buttons=["Cancel", "OK"] } = this.props;   // see: https://git.io/v1KR6
		return (
			<form role="dialog" className={name}
			  onSubmit={ev => ev.preventDefault()}
			  onKeyDown={ev => this.keyDown(ev)}>
			  <header>{caption}
				{ params.onCancel && caption && (
					<button className="close"
							onClick={() => this.exit('Cancel')}>×
					</button> )
				}
			</header>
				{ children }
				<footer>{
					buttons.map(b => (
						typeof b != 'string' ? b :
							<input type="button" value={b}
						           disabled={ b == 'OK' && !valid() }
						           onClick={() => this.exit(b)} />
					))
				}</footer>
			</form>
		);
	}
};

export default Dialog;
