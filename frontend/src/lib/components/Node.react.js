import React, {useEffect, useRef, useState} from "react";
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
    const containerNames = `set_container ${overflowV ? "set_too_high" : ""}`

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
    const ref = useRef(null);

    function checkForOverflow() {
        if (ref.current) {
            const e = ref.current
            setIsOverflowV(e.offsetHeight > 100)
        }
    }

    useEffect(() => {
        checkForOverflow()
    }, [state.show_all])
    useEffect(() => {
        window.addEventListener('resize', checkForOverflow)
        return _ => window.removeEventListener('resize', checkForOverflow)
    })

    const classNames = `node_border mouse_over_shadow ${node.uuid}`
    return <div className={classNames} onClick={() => notifyClick(node)}>
        {showMini ? <div className={"node_border mini"}>{node.atoms.length}</div> :
            <div ref={ref}><NodeContent overflowV={isOverflowV} node={node}/></div>}
        {isOverflowV ? <div className={"bauchbinde"}>+{node.atoms.length}</div> : null}
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

