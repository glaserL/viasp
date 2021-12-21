import React, {Component} from "react";
import {backendURL} from "../utils/index";
import LineTo from "react-lineto";
import PropTypes from "prop-types";

export class Edges extends Component {


    constructor(props, context) {
        super(props, context);

        this.state = {
            externalData: null,
            error: null,
        };
    }


    loadMyAsyncData() {
        return fetch(`${backendURL("edges")}`).then(r => r.json())
    }

    render() {
        if (this.state.externalData === null) {
            return <div className="edge_container"/>
        }
        return <div className="edge_container">{this.state.externalData.map(link => <LineTo
            key={link.src + "-" + link.tgt} from={link.src}
            to={link.tgt} zIndex={0}/>)}</div>
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                console.log(`Drawing ${externalData.length} edges.`)
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

Edges.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
