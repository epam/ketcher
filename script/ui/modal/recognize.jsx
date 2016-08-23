import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class Recognize extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Recognize"
                    name="recognize" params={props.params}
                    result={() => this.result()}>
              <button>Open From File...</button>
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <Recognize params={params}/>
    ), overlay);
};