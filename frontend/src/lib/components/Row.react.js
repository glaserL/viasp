//
import React, {Component} from "react";
import {Node} from "./Node.react";
import {backendURL} from "../utils/index";
import './row.css';
import PropTypes from "prop-types";
import {RowHeader} from "./RowHeader.react";

export class Row extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            externalData: null,
            error: null,
            show: true
        };

        this.onHeaderClick = this.onHeaderClick.bind(this);
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

    onHeaderClick() {
        this.setState({show: !this.state.show});
    }

    render() {
        const {transformation, notifyClick} = this.props;
        if (this.state.externalData === null) {
            return (
                <div className="row_container">
                    <RowHeader rule={transformation.rules}/>
                    <div>Loading Transformations..</div>
                </div>
            )
        }
        if (this.state.show === false) {

            return <div className="row_container">
                <RowHeader onToggle={this.onHeaderClick} rule={transformation.rules}/>
            </div>
        }
        return <div className="row_container">
            <RowHeader onToggle={this.onHeaderClick} rule={transformation.rules}/>
            <div className="row_row">{this.state.externalData.map((child) => <Node key={child.uuid} id={child}
                                                                                   notifyClick={notifyClick}/>)}</div>
        </div>
    }

    loadMyAsyncData() {
        const {transformation} = this.props;
        return fetch(`${backendURL("children")}/?rule_id=${transformation.id}&ids_only=True`).then(r => r.json()).catch(error => this.setState({error}))
    }
}

Row.propTypes = {
    /**
     * The Transformation object to be displayed
     */
    transformation: PropTypes.exact({
        rules: PropTypes.string,
        id: PropTypes.string
    }),

    /**
     * A callback function when the user clicks on the RuleHeader
     */
    notifyClick: PropTypes.func
};

