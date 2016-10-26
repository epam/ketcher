import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import OpenButton from '../component/openbutton';
import SaveButton from '../component/savebutton';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts'
import defaultOptions from './options';

class Settings extends Component {
     constructor(props) {
        super(props);
        this.defOpts = defaultOptions();

        this.state = {
            onlyCurrentSession: false
        };

        var opts = this.getDefOpts(this.defOpts);
        opts = Object.assign(opts, props.opts, JSON.parse(localStorage.getItem("ketcher-opts")));
        this.setState({opts: opts});

        this.changeState = this.changeState.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
    }

    getDefOpts(defOpts) {
        var tmp = {};
        for (var i = 0; i < defOpts.length; i++) {
            tmp[defOpts[i].name] = defOpts[i].defaultValue;
        }
        return tmp;
    }

    result () {
        return {
            opts: this.state.opts,
            localStorageOpts: this.state.opts,
            onlyCurrentSession: this.state.onlyCurrentSession
        };
    }

    uploadSettings(newOpts) {
    	try {
			let userOpts = JSON.parse(newOpts);
			let currentState = Object.assign(this.state.opts, userOpts);
			this.setState({
				opts: currentState
			});
		} catch (ex) {
			console.info('Bad file');
		}
    }

    changeState(name, value) {
         var tmp = {};
         tmp[name] = value;
		 this.setState(Object.assign(this.state.opts, tmp));
    }

    createSelectList(elem) {
		let change = this.changeState;
    	let {values, type, name, label} = elem;
		if (name == 'font')
			return (
				<li>
					<div> { label } </div>
					<div><SystemFonts current={this.state.opts.font} onChange={ev => change(name, '30px ' + ev.target.value)}/></div>
				</li>
			);
		if (type == 'boolean')
			return (
				<li>
					<div> { label } </div>
					<div><SelectCheck name={ name } onChange={ change } value={ this.state.opts[name] }/></div>
				</li>
			);
        let listComponents = values.map(function(value) {
            return ( <option value={value}> {value} </option>);
        });
        return (
            <li>
				<div> { label } </div>
                <div><select onChange = { ev => change(name, ev.target.value) } value = {this.state.opts[name]}>{listComponents}</select></div>
            </li>
        );
    }

    draw(tab) {
        var createSelectList = this.createSelectList;
        var optsComponents = this.defOpts.map(function(elem) {
            if (elem.tab === tab)
                return createSelectList(elem);
        });
        return <ul> {optsComponents} </ul>;
    }

    reset(ev) {
        var opts = this.getDefOpts (this.defOpts);
        this.setState({opts: opts});
    }

    apply(ev) {
        this.setState({onlyCurrentSession: true});
    }

    render (props, state) {
    	let tabs = ['Rendering customization options', 'Options for debugging'];
    	let activeTabs = {'0': true , '1': false};
        return (
            <Dialog caption="Settings"
                    name="settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
						 <OpenButton className="open" server={this.props.server}
									 onLoad={ newOpts => this.uploadSettings(newOpts) }>
							 Open From File…
						 </OpenButton>,
						 <SaveButton className="save" data={JSON.stringify(this.state.opts)}
									 filename={'ketcher-settings'} >
							 Save To File…
						 </SaveButton>,
                     <button onClick={ ev => this.reset(ev) }>Reset</button>,
                     "OK", "Cancel"]} >
            <div className="accordion-wrapper">
				<Accordion className="accordion" captions={tabs} active={activeTabs}>
					<div className="content">
						{ this.draw("render") }
					</div>
					<div className="content">
						{ this.draw("debug") }
					</div>
				</Accordion>
				<label className="current">
					<input type="checkbox" onChange={ ev => this.apply(ev) }></input>
					Apply settings only for current session
				</label>
            </div>
            </Dialog>
        );
    }
}

function SelectCheck({ name, value, onChange }) {
	return (
		<select onChange={ev => onChange(name, ev.target.value == "on") } value={value ? "on" : "off"}>
			<option>on</option>
			<option>off</option>
		</select>
	);
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <Settings params={params}/>
    ), overlay);
};
