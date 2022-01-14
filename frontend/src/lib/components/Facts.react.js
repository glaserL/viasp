import {backendURL} from "../utils/index";
import "./facts.css";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {hideNode, showNode, useShownNodes} from "../contexts/ShownNodes";
import {useColorPalette} from "../contexts/ColorPalette";

function loadFacts() {
    return fetch(`${backendURL("facts")}`).then(r => r.json());
}

export function Facts(props) {

    const {notifyClick} = props;

    const [fact, setFact] = useState(null);
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
                <div>Loading facts..</div>
            </div>
        )
    }
    //
    // return <div className="row_container">
    //     <RowHeader onToggle={() => setHideNodes(!hideNodes)} rule={["<Facts>"]}/>
    //     {hideNodes ? null : <div className="row_row"><Node key={fact.uuid} node={fact}
    //                                                        notifyClick={notifyClick}/>
    //     </div>}
    // </div>
    //
    return <ActualFactThingy fact={fact}/>
}

Facts.propTypes = {
    notify: PropTypes.func
}

function ActualFactThingy(props) {
    const {fact} = props;
    const [, dispatch] = useShownNodes()
    const colorPalette = useColorPalette();

    useEffect(() => {
        dispatch(showNode(fact.uuid))
        return () => {
            dispatch(hideNode(fact.uuid))
        }
    }, [])
    const clazzName = `${fact.uuid} facts_banner noselect`
    return <div className={clazzName}
                style={{"color": colorPalette.sixty, "background-color": colorPalette.ten}}>Facts</div>
}

ActualFactThingy.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,
    fact: PropTypes.exact({
        diff: PropTypes.array,
        atoms: PropTypes.array,
        uuid: PropTypes.string,
        _type: PropTypes.string,
        rule_nr: PropTypes.number
    }),
}
