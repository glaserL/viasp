import {backendURL, make_atoms_string} from "../util";
import {ClingoSymbol, Model} from "../types";
import {drawEdges} from "../graph/edges";

function isClosed(id: string) {
    const width = document.getElementById(id).style.width;
    return width === "" || width === "0px";
}


function toggleDetailContent(container: HTMLElement) {
    const toggleParent = container.parentNode as HTMLElement;
    const thingToToggle = toggleParent.getElementsByClassName("detail_atom_view_content")[0] as HTMLElement;
    const stateSpan = container.getElementsByClassName("detail_atom_view_heading_state")[0];
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "block";
        stateSpan.innerHTML = "&or; "
    } else {
        thingToToggle.style.display = "none";
        stateSpan.innerHTML = "> "
    }
}

function createTogglableDetailDivForAtoms(header: string, elem: ClingoSymbol): HTMLElement {
    const heading = document.createElement("div")
    heading.classList.add("detail_atom_view_heading")
    heading.onclick = () => toggleDetailContent(heading)
    const state_span = document.createElement("span")
    state_span.classList.add("detail_atom_view_heading_state")
    state_span.innerHTML = "&or; "
    heading.appendChild(state_span)
    heading.innerHTML = header;
    const detail = document.createElement("div")
    detail.classList.add("detail_atom_view_content")
    detail.innerText = make_atoms_string(elem);
    return heading;

}

export function showDetail(nodeID: string) {
    if (isClosed("detailSidebar")) {
        openNav();
    }
    fetch(`${backendURL("model")}/?uuid=${nodeID}`)
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (data) {
            const sth = data as Array<[string, ClingoSymbol]>
            const detail = document.getElementById("detailSidebar");
            console.log(data)
            var pretty = sth.map(elem => createTogglableDetailDivForAtoms(elem[0], elem[1])).join("")
            detail.innerHTML = `<h3 onclick="closeNav()">Stable Model</h3><p>${pretty}</p>`
        });
}


function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
    setTimeout(drawEdges, 100);
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
    setTimeout(drawEdges, 100);
}

