import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';
import api from '../../api.js'

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
    }
    result () {
        return `Yo!`;
    }
    uploadImage(ev) {
        var URL = window.URL || window.webkitURL;
        var imageUrl;
        var image;
        file = ev.target.files[0];
        if (URL) {
            imageUrl = URL.createObjectURL(file);
            this.setState({
                imgUrl: imageUrl
            })            
            /*image.onload = function() {
                URL.revokeObjectURL(imageUrl);
            };*/
            
        }
        //document.getElementById('recognizeButton').style.display = 'inline';
        this.refs.recognizeButton.style.display = 'inline';

    }
    recognize() {
        console.info("Recognize");

        //var server = api(api_path);

        upload( server, file);
    }
    render (props) {
        return (
            <Dialog caption="Import From Image"
                    name="recognize-molecule" params={props.params}
                    result={() => this.result()}>
              <img id="pic" src={this.state.imgUrl ? this.state.imgUrl : ""} />
              <img />
              <label class="open, block">
                 <input type="checkbox"></input>
                 Load as a fragment and copy to the Clipboard 
              </label>
              <input id="input" accept="image/*" type="file" onChange={ev => this.uploadImage(ev)}></input>
              <button type="button" ref="recognizeButton" class="hidden" onclick={this.recognize.bind(this)}>Recognize</button>
            </Dialog>
        );
    }
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <RecognizeMolecule params={params}/>
    ), overlay);
};