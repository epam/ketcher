import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import OpenButton from '../component/openbutton'
import SaveButton from '../component/savebutton'
import Accordion from '../component/accordion'
import defaultOptions from './options';
import Render from '../../render'

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.defOpts = defaultOptions();

        this.state = {
            onlyCurrentSession: false
        }

        var opts = this.getDefOpts (this.defOpts);
        opts = Object.assign(opts, props.opts, JSON.parse(localStorage.getItem("ketcher-opts")));
        this.setState({opts: opts});

        this.changeState = this.changeState.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
    }

    getDefOpts (defOpts) {
        var tmp = {};
        for (var i = 0; i < defOpts.length; i++) {
            if (defOpts[i].type === "boolean") {
                this.defOpts[i].values = ["on", "off"];
                if (defOpts[i].defaultValue === true)
                    defOpts[i].defaultValue = "on";
                else
                    defOpts[i].defaultValue = "off";
            }
            tmp[defOpts[i].name] = defOpts[i].defaultValue;
        }

        return tmp;

    }

    result () {
        var opts = {};
        for (var key in this.state.opts) {
          if (this.state.opts.hasOwnProperty(key)) {
            if (this.state.opts[key] === "on")
                opts[key] = true;
            else if (this.state.opts[key] === "off")
                opts[key] = false;
            else
                opts[key] = this.state.opts[key];
          }
        }
        return {
            opts: opts,
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

    changeState(ev) {
         var tmp = {};
         tmp[ev.target.id] = ev.target.value;
		 this.setState(Object.assign(this.state.opts, tmp));
    }

    createSelectList(f, values, type, name, label) {
        var opts = this.state.opts;
        var listComponents = values.map(function(value) {
            return ( <option value={value}> {value} </option>);
        });
        return (
            <li>
				<div> { label } </div>
                <div><select id={name} onChange = { ev => f(ev, name) } value = {this.state.opts[name]}>{listComponents}</select></div>
            </li>
        );
    }

    draw(opts, tab) {
        var state = this.state;
        var changeState = this.changeState;
        var createSelectList = this.createSelectList;
        var optsComponents = opts.map(function(elem) {
            if (elem.tab === tab) {
                return (
                    createSelectList(changeState, elem.values, elem.type, elem.name, elem.label)
                );
            }
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
    	let activeTabs = ['Rendering customization options'];
        return (
            <Dialog caption="Settings"
                    name="open-settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
						 <OpenButton className="open" server={this.props.server}
									 onLoad={ newOpts => this.uploadSettings(newOpts) }>
							 Open From File…
						 </OpenButton>,
						 <SaveButton className="save"
									 data={JSON.stringify(this.state.opts)}
									 filename={'ketcher-settings'} >
							 Save To File…
						 </SaveButton>,
                     <button onClick={ ev => this.reset(ev) }>Reset</button>,
                     "OK", "Cancel"]} >
            <div className="accordion-wrapper">
				<Accordion className="accordion" captions={tabs} activeTabs={activeTabs}>
					<div className="content">
						{ this.draw(this.defOpts, "render") }
					</div>
					<div className="content">
						{ this.draw(this.defOpts, "debug") }
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


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <OpenSettings params={params}/>
    ), overlay);
};
