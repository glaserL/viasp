import React, {Component, useState} from 'react';
import {backendURL, make_atoms_string} from "../utils/index";
import './detail.css';
import PropTypes from "prop-types";

function DetailSymbolPill(props) {
    const {symbol, uuid} = props;
    return <span className="detail_atom_view_content">{make_atoms_string(symbol)}</span>

}

function DetailForSignature(props) {
    const [showChildren, setShowChildren] = useState(true);
    const {signature, atoms, uuid} = props;
    const openCloseSymbol = showChildren ? "v" : ">"
    return <div>
        <h3 className="detail_atom_view_heading"
            onClick={() => setShowChildren(!showChildren)}>{openCloseSymbol} {signature}</h3>
        {showChildren ? atoms.map(symbol => <DetailSymbolPill key={JSON.stringify(symbol)}
                                                              symbol={symbol} uuid={uuid}/>) : null}
    </div>
}


export class Detail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            externalData: null,
        };
    }

    render() {
        const {shows, clearDetail} = this.props;
        if (shows === null) {
            return null;
        }
        if (this.state.externalData === null) {
            return <div id="detailSidebar" className="detail">
                <h3>Stable Models</h3>
                Loading..
            </div>
        }
        return <div id="detailSidebar" className="detail">
            <h3><span aria-hidden="true" onClick={clearDetail} className="closeButton">&times;</span>Stable Models</h3>
            {this.state.externalData.map((resp) =>
                <DetailForSignature key={resp[0]} signature={resp[0]} atoms={resp[1]} uuid={shows}/>)}
        </div>
    }

    loadMyAsyncData() {
        const {shows} = this.props;
        return fetch(`${backendURL("model")}?uuid=${shows}`).then(r => r.json()).catch(error => this.setState({error}))
    }

    componentDidUpdate(prevProps, prevState) {
        const {shows} = this.props;
        if (shows !== null && prevProps.shows !== shows) {

            this._asyncRequest = this.loadMyAsyncData().then(
                externalData => {
                    this._asyncRequest = null;
                    this.setState({externalData});
                }
            );
        }
    }
}

Detail.propTypes = {
    /**
     * The node to show
     */
    shows: PropTypes.string
}
