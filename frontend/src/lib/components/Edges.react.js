import React from "react";
import LineTo from "react-lineto";
import PropTypes from "prop-types";
import useResizeObserver from "@react-hook/resize-observer";
import {useShownNodes} from "../contexts/ShownNodes";
import {useSettings} from "../contexts/Settings";
import {useFilters} from "../contexts/Filters";

function loadEdges(shownNodes, backendURL) {
    return fetch(`${backendURL("graph/edges")}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shownNodes)
    }).then(r => r.json());
}

const useResize = (target) => {
    const [size, setSize] = React.useState()

    React.useLayoutEffect(() => {
        setSize(target.current.getBoundingClientRect())
    }, [target])

    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}

export function Edges() {
    const [edges, setEdges] = React.useState([]);
    const target = React.useRef(null)
    useResize(target)
    const [{shownNodes},] = useShownNodes()
    const {state, backendURL} = useSettings()
    const [{activeFilters},] = useFilters();

    React.useEffect(() => {
        let mounted = true;

        loadEdges(shownNodes, backendURL)
            .then(items => {
                if (mounted) {
                    console.log("SETTING items")
                    console.log(items)
                    setEdges(items)
                }
            })
        return () => mounted = false;
    }, [shownNodes, state, activeFilters]);

    return <div ref={target} className="edge_container">{edges.map(link => <LineTo
        key={link.src + "-" + link.tgt} from={link.src} fromAnchor={"bottom center"} toAnchor={"top center"}
        to={link.tgt} zIndex={-1} borderColor={"black"} borderStyle={"solid"} borderWidth={1}/>)}</div>
}

Edges.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
