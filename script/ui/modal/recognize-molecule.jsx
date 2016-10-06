import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import api from '../../api'

import Render from '../../render';
import molfile from '../../chem/molfile'

class RecognizeMolecule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            struct: null,
            fragment: false,
            recognised: false
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
        	if (res.struct != "error") {
				this.state.recognised = true;
				this.setState({struct: molfile.parse(res.struct) });
			} else {
				this.setState({struct: 'error' });
			}
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
    render (props, state) {
        return (
            <Dialog caption="Import From Image"
                name="recognize-molecule" result={() => this.result() }
                params={props}
                buttons={[
                    ( <input id="input" accept="image/*" type="file" onChange={ev => this.uploadImage(ev)}/> ),
                    state.file ? ( <button className="recognize" onClick={ ev => this.recognize(ev) }>Recognize</button>  ) : null,
                    "Cancel",
                    (state.struct && state.struct !== 'recognizing') ? ( "OK" ) : null
                    ]}>
                <div>
					<div className="picture">
                		<img id="pic" src={state.file ? this.url() : ""} onError={ ev => console.info('error') } />
					</div>
                { state.struct ? (
					<div className="output">
					{
						state.struct != 'error' ?
							state.struct != 'recognizing'
								? ( <div className="struct" ref={ el => this.renderRes(el) } /> )
								: ( <div className="loader"></div> )
							: ( <div className="recognize-error">Error</div> )
					}
					</div>
                 ) : null }
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
