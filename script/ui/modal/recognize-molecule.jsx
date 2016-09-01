import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';
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
            this.state.recognised = true;
            this.setState({struct: molfile.parse(res.struct) });
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
    render (props) {
        return (
            <Dialog caption="Import From Image"
                name="recognize-molecule" result={() => this.result() }
                params={this.props}
                buttons={[
                    ( <input id="input" accept="image/*" type="file" onChange={ev => this.uploadImage(ev)}/> ),
                    this.state.file ? ( <button class="recognize" onClick={ ev => this.recognize(ev) }>Recognize</button>  ) : null,
                    "Cancel",
                    this.state.recognised ? ( "OK" ) : null
                    ]}>
                <div>
                <img id="pic" src={this.state.file ? this.url() : ""} onError={ ev => console.info('error') }/>
                { this.state.struct ? ( 
                <div className="output">
                {
                  this.state.struct == 'recognizing' ? ( <div class="loader"></div> ) : ( <div className="struct" ref={ el => this.renderRes(el) } /> )
                }
                </div> 
                 ) : null }
                </div>
                <label class="open block">
                  <input type="checkbox" onChange={ ev => this.checkFragment(ev) }></input>
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