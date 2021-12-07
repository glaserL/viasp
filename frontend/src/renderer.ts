import {initializeSearchBar} from "./search/search";
import {redrawGraph} from "./graph/graph";
import {drawEdges} from "./graph/edges";
import {clearFilterPills, refreshFiltersFromBackend} from "./filter/filter";
import {backendURL, getFromSessionStorage} from "./util";
import './header.css';
import './style.css';

function askBackend() {
    console.log("Fetching rules internal..")
    fetch("http://localhost:8080/rules").then(function (r) {
        if (r.ok) {
            r.json().then(async function (rules) {
                console.log(rules);
            });
        }
    });
}

window.onresize = drawEdges

function initCheckBox() {
    var checkbox = document.querySelector("input[type=checkbox]") as HTMLInputElement;
    checkbox.checked = getFromSessionStorage("showFullModel", false)
    checkbox.addEventListener('click', function () {
        let currentValue = getFromSessionStorage("showFullModel", false);
        sessionStorage.setItem("showFullModel", JSON.stringify(!currentValue));
        redrawGraph()
    })
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing from rendering process..")
    const bck = backendURL("");
    console.log(bck)
    fetch(backendURL("")).then(e => console.log("Nice"))
    console.log("NICE")
    initCheckBox();
    console.log("NICER")
    clearFilterPills().then(redrawGraph).then(initializeSearchBar);
    console.log("NICEST")
    refreshFiltersFromBackend()
    console.log("Done initializing from rendering process.")
})
