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
import fs from 'filesaver.js';

class SaveButton extends Component {
	constructor({ filename = 'unnamed', type = 'text/plain', className = '', ...props }) {
		super({ filename, type, className, ...props });
		fileSaver(props.server).then((saver) => {
			this.setState({ saver });
		});
	}

	save(ev) {
		const noop = () => null;
		const { filename, data, type, onSave = noop, onError = noop } = this.props;

		if (this.state.saver && data) {
			try {
				this.state.saver(data, filename, type);
				onSave();
			} catch (e) {
				onError(e);
			}
		}

		ev.preventDefault();
	}

	render() {
		const { children, filename, data, className = 'save-button', ...props } = this.props;

		return (
			<button
				onClick={ev => this.save(ev)}
				className={(!this.state.saver || !data) ? `disabled ${className}` : className}
				{...props}
			>
				{ children }
			</button>
		);
	}
}

function fileSaver(server) {
	return new Promise((resolve, reject) => {
		if (global.Blob && fs.saveAs) {
			resolve((data, fn, type) => {
				const blob = new Blob([data], { type }); // eslint-disable-line no-undef
				fs.saveAs(blob, fn);
			});
		} else if (server) {
			resolve(server.then(() => {
				throw Error("Server doesn't still support echo method");
			}));
		} else {
			reject(new Error('Your browser does not support opening files locally'));
		}
	});
}

export default SaveButton;
