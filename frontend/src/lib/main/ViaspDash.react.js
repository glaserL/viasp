import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Row} from "../components/Row.react";
import "../components/main.css"
import {Detail} from "../components/Detail.react";
import {Search} from "../components/Search.react";
import {Facts} from "../components/Facts.react";
import "./header.css";
import {Edges} from "../components/Edges.react";
import {initialState, nodeReducer, ShownNodesProvider} from "../contexts/ShownNodes";
import {RulesProvider, useRules} from "../contexts/rules";
import {ColorPaletteProvider} from "../contexts/ColorPalette";
import {HighlightedNodeProvider} from "../contexts/HighlightedNode";
import {showError, useMessages, UserMessagesProvider} from "../contexts/UserMessages";
import {Settings} from "../components/settings";
import {UserMessages} from "../components/messages";
import {DEFAULT_BACKEND_URL, SettingsProvider, useSettings} from "../contexts/Settings";
import {FilterProvider} from "../contexts/Filters";


function GraphContainer(props) {
    const {setDetail, callback} = props;
    const {state: {rules}} = useRules()
    return <div className="graph_container">
        <Facts notifyClick={(clickedOn) => {
            notify(callback, clickedOn)
            setDetail(clickedOn.uuid)
        }}/><Settings/>
        {rules.map(({rule}) => <Row
            key={rule.id}
            transformation={rule}
            notifyClick={(clickedOn) => {
                notify(callback, clickedOn)
                setDetail(clickedOn.uuid)
            }}/>)}</div>

}

function MainWindow(props) {
    const {callback} = props;
    const [detail, setDetail] = useState(null)
    const {backendURL} = useSettings();
    const {state: {rules}} = useRules()

    const [, dispatch] = useMessages()
    useEffect(() => {
        fetch(backendURL("/rules")).catch(() => {
            dispatch(showError(`Couldn't connect to server at ${backendURL("")}`))
        })
    }, [])

    if (!rules || rules.length === 0) {
        return null
    }
    return <div><Detail shows={detail} clearDetail={() => setDetail(null)}/>
        <div className="content">
            <ShownNodesProvider initialState={initialState} reducer={nodeReducer}>
                <Search/>
                <GraphContainer setDetail={setDetail} callback={callback}/>
                {
                    rules.length === 0 ? null : <Edges/>
                }
            </ShownNodesProvider>
        </div>
    </div>
}

export default function ViaspDash(props) {
    const {id, setProps, backendURL, colors} = props;


    return <div id={id}>
        <ColorPaletteProvider colorPalette={colors}>
            <UserMessagesProvider>
                <HighlightedNodeProvider>
                    <FilterProvider>
                        <SettingsProvider backendURL={backendURL}>
                            <RulesProvider>
                                <UserMessages/>
                                <MainWindow callback={setProps}/>
                            </RulesProvider>
                        </SettingsProvider>
                    </FilterProvider>
                </HighlightedNodeProvider>
            </UserMessagesProvider>
        </ColorPaletteProvider>
    </div>
}

function notify(setProps, clickedOn) {
    setProps({clickedOn: clickedOn})
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
    colors: PropTypes.object,
    /**
     *
     */
    clickedOn: PropTypes.object,

    /**
     *
     */
    backendURL: PropTypes.string
};

ViaspDash.defaultProps = {
    colors: {},
    backendURL: DEFAULT_BACKEND_URL
}
