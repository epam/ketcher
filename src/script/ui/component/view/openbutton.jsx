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

class OpenButton extends Component {
	constructor(props) {
		super(props);
		if (props.server) {
			fileOpener(props.server).then((opener) => {
				this.setState({ opener });
			});
		}
	}

	open(ev) {
		const files = ev.target.files;
		const noop = () => null;
		const { onLoad = noop, onError = noop } = this.props;

		if (this.state.opener && files.length)
			this.state.opener(files[0]).then(onLoad, onError);
		else if (files.length)
			onLoad(files[0]);
		ev.target.value = null;
		ev.preventDefault();
	}

	render() {
		const { children, type, server, className = 'open-button', ...props } = this.props;

		return (
			<button onClick={() => this.btn.click()} className={className} {...props}>
				<input
					onChange={ev => this.open(ev)}
					accept={type}
					type="file"
					ref={(el) => { this.btn = el; }}
				/>
				{ children }
			</button>
		);
	}
}

function fileOpener(server) {
	return new Promise((resolve, reject) => {
		// TODO: refactor return
		if (global.FileReader) {
			resolve(throughFileReader);
		} else if (global.ActiveXObject) {
			try {
				const fso = new ActiveXObject('Scripting.FileSystemObject'); // eslint-disable-line no-undef
				resolve(file => Promise.resolve(throughFileSystemObject(fso, file)));
			} catch (e) {
				reject(e);
			}
		} else if (server) {
			resolve(server.then(() => {
				throw Error("Server doesn't still support echo method");
				// return resolve(throughForm2IframePosting);
			}));
		} else {
			reject(new Error('Your browser does not support opening files locally'));
		}
	});
}

function throughFileReader(file) {
	return new Promise((resolve, reject) => {
		const rd = new FileReader(); // eslint-disable-line no-undef

		rd.onload = () => {
			const content = rd.result;
			if (file.msClose)
				file.msClose();
			resolve(content);
		};

		rd.onerror = (event) => {
			reject(event);
		};

		rd.readAsText(file, 'UTF-8');
	});
}

function throughFileSystemObject(fso, file) {
	// IE9 and below
	const fd = fso.OpenTextFile(file.name, 1);
	const content = fd.ReadAll();
	fd.Close();
	return content;
}

export default OpenButton;
