import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Row} from "../components/Row.react";
import {backendURL} from "../utils";
import "../components/main.css"
import {Detail} from "../components/Detail.react";
import {Search} from "../components/Search.react";
import {Facts} from "../components/Facts.react";
import "./header.css";
import {ShowAllContext, ShowAllProvider} from "../contexts/ShowAllProvider";
import {Edges} from "../components/Edges.react";
import {initialState, nodeReducer, ShownNodesProvider} from "../contexts/ShownNodes";
import {HiddenRulesContext} from "../contexts/HiddenRulesContext";

function ShowAllToggle() {
    const [state, dispatch] = React.useContext(ShowAllContext)
    if (state.show_all) {
        return <input type="checkbox" onClick={() => dispatch({type: "show_all"})} checked/>
    }
    return <input type="checkbox" onClick={() => dispatch({type: "show_all"})}/>

}

function AppHeader() {
    return <div className="header">
        <div id="app_title">
            <span>viASP</span>
            <span id="display_all_toggle_span">Show All:
                <ShowAllToggle/>
        </span>
        </div>
    </div>
}

function loadMyAsyncData() {
    return fetch(`${backendURL("rules")}`).then(r => r.json())
}

function useRules() {

    const [rules, setRules] = useState([])

    useEffect(() => {
        let mounted = true;
        loadMyAsyncData()
            .then(items => {
                if (mounted) {
                    setRules(items)
                }
            })
        return () => mounted = false;
    }, []);
    return rules;

}


export default function ViaspDash(props) {
    const [detail, setDetail] = useState(null)
    const rules = useRules()
    const {setProps} = props;
    const [hiddenRules, setHiddenRules] = useState([]);

    function triggerUpdate(toggle_id) {
        if (hiddenRules.includes(toggle_id)) {
            const updated = hiddenRules.filter(item => item !== toggle_id)
            setHiddenRules(updated)
        } else {
            const updated = [...hiddenRules]
            updated.push(toggle_id)
            setHiddenRules(updated)
        }
    }


    if (rules.length === 0) {
        return <div>Loading..</div>
    }
    return <body>
    <ShowAllProvider>
        <AppHeader/>
        <div className="content">
            <Detail shows={detail} clearDetail={() => setDetail(null)}>
            </Detail>
            <ShownNodesProvider initialState={initialState} reducer={nodeReducer}>
                <HiddenRulesContext.Provider value={[hiddenRules, triggerUpdate]}>
                    <div className="graph_container">
                        <Facts notifyClick={(clickedOn) => {
                            notify(setProps, clickedOn)
                            setDetail(clickedOn.uuid)
                        }}/>
                        {rules.map((transformation) => <Row
                            key={transformation.id}
                            transformation={transformation}
                            notifyClick={(clickedOn) => {
                                notify(setProps, clickedOn)
                                setDetail(clickedOn.uuid)
                            }}/>)}</div>
                    <Search/>
                    {rules.length === 0 ? null : <Edges/>}
                </HiddenRulesContext.Provider>
            </ShownNodesProvider>
        </div>
    </ShowAllProvider>
    </body>
}

function notify(setProps, clickedOn) {
    setProps({node: clickedOn})
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
