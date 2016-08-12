import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class RecognizeMolecule extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Import From Image"
                    name="recognize-molecule" params={props.params}
                    result={() => this.result()}>
              <textarea></textarea>
              <textarea></textarea>
              <label class="open">
                 <input type="checkbox" name="fragment"></input>
                 Load as a fragment and copy to the Clipboard 
              </label>
              <input class="block" accept="" type="file"></input>
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