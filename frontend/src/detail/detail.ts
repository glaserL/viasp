import './style.css';
import {backendURL, make_atoms_string, make_rules_string} from "../util";
import {ClingoSymbol, Model, Rule, Transformation} from "../types";
import {drawEdges, refreshEdges} from "../graph/edges";
import stringify = Mocha.utils.stringify;

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

function clearFaded() {
    Array.from(document.getElementsByClassName("faded")).map(faded => {
        faded.classList.remove("faded")
    })
}

function highlightTrace(s: ClingoSymbol, uuid: string) {
    fetch(`${backendURL("trace")}?uuid=` + uuid, {
        method: "POST",
        body: JSON.stringify(s)
    }).then(r => r.json())
        .then(nodes => {
            const nodeList = nodes as string[]
            Array.from(document.getElementsByClassName("set_container")).map(container => {
                const id = container.id;
                if (!nodeList.includes(id)) {
                    container.classList.add("faded");
                } else {
                    container.classList.remove("faded");
                }
            })
        })
}

function createTogglableDetailDivForAtoms(signature_header: string, symbols: ClingoSymbol[], uuid: string): HTMLElement {
    const container = document.createElement("div")
    const heading = document.createElement("h3")
    heading.classList.add("detail_atom_view_heading")
    heading.style.cursor = "pointer"
    heading.onclick = () => toggleDetailContent(heading)
    const state_span = document.createElement("span")
    state_span.classList.add("detail_atom_view_heading_state")
    state_span.innerHTML = "&or; "
    heading.append(state_span);
    heading.append(document.createTextNode(signature_header)) // TODO: this should be the rule header
    const detail = document.createElement("div")
    // detail.classList.add("detail_atom_view_content")
    for (const s of symbols) {
        const single_detail = document.createElement("span")
        single_detail.classList.add("detail_atom_view_content")
        single_detail.innerText = make_atoms_string(s);
        detail.appendChild(single_detail)
        detail.onclick = () => highlightTrace(s, uuid)
        detail.style.cursor = "pointer"
    }
    // detail.innerText = make_atoms_string(symbols);
    container.append(heading)
    container.append(detail)

    return container;

}

//
// function createTogglableDetailDivForAtoms(header, elem): string {
//
//     return `<div><h3 class="detail_atom_view_heading" onclick="toggleDetailContent(this)">
//     <span class="detail_atom_view_heading_state">&or; </span>${header}</h3><div class="detail_atom_view_content">${make_atoms_string(elem)}</div></div>`
// }

export function showDetail(nodeID: string) {
    if (isClosed("detailSidebar")) {
        openNav();
    }
    clearFaded();
    fetch(`${backendURL("model")}/?uuid=${nodeID}`)
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (data) {
            const sth = data as Array<[string, ClingoSymbol[]]>
            const detail = document.getElementById("detailSidebar");
            detail.innerText = ""
            console.log(data)
            const header = document.createElement("h3")
            header.innerText = "Stable Model"
            header.style.cursor = "pointer"
            header.onclick = closeNav
            const content = document.createElement("p")
            sth.map(elem => createTogglableDetailDivForAtoms(elem[0], elem[1], nodeID)).map(p => content.appendChild(p))

            detail.appendChild(header)
            detail.appendChild(content)

        });
}


function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
    setTimeout(refreshEdges, 100);
}

function closeNav() {
    clearFaded();
    document.getElementById("detailSidebar").style.width = "0"
    setTimeout(refreshEdges, 100);
}

