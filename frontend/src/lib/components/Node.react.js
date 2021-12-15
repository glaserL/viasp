import React, {Component} from "react";
import {backendURL} from "./util";
import {make_atoms_string} from "./util";
import {Line} from "react-lineto";
import './node.css'

export class Node extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            externalData: null,
            error: null,
        };
    }

    loadMyAsyncData() {
        const {id} = this.props;
        return fetch(`${backendURL("node")}/${id.uuid}`).then(r => r.json())
    }

    render() {
        if (this.state.externalData === null) {
            return <div>..</div>
        }
        const {notifyClick} = this.props;
        let atomString = make_atoms_string(this.state.externalData.diff)
        atomString = atomString.length === 0 ? "Ø" : atomString;
        const classNames = `set_container ${this.state.externalData.uuid}`
        return <div className={classNames} onClick={() => notifyClick(this.state.externalData)}>
            <div className={"set_value"}>{atomString}</div>
        </div>
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                this.setState({externalData});
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }
}

