import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Facts, Row} from "./Row.react";
import {backendURL} from "../../util";
import "./main.css"
import {Edges} from "./Edges.react";
import {Detail} from "./Detail.react";

export default class ViaspDash extends Component {

    constructor(props) {
        super(props);
        this.notify = this.notify.bind(this)

        this.state = {
            externalData: null,
            detail: "9d2f7e5e33de47f7abbc59553f13d049"
        };
    }

    render() {
        if (this.state.externalData === null) {
            return <div>Loading..</div>
        }
        if (this.state.detail === null) {

            return <div className="content">
                <div className="graph_container">
                    <Facts notifyClick={this.notify}/>
                    {this.state.externalData.map((transformation) => <Row
                        key={transformation.id}
                        transformation={transformation}
                        notifyClick={this.notify}/>)}</div>
                {/*<Edges/>*/}
            </div>
        }
        return <div className="content">
            <Detail shows={this.state.detail}>
            </Detail>
            <div className="graph_container">
                <Facts notifyClick={this.notify}/>
                {this.state.externalData.map((transformation) => <Row
                    key={transformation.id}
                    transformation={transformation}
                    notifyClick={this.notify}/>)}</div>
            {/*<Edges/>*/}
        </div>
    }

    notify(clickedOn) {
        // TODO: This should query the database for the actual item.
        const {setProps} = this.props;
        console.log("CLICKED ON " + JSON.stringify(clickedOn))
        // setProps({key: clickedOn, id: clickedOn, node: clickedOn, notifyClick: this.notify})
        setProps({node: clickedOn})
    }

    loadMyAsyncData() {
        return fetch(`${backendURL("rules")}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    componentDidMount() {
        this._asyncRequest = this.loadMyAsyncData().then(
            externalData => {
                this._asyncRequest = null;
                console.log(this.state)
                this.setState({externalData});
                console.log(this.state)
            }
        );
    }

    componentWillUnmount() {
        if (this._asyncRequest) {
            this._asyncRequest.cancel();
        }
    }
}
ViaspDash.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
