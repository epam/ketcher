import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class OpenSettings extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Open Settings"
                    name="open-settings" params={props.params}
                    result={() => this.result()}>
              <button>Open From File...</button>
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <OpenSettings params={params}/>
    ), overlay);
};