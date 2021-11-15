import './style.css';
import './header.css';
import {initializeSearchBar} from './search/search';
import {backendURL} from "./util";


function initCheckBox() {
    var checkbox = document.querySelector("input[type=checkbox]");

    checkbox.addEventListener('change', function () {
        fetch(`
    ${backendURL('settings')}/?${this.getAttribute("value")}=${this.checked}`, {
            method: "POST"
        }).then(function (r) {
            console.log(r);
        })
    });
}


document.addEventListener("DOMContentLoaded", function () {
    initCheckBox();
    initializeSearchBar();
    // clearFilterPill().then(drawGraph).then(initializeSearchBar);
})
