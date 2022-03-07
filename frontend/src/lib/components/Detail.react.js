import React from 'react';
import {make_atoms_string} from "../utils/index";
import './detail.css';
import PropTypes from "prop-types";
import {useColorPalette} from "../contexts/ColorPalette";
import {useSettings} from "../contexts/Settings";

function DetailSymbolPill(props) {
    const {symbol, uuid} = props;
    const colorPalette = useColorPalette();
    return <span className="detail_atom_view_content"
                 style={{
                     backgroundColor: colorPalette.ten,
                     color: colorPalette.sixty
                 }}>{make_atoms_string(symbol)}</span>

}

function DetailForSignature(props) {
    const [showChildren, setShowChildren] = React.useState(true);
    const {signature, atoms, uuid} = props;
    const openCloseSymbol = showChildren ? "v" : ">"
    return <div>
        <h3 className="detail_atom_view_heading"
            onClick={() => setShowChildren(!showChildren)}>{openCloseSymbol} {signature}</h3>
        {showChildren ? atoms.map(symbol => <DetailSymbolPill key={JSON.stringify(symbol)}
                                                              symbol={symbol} uuid={uuid}/>) : null}
    </div>
}

function loadDataForDetail(uuid, url_provider) {
    return fetch(`${url_provider("model")}?uuid=${uuid}`).then(r => r.json())
}

export function Detail(props) {
    const [data, setData] = React.useState(null);
    const {shows, clearDetail} = props;
    const {backendURL} = useSettings();
    const colorPalette = useColorPalette();
    React.useEffect(() => {
        let mounted = true;
        if (shows !== null) {
            loadDataForDetail(shows, backendURL)
                .then(items => {
                    if (mounted) {
                        setData(items)
                    }
                })
        }
        return () => mounted = false;
    }, [shows])
    if (shows === null) {
        return null;
    }
    if (data === null) {
        return <div id="detailSidebar" className="detail">
            <h3>Stable Models</h3>
            Loading..
        </div>
    }
    return <div id="detailSidebar" style={{backgroundColor: colorPalette.sixty}} className="detail">
        <h3><span aria-hidden="true" onClick={clearDetail} className="closeButton">&times;</span>Stable Models</h3>
        {data.map((resp) =>
            <DetailForSignature key={resp[0]} signature={resp[0]} atoms={resp[1]} uuid={shows}/>)}
    </div>
}


Detail.propTypes = {
    /**
     * The node to show
     */
    shows: PropTypes.string
}
