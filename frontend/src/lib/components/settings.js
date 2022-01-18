import {useColorPalette} from "../contexts/ColorPalette";
import React, {useEffect, useState} from "react";
import {ShowAllContext} from "../contexts/ShowAllProvider";

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

export function Settings() {
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
