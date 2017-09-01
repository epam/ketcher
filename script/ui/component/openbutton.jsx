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

class OpenButton extends Component {
	constructor(props) {
		super(props);
		fileOpener(props.server).then(opener => {
			this.setState({opener});
		});
	}

	open(ev) {
		const files = ev.target.files;
		const noop = () => null;
		const { onLoad = noop, onError = noop } = this.props;

		if (this.state.opener && files.length) {
			this.state.opener(files[0]).then(onLoad, onError);
		}
		ev.target.value = null;
		ev.preventDefault();
	}

	render() {
		const { children, type, ...props } = this.props;

		return (
			<div { ...props }>
				<input id="input-file" onChange={ ev => this.open(ev) }
					   accept={ type } type="file"/>
				<label for="input-file" disabled={ !this.state.opener }>
					{ children }
				</label>
			</div>
		);
	}
}

function fileOpener (server) {
	return new Promise((resolve, reject) => {
		// TODO: refactor return
		if (global.FileReader)
			resolve(throughFileReader);

		else if (global.ActiveXObject) {
			try {
				const fso = new ActiveXObject('Scripting.FileSystemObject');
				resolve(file => Promise.resolve(throughFileSystemObject(fso, file)));
			} catch (e) {
				reject(e);
			}
		} else if (server) {
			resolve(server.then(() => {
				throw "Server doesn't still support echo method";
				//return resolve(throughForm2IframePosting);
			}));
		} else
			reject(new Error("Your browser does not support "  +
							 "opening files locally"));
	});
}

function throughFileReader(file) {
	return new Promise((resolve, reject) => {
		const rd = new FileReader();

		rd.onload = () => {
			const content = rd.result;
			if (file.msClose)
				file.msClose();
			resolve(content);
		};

		rd.onerror = event => {
			reject(event);
		};

		rd.readAsText(file, 'UTF-8');
	});
}

function throughFileSystemObject(fso, file) {
	// IE9 and below
	const fd =  fso.OpenTextFile(file.name, 1),
	content = fd.ReadAll();
	fd.Close();
	return content;
}

export default OpenButton;
