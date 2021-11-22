import './style.css';
import './header.css';
import {initializeSearchBar} from './search/search';
import {backendURL} from "./util";
import {clearFilterPills, refreshFiltersFromBackend} from "./filter/filter";
import {redrawGraph} from "./graph/graph";
import {connectButton} from "./graph/textentry"

export function getFromSessionStorage<T>(key: string, default_value?: T): T | null {
    let returnValue = sessionStorage.getItem('showFullModel')
    if (returnValue === null && default_value !== undefined) {
        return default_value;
    }
    return JSON.parse(returnValue);
}

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
    initCheckBox();
    initializeSearchBar();
    clearFilterPills().then(redrawGraph).then(initializeSearchBar);
    refreshFiltersFromBackend()
})
