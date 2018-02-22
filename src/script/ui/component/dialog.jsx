/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { h, Component } from 'preact';

import keyName from 'w3c-keyname';

class Dialog extends Component {
	exit(mode) {
		const { params, result = () => null,
			valid = () => !!result() } = this.props;
		const key = (mode === 'OK') ? 'onOk' : 'onCancel';
		if (params && key in params && (key !== 'onOk' || valid()))
			params[key](result());
	}
	keyDown(ev) {
		const key = keyName(ev);
		const active = document.activeElement;
		const activeTextarea = active && active.tagName === 'TEXTAREA';
		if (key === 'Escape' || (key === 'Enter' && !activeTextarea)) {
			this.exit(key === 'Enter' ? 'OK' : 'Cancel');
			ev.preventDefault();
		}
		ev.stopPropagation();
	}
	componentDidMount() {
		const fe = this.base.querySelector(['input:not([type=checkbox]):not([type=button])', 'textarea',
			'[contenteditable]', 'select'].join(',')) ||
			this.base.querySelector(['button.close'].join(','));
		console.assert(fe, 'No active buttons');
		if (fe.focus) fe.focus();
	}

	componentWillUnmount() {
		(document.querySelector('.cliparea') || document.body).focus();
	}

	render() {
		const {
			children, title, params = {},
			result = () => null, valid = () => !!result(), // Hmm, dublicate.. No simple default props
			buttons = ['Cancel', 'OK'], ...props
		} = this.props; // see: https://git.io/v1KR6
		return (
			<form
				role="dialog"
				onSubmit={ev => ev.preventDefault()}
				onKeyDown={ev => this.keyDown(ev)}
				tabIndex="-1"
				{...props}
			>
				<header>{title}
					{params.onCancel && title && (
						<button
							className="close"
							onClick={() => this.exit('Cancel')}
						>×
						</button>)
					}
				</header>
				{children}
				<footer>{
					buttons.map(b => (typeof b !== 'string' ?
						b : (
							<input
								type="button"
								value={b}
								disabled={b === 'OK' && !valid()}
								onClick={() => this.exit(b)}
							/>
						)))
				}
				</footer>
			</form>
		);
	}
}

export default Dialog;
