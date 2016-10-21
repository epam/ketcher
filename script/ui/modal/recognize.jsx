import { h, Component, render } from 'preact';
/** @jsx h */

import api from '../../api';

import Dialog from '../component/dialog';
import StructRender from '../component/structrender';
import Spin from '../component/spin';

class Recognize extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            structStr: null,
            fragment: false
        };
    }
    result () {
		let { structStr, fragment } = this.state;
        return structStr && !(structStr instanceof Promise) ?
            { structStr, fragment } : null;
    }
    uploadImage(ev) {
        this.setState({
            file: ev.target.files[0],
			structStr: null
		});
    }
    url() {
        if (!this.state.file)
            return null;
        var URL = window.URL || window.webkitURL;
        return URL ? URL.createObjectURL(this.state.file) : "No preview";
    }
    recognize() {
        var process = this.props.server.recognize(this.state.file).then(res => {
			this.setState({ structStr: res.struct });
        }, err => {
			this.setState({ structStr: null });
			setTimeout(() => alert("Error! The picture isn't recognized.") , 200); // TODO: remove me...
		});
		this.setState({ structStr: process });
	}
    checkFragment(ev) {
        this.state.fragment = !this.state.fragment;
    }
    imageError(ev) {
		this.setState({ file: null });
		alert("Error, it isn't a picture");
	}
    render () {
		let { file, structStr, fragment } = this.state;
        return (
            <Dialog caption="Import From Image"
                name="recognize" result={() => this.result() }
                params={this.props}
                buttons={[
                    (
						<label className="open">
							Choose file…
							<input onChange={ ev => this.uploadImage(ev) }
								accept="image/*" type="file"/>
						</label>
					),
					<span className="open-filename">{file ? file.name : null}</span>,
                    file && !(structStr instanceof Promise) ? (
						<button onClick={ ev => this.recognize(ev) }>Recognize</button>
					) : null,
                    "Cancel",
                    "OK"
                ]}>
				<div className="picture">
				{
					file ? (
						<img id="pic" src={this.url() || ""}
							 onError={ev => this.imageError(ev)} />
					) : null
				}
			    </div>
				<div className="output">
                {
					structStr ? (
						structStr instanceof Promise ?
							( <Spin/> ) :
							( <StructRender className="struct" struct={structStr} /> )
					) : null
                }
				</div>
				<label>
				  <input type="checkbox" checked={fragment}
					   onClick={ev => this.checkFragment(ev.target)} />
					Load as a fragment
				</label>
            </Dialog>
        );
    }
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <Recognize {...params}/>
    ), overlay);
};
