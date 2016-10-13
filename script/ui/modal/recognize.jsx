import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import api from '../../api';

import Render from '../../render';
import molfile from '../../chem/molfile';

class RecognizeMolecule extends Component {
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
    renderRes(el) {
        var rnd = new Render(el, 0, {
              'autoScale': true,
              'autoScaleMargin': 0,
              'maxBondLength': 30
        });
        rnd.setMolecule(this.state.struct);
        rnd.update();
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
                name="recognize-molecule" result={() => this.result() }
                params={props}
                buttons={[
                    ( <div className="choose-wrapper">
						<div className="choose-file">
							<input id="input" type="file" accept="image/*" onChange={ev => this.uploadImage(ev)}/>
							<label for="input">Choose file ...</label>
						</div>
						<span>{state.file? state.file.name : ''}</span>
					</div> ),
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
								? ( <div className="struct" ref={ el => this.renderRes(el) } /> )
								: ( <div className="loader"></div> )
						: null
                	}
					</div>
                </div>
                <label className="open block">
                  <input type="checkbox" onChange={ ev => this.checkFragment(ev) }/>
                  Load as a fragment
                </label>
            </Dialog>
        );
    }
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <RecognizeMolecule {...params}/>
    ), overlay);
};
