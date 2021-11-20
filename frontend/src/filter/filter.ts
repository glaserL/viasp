import {Filter, Model} from "../types";
import {backendURL, make_atoms_string} from "../util";
import {redrawGraph} from "../graph/graph";
import {node} from "webpack";

export function clearFilterPills() {
    const filterPill = document.getElementById("active_filters")
    filterPill.innerHTML = ""
    return fetch(`${backendURL("filter")}`, {
        method: "DELETE"
    }).catch(e => console.error("Couldn't clear the filter pills." + e));
}

function clearFilterPillsAndRedraw() {
    return clearFilterPills().then(redrawGraph);
}


function clearFilterPill(pill: HTMLLIElement, filter: Filter) {
    pill.remove();
    return fetch(`${backendURL("filter")}`, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    }).catch(e => console.error(`Couldn't clear filter pill (filter: ${filter}).` + e));
}

function clearFilterPillAndRedraw(pill: HTMLLIElement, filter: Filter) {
    clearFilterPill(pill, filter);
    redrawGraph();
}

function showShowFilter() {

}

function clearShowFilter() {

}

function createFilterPill(filter: Filter): HTMLLIElement {
    const pill = document.createElement("li")
    pill.classList.add("filter", "search_row")
    pill.onclick = () => clearFilterPillAndRedraw(pill, filter);
    if (filter.on._type === "Transformation") {
        pill.classList.add("search_rule")
    }
    if (filter.on._type === "Node") {
        pill.classList.add("search_set")
    }
    return pill
}

export function showFilterPill(filter: Filter) {
    const target = document.getElementById("active_filters")
    const pill = createFilterPill(filter)

    if (filter.on._type == "Node") {
        const nodeToFilter = filter.on as Model
        fetch(backendURL("node") + "/" + nodeToFilter.uuid)
            .then(r => r.json())
            .then(n => {
                let model = n as Model;
                pill.innerHTML = `${make_atoms_string(model.atoms)}<span class='close'>X</span>`
                target.appendChild(pill);
            })
            .catch(e => console.error(e))
    }

}

export function refreshFiltersFromBackend() {
    fetch(backendURL("filter"))
        .then(r => r.json())
        .then(filters => {
            Array.from(filters).map(showFilterPill)
        })
}
