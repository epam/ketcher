import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

/*function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    //displayContents(contents);
  };
  reader.readAsText(file);
}

/*function displayContents(contents) {
  var element = document.getElementById('file-content');
  element.innerHTML = contents;
}*/

function readURL(input) {
        if (input.files && input.files[0]) {
            console.log("22222");
            var reader = new FileReader();

            reader.onload = function (e) {
               /* $('#blah')
                    .attr('src', e.target.result)
                    .width(150)
                    .height(200);*/
                    $('#pic').attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
}

class RecognizeMolecule extends Component {
    result () {
        return `Yo!`;
    }
    onChange(event) {
        var URL = window.URL || window.webkitURL;
        var imageUrl,
        image;

        var reader = new FileReader();

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
              <textarea></textarea>
              <img id="pic" src="" />
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