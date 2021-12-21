import {backendURL} from "../utils/index";
import {RowHeader} from "./RowHeader.react";
import {Node} from "./Node.react";
import React from "react";
import {Row} from "./Row.react";
import PropTypes from "prop-types";

export class Facts extends Row {

    constructor(props, context) {
        super(props, context);
    }

    loadMyAsyncData() {
        return fetch(`${backendURL("facts")}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    render() {
        const {notifyClick} = this.props;
        if (this.state.externalData === null) {
            return (
                <div className="row_container">
                    <RowHeader rule={"<Facts>"}/>
                    <div>Loading Transformations..</div>
                </div>
            )
        }
        if (this.state.show === false) {
            return <div className="row_container">
                <RowHeader onToggle={this.onHeaderClick} rule={"<Facts>"}/>
            </div>
        }
        const fact = this.state.externalData
        return <div className="row_container">
            <RowHeader onToggle={this.onHeaderClick} rule={"<Facts>"}/>
            <div className="row_row"><Node key={fact.uuid} id={fact}
                                           notifyClick={notifyClick}/>
            </div>
        </div>
    }
}

Facts.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
