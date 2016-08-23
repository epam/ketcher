import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class CalculatedValues extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Calculated Values"
                    name="calc-val" params={props.params}
                    result={() => this.result()}>
              <button>Hello World!</button>
              <label>Chemical Formula</label>
              <label>Molecular Weight</label>
              <label>Exact Mass</label>
              <label>Elemental Analysis</label>
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <CalculatedValues params={params}/>
    ), overlay);
};
