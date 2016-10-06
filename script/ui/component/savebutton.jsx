import { h, Component } from 'preact';
/** @jsx h */
import fs from 'filesaver.js';

class SaveButton extends Component {
	constructor({filename="unnamed", type="text/plain", className='', ...props}) {
		super({filename, type, className, ...props});
		fileSaver(props.server).then(saver => {
			this.setState({saver});
		});
	}
	save(ev) {
		let noop = () => null;
		let { filename, data, type, onSave=noop, onError=noop } = this.props;
		if (this.state.saver && data)
			try {
				this.state.saver(data, filename, type);
				onSave();
			}
			catch(e) {
				onError(e);
			}
		ev.preventDefault();
	}
	render() {
		let { children, filename, data, className, ...props } = this.props;
		if (!this.state.saver || !data)
			className = `disabled ${className}`;
		return (
			<a download={filename} onClick={ev => this.save(ev)}
			   className={className} {...props}>
				{ children }
			</a>
		);
	}
}

function fileSaver(server) {
	return new Promise((resolve, reject) => {
		if (global.Blob && fs.saveAs) {
			resolve((data, fn, type) => {
				let blob = new Blob([data], { type });
				fs.saveAs(blob, fn);
			});
		} else if (server) {
			resolve(server.then(() => {
				throw "Server doesn't still support echo method";
			}));
		} else
			reject(new Error("Your browser does not support "  +
							 "opening files locally"));
	});
}

export default SaveButton;
