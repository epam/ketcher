/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h, Component } from 'preact';
/** @jsx h */

import keyName from 'w3c-keyname';

class Dialog extends Component {
	exit(mode) {
		let { params, result=() => null,
			  valid=() => !!result() } = this.props;
		let key = (mode === 'OK') ? 'onOk' : 'onCancel';
		if (params && key in params && (key !== 'onOk' || valid()) )
			params[key](result());
	}
	keyDown(ev) {
		let key = keyName(ev);
		let active = document.activeElement;
		let activeTextarea = active && active.tagName === 'TEXTAREA';
		if (key === 'Escape' || key === 'Enter' && !activeTextarea) {
			this.exit(key === 'Enter' ? 'OK': 'Cancel');
			ev.preventDefault();
		}
		ev.stopPropagation();
	}
	componentDidMount() {
		var fe = this.base.querySelector(['input:not([type=checkbox]):not([type=button])', 'textarea',
			                            '[contenteditable]','select'].join(',')) ||
			     this.base.querySelector(['button.close'].join(','));
		console.assert(fe, 'No active buttons');
		if (fe.focus) fe.focus();
	}
	render() {
		let { children, title, params={},
			  result=() => null, valid=() => !!result(), // Hmm, dublicate.. No simple default props
			  buttons=["Cancel", "OK"], ...props} = this.props;   // see: https://git.io/v1KR6
		return (
			<form role="dialog" onSubmit={ev => ev.preventDefault()}
			      onKeyDown={ev => this.keyDown(ev)} {...props}>
			  <header>{title}
				{ params.onCancel && title && (
					<button className="close"
							onClick={() => this.exit('Cancel')}>×
					</button> )
				}
			</header>
				{ children }
				<footer>{
					buttons.map(b => (
						typeof b !== 'string' ? b :
							<input type="button" value={b}
						           disabled={ b === 'OK' && !valid() }
						           onClick={() => this.exit(b)} />
					))
				}</footer>
			</form>
		);
	}
}

export default Dialog;
