import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class CalculatedValues extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
		console.info('PROPS', props);
        return (
            <Dialog caption="Calculated Values"
                    name="calc-val" params={props.params}
                    result={() => this.result()} buttons={["Cancel"]}>
              <label>Chemical Formula</label>
              <output>Chemical Formula</output><br />
              <label>Molecular Weight</label>
              <output>Molecular Weight</output><br />
              <label>Exact Mass</label>
              <output>Exact Mass</output><br />
              <label>Elemental Analysis</label>
              <output>Elemental Analysis</output><br />
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <CalculatedValues {...params}/>
    ), overlay);
};
