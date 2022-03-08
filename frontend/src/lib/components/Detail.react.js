import React from 'react';
import {make_atoms_string} from "../utils/index";
import './detail.css';
import PropTypes from "prop-types";
import {useColorPalette} from "../contexts/ColorPalette";
import {useSettings} from "../contexts/Settings";
import {SIGNATURE, SYMBOL} from "../types/propTypes";
import {IoChevronDown, IoChevronForward, IoCloseSharp} from "react-icons/all";


function DetailSymbolPill(props) {
    const {symbol} = props;
    const colorPalette = useColorPalette();
    return <span className="detail_atom_view_content"
                 style={{
                     backgroundColor: colorPalette.ten.bright,
                     color: colorPalette.sixty.dark
                 }}>{make_atoms_string(symbol)}</span>

}

DetailSymbolPill.propTypes = {
    /**
     * The symbol to display.
     */
    symbol: SYMBOL
}


function DetailForSignature(props) {
    const {signature, symbols} = props;
    const [showChildren, setShowChildren] = React.useState(true);
    const openCloseSymbol = showChildren ? <IoChevronDown/> : <IoChevronForward/>
    return <div>
        <hr/>
        <h3 className="detail_atom_view_heading noselect"
            onClick={() => setShowChildren(!showChildren)}>{openCloseSymbol} {signature.name}/{signature.args}</h3>
        <hr/>
        <div className="detail_atom_view_content_container">
            {showChildren ? symbols.map(symbol => <DetailSymbolPill key={JSON.stringify(symbol)}
                                                                    symbol={symbol}/>) : null}</div>
    </div>
}

DetailForSignature.propTypes =
    {
        /**
         * The signature to display in the header
         */
        signature: SIGNATURE,
        /**
         * The atoms that should be shown for this exact signature
         */
        symbols: PropTypes.arrayOf(SYMBOL)
    }

function loadDataForDetail(uuid, url_provider) {
    return fetch(`${url_provider("detail")}/?uuid=${uuid}`).then(r => r.json())
}

function CloseButton(props) {
    const {onClick} = props;
    return <span style={{'cursor': 'pointer'}} onClick={onClick}><IoCloseSharp size={20}/></span>
}

CloseButton.propTypes =
    {
        /**
         * The function to be called when the button is clicked.
         */
        onClick: PropTypes.func
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
            <h3><CloseButton onClick={clearDetail}/>Stable Models</h3>
            Loading..
        </div>
    }
    return <div id="detailSidebar" style={{backgroundColor: colorPalette.sixty.dark, color: colorPalette.thirty.bright}}
                className="detail">
        <h3><CloseButton onClick={clearDetail}/>Stable Models
        </h3>
        {data.map((resp) =>
            <DetailForSignature key={`${resp[0].name}/${resp[0].args}`} signature={resp[0]} symbols={resp[1]}
                                uuid={shows}/>)}
    </div>
}


Detail.propTypes =
    {
        /**
         * The node to show
         */
        shows: PropTypes.string,

        /**
         * The function that should be called to close the detail again.
         */
        clearDetail: PropTypes.func
    }
