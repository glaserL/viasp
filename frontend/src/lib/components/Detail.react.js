import React, {useEffect, useState} from 'react';
import {backendURL, make_atoms_string} from "../utils/index";
import './detail.css';
import PropTypes from "prop-types";
import {useColorPalette} from "../contexts/ColorPalette";

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

function loadDataForDetail(uuid) {
    return fetch(`${backendURL("model")}?uuid=${uuid}`).then(r => r.json())
}

export function Detail(props) {
    const [data, setData] = useState(null);
    const {shows, clearDetail} = props;
    const colorPalette = useColorPalette();
    useEffect(() => {
        let mounted = true;
        if (shows !== null) {
            loadDataForDetail(shows)
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
