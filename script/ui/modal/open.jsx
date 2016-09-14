import { h, Component, render } from 'preact';
/** @jsx h */

import { map as formatMap } from '../structformat';
import Dialog from '../component/dialog';

var ui = global.ui;

class Open extends Component {
	constructor(props) {
		super(props);
		this.state = {
			structStr: '',
			fragment: false,
			fileOpener: null
		};
		fileOpener(props.server).then(f => {
			this.setState({
				fileOpener: f
			});
		});
	}
	result() {
		return this.state.structStr ? {
			structStr: this.state.structStr,
			fragment: this.state.fragment
		} : null;
	}
	changeStructStr(ev) {
		this.setState({
			structStr: ev.target.value.trim()
		});
	}
	changeFragment(ev) {
		this.setState({
			fragment: ev.target.checked
		});
	}
	open(ev) {
		var files = ev.target.files;
		if (this.state.fileOpener && files.length) {
			this.state.fileOpener(files[0]).then(structStr => {
				this.setState({ structStr });
			}, ui.echo);
		}
		ev.preventDefault();
	}
	accept() {
		return Object.keys(formatMap).reduce((res, key) => (
			res.concat(formatMap[key].mime, ...formatMap[key].ext)
		), []).join(',');
	}
	render () {
		let { structStr, fragment, fileOpener } = this.state;
		return (
			<Dialog caption="Open Structure"
				name="open" result={() => this.result() }
				params={this.props}
				buttons={[(
					<label className="open" disabled={!fileOpener}>
						Open From File…
						<input onChange={ ev => this.open(ev) }
							accept={ this.accept() } type="file"/>
					</label>
				), "Cancel", "OK"]}>
				<textarea value={structStr}
			              onInput={ ev => this.changeStructStr(ev) } />
				<label>
				<input type="checkbox" checked={fragment}
			           onClick={ev => this.changeFragment(ev)} />
				    Load as a fragment
			    </label>
			</Dialog>
		);
	}
}

function fileOpener (server) {
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
		}
		else
			resolve(server.then(() => {
				throw "Server doesn't still support echo method";
				//return resolve(throughForm2IframePosting);
			}, () => {
				throw new Error("Standalone mode!");
			}));
	});
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Open {...params} />
	), overlay);
};
