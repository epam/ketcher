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
		let files = ev.target.files;
		let noop = () => null;
		let { onLoad=noop, onError=noop } = this.props;
		if (this.state.opener && files.length) {
			this.state.opener(files[0]).then(onLoad, onError);
		}
		ev.preventDefault();
	}
	render() {
		let { children, type, ...props } = this.props;
		return (
			<label disabled={ !this.state.opener } { ...props }>
				{ children }
				<input onChange={ ev => this.open(ev) }
				       accept={ type } type="file"/>
			</label>
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
				var fso = new ActiveXObject('Scripting.FileSystemObject');
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
		var rd = new FileReader();
		rd.onload = event => {
			var content = rd.result;
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
	var fd =  fso.OpenTextFile(file.name, 1),
	content = fd.ReadAll();
	fd.Close();
	return content;
}

export default OpenButton;
