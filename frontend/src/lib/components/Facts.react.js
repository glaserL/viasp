import {backendURL} from "../utils/index";
import {RowHeader} from "./RowHeader.react";
import {Node} from "./Node.react";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

function loadFacts() {
    return fetch(`${backendURL("facts")}`).then(r => r.json());
}

export function Facts(props) {

    const {notifyClick} = props;

    const [fact, setFact] = useState(null);
    const [hideNodes, setHideNodes] = useState(false);

    useEffect(() => {
        let mounted = true;
        loadFacts()
            .then(items => {
                if (mounted) {
                    setFact(items)
                }
            })
        return () => mounted = false;
    }, []);
    if (fact === null) {
        return (
            <div className="row_container">
                <RowHeader rule={["<Facts>"]}/>
                <div>Loading Transformations..</div>
            </div>
        )
    }

    return <div className="row_container">
        <RowHeader onToggle={() => setHideNodes(!hideNodes)} rule={["<Facts>"]}/>
        {hideNodes ? null : <div className="row_row"><Node key={fact.uuid} node={fact}
                                                           notifyClick={notifyClick}/>
        </div>}
    </div>
}

Facts.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
