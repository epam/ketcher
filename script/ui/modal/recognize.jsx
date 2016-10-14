import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import StructRender from '../component/structrender'
import Spin from '../component/spin'
import api from '../../api';

import molfile from '../../chem/molfile';

class Recognize extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            struct: null,
            fragment: false
        }
    }
    result () {
        return {
            struct: this.state.struct,
            fragment: this.state.fragment
        };
    }
    uploadImage(ev) {
            this.setState({
                file: ev.target.files[0]
            });
    }
    url() {
        if (!this.state.file)
            return null;
        var URL = window.URL || window.webkitURL;
        return URL ? URL.createObjectURL(this.state.file) : "No preview";
    }
    recognize() {
        this.setState({ struct: 'recognizing' });
        this.props.server.recognize(this.state.file).then(res => {
			this.setState({struct: molfile.parse(res.struct) });
        }, err => {
			this.setState({struct: null });
			setTimeout(() => alert("Error! The picture isn't recognized.") , 200); // TODO: remove me...
		})
	}
    checkFragment(ev) {
        this.setState({fragment: !this.state.fragment});
    }
    imageError(ev) {
		this.setState({ file: null });
		alert("Error, it isn't a picture");
	}
    render (props, state) {
        return (
            <Dialog caption="Import From Image"
                name="recognize" result={() => this.result() }
                params={props}
                buttons={[
                    (
						<label className="open">
							Choose file…
							<input onChange={ ev => this.uploadImage(ev) }
								accept="image/*" type="file"/>
						</label>
					),
                    state.file ? ( <button onClick={ ev => this.recognize(ev) }>Recognize</button>  ) : null,
                    "Cancel",
                    (state.struct && state.struct !== 'recognizing') ? ( "OK" ) : null
                ]}>

                <div className="recognize-wrapper">
					<div className="picture">
						{ state.file ? <img id="pic" src={state.file ? this.url() : ""} onError={ ev => this.imageError(ev) } /> : null }
					</div>
					<div className="output">
                	{ 	state.struct ?
							state.struct != 'recognizing'
								? ( <StructRender className="struct" struct={state.struct} /> )
								: ( <Spin/> )
						: null
                	}
					</div>
                </div>
				<label>
				  <input type="checkbox" checked={this.state.fragment}
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
