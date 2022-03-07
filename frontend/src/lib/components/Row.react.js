import React from "react";
import {Node} from "./Node.react";
import './row.css';
import PropTypes from "prop-types";
import {RowHeader} from "./RowHeader.react";
import {toggleTransformation, useTransformations} from "../contexts/transformations";
import {useSettings} from "../contexts/Settings";

function loadMyAsyncData(id, backendURL) {
    return fetch(`${backendURL("children")}/?rule_id=${id}&ids_only=True`).then(r => r.json());
}

export function Row(props) {
    const [nodes, setNodes] = React.useState(null);
    const [isOverflowH, setIsOverflowH] = React.useState(false);
    const [overflowBreakingPoint, setOverflowBreakingPoint] = React.useState(null);
    const {transformation, notifyClick} = props;
    const ref = React.useRef(null);
    const {state: {transformations}, dispatch} = useTransformations();
    const {backendURL} = useSettings();
    React.useEffect(() => {
        let mounted = true;
        loadMyAsyncData(transformation.id, backendURL)
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

    React.useEffect(() => {
        window.addEventListener('resize', checkForOverflow)
        return _ => window.removeEventListener('resize', checkForOverflow)
    })
    if (nodes === null) {
        return (
            <div className="row_container">
                <RowHeader transformation={transformation.rules}/>
                <div>Loading Transformations..</div>
            </div>
        )
    }
    const showNodes = transformations.find(({transformation: t, shown}) => transformation.id === t.id && shown)
    return <div className="row_container">
        <RowHeader onToggle={() => dispatch(toggleTransformation(transformation))} transformation={transformation.rules}
                   contentIsShown={showNodes}/>
        {!showNodes ? null :
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

