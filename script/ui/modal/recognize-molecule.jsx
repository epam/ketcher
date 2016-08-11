import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class RecognizeMolecule extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Recognize Molecule"
                    name="recognize-molecule" params={props.params}
                    result={() => this.result()}>
              <button>Open From File...</button>
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