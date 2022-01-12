import React, {useContext, useEffect, useRef, useState} from "react";
import {Node} from "./Node.react";
import {backendURL} from "../utils/index";
import './row.css';
import PropTypes from "prop-types";
import {RowHeader} from "./RowHeader.react";
import {HiddenRulesContext} from "../main/ViaspDash.react";

function loadMyAsyncData(id) {
    return fetch(`${backendURL("children")}/?rule_id=${id}&ids_only=True`).then(r => r.json());
}

export function Row(props) {
    const [nodes, setNodes] = useState(null);
    const [isOverflowH, setIsOverflowH] = useState(false);
    const [overflowBreakingPoint, setOverflowBreakingPoint] = useState(null);
    const {transformation, notifyClick} = props;
    const ref = useRef(null);
    const {hiddenRules, triggerUpdate} = useContext(HiddenRulesContext);
    useEffect(() => {
        let mounted = true;
        loadMyAsyncData(transformation.id)
            .then(items => {
                if (mounted) {
                    setNodes(items)
                }
            })
        return () => mounted = false;
    }, []);

    function checkForOverflow() {
        if (ref !== null && ref.current) {
            const e = ref.current
            const wouldOverflowNow = e.offsetWidth < e.scrollWidth;
            // We overflowed previously but not anymore
            if (overflowBreakingPoint <= e.offsetWidth) {
                setIsOverflowH(false);
            }
            if (!isOverflowH && wouldOverflowNow) {
                // We have to react to overflow now but want to remember when we'll not overflow anymore
                // on a resize
                setOverflowBreakingPoint(e.offsetWidth)
                setIsOverflowH(true)
            }
            // We never overflowed and also don't now
            if (overflowBreakingPoint === null && !wouldOverflowNow) {
                setIsOverflowH(false);
            }
        }
    }

    useEffect(() => {
        window.addEventListener('resize', checkForOverflow)
        return _ => window.removeEventListener('resize', checkForOverflow)
    })
    if (nodes === null) {
        return (
            <div className="row_container">
                <RowHeader rule={transformation.rules}/>
                <div>Loading Transformations..</div>
            </div>
        )
    }
    const hideNodes = hiddenRules.includes(transformation.id)
    return <div className="row_container">
        <RowHeader onToggle={() => triggerUpdate(transformation.id)} rule={transformation.rules}/>
        {hideNodes ? null :
            <div ref={ref} className="row_row">{nodes.map((child) => <Node key={child.uuid} node={child}
                                                                           showMini={isOverflowH}
                                                                           notifyClick={notifyClick}/>)}</div>
        }</div>
}


Row.propTypes = {
    /**
     * The Transformation object to be displayed
     */
    transformation: PropTypes.exact({
        _type: PropTypes.string,
        rules: PropTypes.array,
        id: PropTypes.number
    }),

    /**
     * A callback function when the user clicks on the RuleHeader
     */
    notifyClick: PropTypes.func
};

