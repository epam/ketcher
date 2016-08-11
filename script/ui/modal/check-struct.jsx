import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class CheckStruct extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Structure Check"
                    name="check-struct" params={props.params}
                    result={() => this.result()}>
              <button>Hello World!</button>
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <CheckStruct params={params}/>
    ), overlay);
};
