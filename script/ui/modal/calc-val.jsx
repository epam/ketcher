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
                    result={() => this.result()} buttons={["Cancel"]}>
              <label>Chemical Formula</label>
              <input type="text"></input><br />
              <label>Molecular Weight</label>
              <input type="text"></input><br />
              <label>Exact Mass</label>
              <input type="text"></input><br />
              <label>Elemental Analysis</label>
              <input type="text"></input><br />
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
