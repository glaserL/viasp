import {Model} from "../types";
import {backendURL, make_atoms_string} from "../util";
import {redrawGraph} from "../graph/graph";

export function clearFilterPill() {
    const filterPill = document.getElementById("active_filter")
    filterPill.innerHTML = ""
    filterPill.classList.remove("search_set", "search_rule")
    return fetch(`${backendURL("filter")}`, {
        method: "DELETE"
    }).catch(e => console.error("Couldn't redraw graph when clearing filter." + e));
}

function clearFilterPillAndRedraw() {
    return clearFilterPill().then(redrawGraph);
}

export function showFilterPill(uuid: string, type: string) {
    const target = document.getElementById("active_filter")
    target.onclick = clearFilterPillAndRedraw
    if (type == "Node") {
        fetch(backendURL("node") + "/" + uuid)
            .then(r => r.json())
            .then(n => {
                let model = n as Model;
                target.innerHTML = `${make_atoms_string(model.atoms)}<span class='close'>X</span>`
            })
            .catch(e => console.error(e))
    }
}
