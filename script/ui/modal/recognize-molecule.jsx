import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';
import api from '../../api'

import Render from '../../render';
import molfile from '../../chem/molfile'

function upload(server, file) {
//function upload(server, app, event) {
    //var file = event.target.files[0];

    var poll = request.then(function (res) {
        imago_result.img_data = res.img_data;
        //m.redraw('imago');
        return api.pollDeferred();
    });

    poll.then(function(res) {
        console.info('upload completed');
        if (res.state === 'SUCCESS') {
            /*imago_result.mol_img = res.metadata.mol_img;
            imago_result.mol_str = res.metadata.mol_str;
            imago_result.transfer_cb = function() { 
                app.ketcher.setMolecule(imago_result.mol_str); 
                m.route('search'); 
            };
            m.redraw('imago');*/
            console.log("Success!!!");
        }
        return true;
    }, function (res) {
        console.info('upload failed', res);
        e.alertMessage(JSON.stringify(res));
    });
    return false;
}



var file;

class RecognizeMolecule extends Component {
    constructor(props) {
        super(props);
        this.state.imgUrl = null;
        this.state.structStr;
    }
    result () {
        return `Yo!`;
    }
    uploadImage(ev) {
        var URL = window.URL || window.webkitURL;
        var imageUrl;
        var image;
        this.file = ev.target.files[0];
        if (URL) {
            imageUrl = URL.createObjectURL(this.file);
            console.info('imageUrl', imageUrl);
            this.setState({
                imgUrl: imageUrl
            })            
            /*image.onload = function() {
                URL.revokeObjectURL(imageUrl);
            };*/
            
        }
        //document.getElementById('recognizeButton').style.display = 'inline';
    }
    recognize() {
        console.info("Recognize");

        //var server = api(api_path);
        this.setState({ sturctStr: 'recognizing' });
        //console.info("Cl: " + JSON.stringify(this.file));
        this.props.server.recognize(this.file).then(res => {
            this.setState({ structStr: molfile.parse(res.struct) });
        })
    }
    renderRes(el) {
        var rnd = new Render(el, 0, {
              'autoScale': true,
              'autoScaleMargin': 0,
              'maxBondLength': 30
        });
        console.info('struct', this.state.structStr)
        rnd.setMolecule(this.state.structStr);
        rnd.update();
    }
    render (props) {
        console.info('hello')
        return (
            <Dialog caption="Import From Image"
                name="recognize-molecule" result={() => this.result() }
                params={this.props}
                buttons={[
                    ( <input id="input" accept="image/*" type="file" onChange={ev => this.uploadImage(ev)}/> ),
                    this.state.imgUrl ? ( <button class="recognize" onClick={ ev => this.recognize(ev) }>Recognize</button>  ) : null,
                    "Cancel", "OK"]}>
                <img id="pic" src={this.state.imgUrl ? this.state.imgUrl : ""} onError={ ev => console.info('error') }/>
                { this.state.structStr ? ( 
                <div className="output">
                {
                  this.state.structStr == 'recognizing' ? ( <strong>Recognizing</strong> ) : ( <div ref={ el => this.renderRes(el) } /> )
                }
                </div> 
                 ) : null }
                <label class="open, block">
                  <input type="checkbox"></input>
                  Load as a fragment and copy to the Clipboard 
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