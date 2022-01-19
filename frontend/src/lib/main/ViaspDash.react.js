import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Row} from "../components/Row.react";
import {backendURL} from "../utils";
import "../components/main.css"
import {Detail} from "../components/Detail.react";
import {Search} from "../components/Search.react";
import {Facts} from "../components/Facts.react";
import "./header.css";
import {Edges} from "../components/Edges.react";
import {initialState, nodeReducer, ShownNodesProvider} from "../contexts/ShownNodes";
import {HiddenRulesContext} from "../contexts/HiddenRulesContext";
import {ColorPaletteProvider} from "../contexts/ColorPalette";
import {HighlightedNodeProvider} from "../contexts/HighlightedNode";
import {showError, useMessages, UserMessagesProvider} from "../contexts/UserMessages";
import {Settings} from "../components/settings";
import {UserMessages} from "../components/messages";
import {SettingsProvider} from "../contexts/Settings";

function loadMyAsyncData() {
    return fetch(`${backendURL("rules")}`).then(r => {
        if (r.ok) {
            return r.json()
        }
        throw new Error(r.statusText);

    });
}


function useRules() {
    const [rules, setRules] = useState([])
    const [, dispatch] = useMessages()

    useEffect(() => {
        let mounted = true;
        loadMyAsyncData().catch(error => {
            dispatch(showError(`Failed to get rules: ${error}`))
        })
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


function MainWindow(props) {
    const {callback} = props;
    const [detail, setDetail] = useState(null)
    const rules = useRules()
    const [hiddenRules, setHiddenRules] = useState([]);

    const [, dispatch] = useMessages()
    useEffect(() => {
        fetch(backendURL("/rules")).catch(() => {
            dispatch(showError(`Couldn't connect to server at ${backendURL("")}`))
        })
    }, [])

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

    if (!rules || rules.length === 0) {
        return null
    }
    return <div><Detail shows={detail} clearDetail={() => setDetail(null)}/>
        <div className="content">
            <ShownNodesProvider initialState={initialState} reducer={nodeReducer}>
                <HiddenRulesContext.Provider value={[hiddenRules, triggerUpdate]}>
                    <div className="graph_container">
                        <Facts notifyClick={(clickedOn) => {
                            notify(callback, clickedOn)
                            setDetail(clickedOn.uuid)
                        }}/><Settings/>
                        {rules.map((transformation) => <Row
                            key={transformation.id}
                            transformation={transformation}
                            notifyClick={(clickedOn) => {
                                notify(callback, clickedOn)
                                setDetail(clickedOn.uuid)
                            }}/>)}</div>
                    <Search/>
                    {rules.length === 0 ? null : <Edges/>}
                </HiddenRulesContext.Provider>
            </ShownNodesProvider>
        </div>
    </div>
}

export default function ViaspDash(props) {
    const {setProps, colors} = props;


    return <ColorPaletteProvider colorPalette={colors}>
        <UserMessagesProvider>
            <HighlightedNodeProvider>
                <SettingsProvider>
                    <UserMessages/>
                    <MainWindow callback={setProps}/>
                </SettingsProvider>
            </HighlightedNodeProvider>
        </UserMessagesProvider>
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
