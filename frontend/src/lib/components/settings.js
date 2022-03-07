import React, {useEffect, useState} from "react";
import {useColorPalette} from "../contexts/ColorPalette";
import {setBackendURL, toggleShowAll, useSettings} from "../contexts/Settings";
import {GoCheck, GoStop} from "react-icons/all";
import {IconContext} from "react-icons";

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
    const {state, dispatch} = useSettings()
    const [classNameAll, classNameNew] = useToggleState(state);
    const colorPalette = useColorPalette();
    return <div>Node text: <span style={{backgroundColor: colorPalette.sixty}}
                                 className="display_all_toggle_span noselect"
                                 onClick={() => dispatch(toggleShowAll())}>
        <span className={classNameAll} style={state.show_all ? {
            backgroundColor: colorPalette.ten,
            "color": colorPalette.sixty
        } : null}>All</span>
        <span className={classNameNew} style={state.show_all ? null : {
            backgroundColor: colorPalette.ten,
            "color": colorPalette.sixty
        }}>New</span>
    </span>
    </div>
}


function BackendURLSetting() {

    const {state, dispatch, backendURL} = useSettings()
    const [input, setInput] = useState(state.backend_url)
    const [backendReachable, setBackendReachable] = useState(true)

    const handleChange = (event) => setInput(event.target.value)

    useEffect(() => {
        // TODO: make a proper health check endpoint
        fetch(backendURL("ping")).then(() => {
            setBackendReachable(true)
        }).catch(() => {
            setBackendReachable(false)
        })
    }, [state.backend_url])

    function handleSubmit(event) {
        dispatch(setBackendURL(input))
        event.preventDefault();
    }

    return <div>
        <h3>Backend</h3>
        <form onSubmit={handleSubmit}>
            <label>
                URL:
                <input type="text" value={input} onChange={handleChange}/>
            </label>
            <input type="submit" value="Save"/>
        </form>
        <div>Health: {backendReachable ?
            <IconContext.Provider value={{color: "green"}}><GoCheck/></IconContext.Provider> :
            <IconContext.Provider value={{color: "red"}}><GoStop/></IconContext.Provider>}</div>

    </div>
}

export function Settings() {
    const colorPalette = useColorPalette();
    const [drawnOut, setDrawnOut] = useState(true);
    return <div className="settings noselect">
                <span className="drawler_toggle" style={{backgroundColor: colorPalette.sixty}}
                      onClick={() => setDrawnOut(!drawnOut)}>{drawnOut ? ">" : "<"}</span>
        <div className="drawer">
            <div className="drawer_content"
                 style={drawnOut ? {
                     maxWidth: "500px",
                     backgroundColor: colorPalette.sixty
                 } : {maxWidth: "0px", backgroundColor: colorPalette.sixty}}>
                <ShowAllToggle/>
                <BackendURLSetting/>
            </div>
        </div>
    </div>
}
