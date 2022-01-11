import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {make_atoms_string} from "../utils/index";
import './node.css'
import PropTypes from "prop-types";
import {ShowAllContext} from "../contexts/ShowAllProvider";


function Symbol(props) {
    const {symbol} = props;
    let atomString = make_atoms_string(symbol)
    atomString = atomString.length === 0 ? "Ø" : atomString;
    return <div className={"symbol"}>{atomString}</div>
}

Symbol.propTypes = {
    symbol: PropTypes.array
}

function NodeContent(props) {

    const [state] = React.useContext(ShowAllContext)
    const {overflowV, node} = props;
    let contentToShow;
    if (state.show_all) {
        contentToShow = node.atoms;
    } else {
        contentToShow = node.diff;
    }
    const classNames2 = `set_value`
    const containerNames = `set_container `

    const renderedSymbols = contentToShow.map(s => {
        return <Symbol key={JSON.stringify(s)} symbol={s}/>
    })
    return <div className={containerNames}>
        <div className={classNames2}>{renderedSymbols.length > 0 ? renderedSymbols : "Ø"}</div>
    </div>
}

NodeContent.propTypes = {
    node: PropTypes.exact({
        diff: PropTypes.array,
        atoms: PropTypes.array,
        uuid: PropTypes.string,
        _type: PropTypes.string,
        rule_nr: PropTypes.number
    }),
    overflowV: PropTypes.bool
}

export function Node(props) {
    const [state] = React.useContext(ShowAllContext)
    const [isOverflowV, setIsOverflowV] = useState(false);
    const {node, notifyClick, showMini} = props;

    const ref = useCallback(x => {
        if (x !== null) {
            setIsOverflowV(x.scrollHeight > x.offsetHeight + 2);
        }
    }, []);


    const classNames = `node_border mouse_over_shadow ${node.uuid}`
    return <div className={classNames} onClick={() => notifyClick(node)}>
        {showMini ? <div className={"mini"}>{node.atoms.length}</div> :
            <div className={"set_too_high"} ref={ref}><NodeContent overflowV={isOverflowV} node={node}/></div>}
        {!showMini && isOverflowV ? <div className={"bauchbinde"}>...</div> : null}
    </div>
}

Node.propTypes = {
    node: PropTypes.exact({
        diff: PropTypes.array,
        atoms: PropTypes.array,
        uuid: PropTypes.string,
        _type: PropTypes.string,
        rule_nr: PropTypes.number
    }),
    notifyClick: PropTypes.func,
    showMini: PropTypes.bool
}

