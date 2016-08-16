import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class RecognizeMolecule extends Component {
    result () {
        return `Yo!`;
    }
    onChange(event) {
        var URL = window.URL || window.webkitURL;
        var imageUrl;
        var image;
        var file = document.getElementById('input').files[0];
        if (URL) {
            imageUrl = URL.createObjectURL(file);
            image = document.getElementById("pic");
            image.onload = function() {
                URL.revokeObjectURL(imageUrl);
            };
            image.src = imageUrl;
        }
    }
    render (props) {
        return (
            <Dialog caption="Import From Image"
                    name="recognize-molecule" params={props.params}
                    result={() => this.result()}>
              <img id="pic" src="" />
              <img />
              <label class="open">
                 <input type="checkbox"></input>
                 Load as a fragment and copy to the Clipboard 
              </label>
              <input class="block" id='input' onChange={this.onChange.bind(this)} accept="image/*" type="file"></input>
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