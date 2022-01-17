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
import {ColorPaletteProvider, useColorPalette} from "../contexts/ColorPalette";
import {HighlightedNodeProvider} from "../contexts/HighlightedNode";
import styled from "styled-components";

function useToggleState(toggle_state) {
    let classNameAll = `toggle_part left ${toggle_state.show_all ? "selected" : ""}`;
    let classNameNew = `toggle_part right ${toggle_state.show_all ? "" : "selected"}`;
    useEffect(() => {
        classNameAll = `toggle_part left ${toggle_state.show_all ? "selected" : ""}`;
        classNameNew = `toggle_part right ${toggle_state.show_all ? "" : "selected"}`;
    }, [toggle_state.show_all])
    return [classNameAll, classNameNew]

}

function ShowAllToggle() {
    const [state, dispatch] = React.useContext(ShowAllContext)
    const [classNameAll, classNameNew] = useToggleState(state);
    const colorPalette = useColorPalette();
    return <div>Node text: <span style={{"background-color": colorPalette.sixty}}
                                 className="display_all_toggle_span noselect"
                                 onClick={() => dispatch({type: "show_all"})}>
        <span className={classNameAll} style={state.show_all ? {
            "background-color": colorPalette.ten,
            "color": colorPalette.sixty
        } : null}>All</span>
        <span className={classNameNew} style={state.show_all ? null : {
            "background-color": colorPalette.ten,
            "color": colorPalette.sixty
        }}>New</span>
    </span>
    </div>
}

function Settings() {
    const colorPalette = useColorPalette();
    const [drawnOut, setDrawnOut] = useState(false);
    return <div className="settings noselect">
            <span className="drawler_toggle" style={{"background-color": colorPalette.sixty}}
                  onClick={() => setDrawnOut(!drawnOut)}>{drawnOut ? ">" : "<"}</span>
        <div className="drawer">
            <div className="drawer_content"
                 style={drawnOut ? {
                     "max-width": "500px",
                     "background-color": colorPalette.sixty
                 } : {"max-width": "0px", "background-color": colorPalette.sixty}}>
                <ShowAllToggle/>
            </div>
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
                console.log(`Setting ${items.length} `)
                if (mounted) {
                    setRules(items)
                }
            })
        return () => mounted = false;
    }, []);
    return rules;

}


export default function ViaspDash(props) {
    const [detail, setDetail] = useState("97d217b65b50458a80e62d17773fb4c2")
    const rules = useRules()
    const {setProps, colors} = props;
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
    return <ColorPaletteProvider colorPalette={colors}>
        <HighlightedNodeProvider>
            <ShowAllProvider>
                <Detail shows={detail} clearDetail={() => setDetail(null)}/>
                <div className="content">
                    <ShownNodesProvider initialState={initialState} reducer={nodeReducer}>
                        <HiddenRulesContext.Provider value={[hiddenRules, triggerUpdate]}>
                            <div className="graph_container">
                                <Facts notifyClick={(clickedOn) => {
                                    notify(setProps, clickedOn)
                                    setDetail(clickedOn.uuid)
                                }}/><Settings/>
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
        </HighlightedNodeProvider>
    </ColorPaletteProvider>
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
    setProps: PropTypes.func,
    /**
     * Colors to be used in the application.
     */
    colors: PropTypes.object
};

ViaspDash.defaultProps = {
    colors: {}
}
