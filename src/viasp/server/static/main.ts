import {printFun} from "./thisisfun";
import {backendURL} from "../../../../frontend/src/util";

class Signature {
    name: String;
    args: number;
}

class State {
    private cache: Map<String, any>;

    getFilter(): Signature {
        if (this.cache.has("FILTER")) {
            return this.cache.get("FILTER");
        }
    }

    clearFilter() {
        if ((this.cache.has("FILTER"))) {
            this.cache.delete("FILTER");
        }
    }

    setFilter(signature: Signature) {
        this.cache.set("FILTER", signature);
    }
}

const STORAGE = State


function toggleDetailContent(container) {
    const thingToToggle = container.parentNode.getElementsByClassName("detail_atom_view_content")[0];
    const stateSpan = container.getElementsByClassName("detail_atom_view_heading_state")[0];
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "block";
        stateSpan.innerHTML = "&or; "
    } else {
        thingToToggle.style.display = "none";
        stateSpan.innerHTML = "> "
    }
}

function isClosed(id) {
    const width = document.getElementById(id).style.width;
    return width === "" || width === "0px";
}


function showDetail(node) {
    if (isClosed("detailSidebar")) {
        openNav();
    }
    fetch(`${backendURL("model")}/?uuid=${node.id}`)
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (data) {
            const detail = document.getElementById("detailSidebar");
            console.log(data)
            var pretty = data.map(elem => createTogglableDetailDivForAtoms(elem[0], elem[1])).join("")
            detail.innerHTML = `<h3 onclick="closeNav()">Stable Model</h3><p>${pretty}</p>`
        });
}

function createTogglableDetailDivForAtoms(header, elem): string {

    return `<div><h3 class="detail_atom_view_heading" onclick="toggleDetailContent(this)"><span class="detail_atom_view_heading_state">&or; </span>${header}</h3><div class="detail_atom_view_content">${make_atoms_string(elem)}</div></div>`
}


function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
    setTimeout(drawEdges, 100);
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
    setTimeout(drawEdges, 100);
}


//
// window.addEventListener("resize", (e) => {
//   connectors.forEach((c) => {
//     var ele = c.ele2;
//     var rect = ele.getBoundingClientRect();
//     c.offsets[c.ele2.id].left = e.pageX - rect.left + document.body.scrollLeft;
//     c.offsets[c.ele2.id].top = e.pageY - rect.top + document.body.scrollTop;
//
//     ele.style.left = e.pageX - c.offsets[c.ele2.id].left;
//     ele.style.top = e.pageY - c.offsets[c.ele2.id].top;
//     c.link();
//   });
// });
//

